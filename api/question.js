const openai = require("./_openai");
const { Redis } = require("@upstash/redis");
const { CATEGORIES } = require("./_constants");
const { sampleQuestions } = require("./_questionBank");

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, question, category, difficulty, math, customPrompt, userId } = req.body;

  let questionsUsed = null;

  // Check question limit for non-paid users
  if (type === "question") {
    const isPaid = userId ? await redis.get(`paid:${userId}`) : false;

    if (!isPaid) {
      const today = new Date().toISOString().split("T")[0];
      // x-real-ip is set by Vercel infrastructure and is not client-spoofable
      const clientIp = req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",").pop().trim();
      const countKey = `questions:${userId || clientIp}:${today}`;
      const count = (await redis.get(countKey)) || 0;

      if (count >= 5) {
        return res.status(403).json({ limitReached: true });
      }

      questionsUsed = await redis.incr(countKey);
      await redis.expireat(countKey, Math.floor(new Date().setHours(23, 59, 59, 999) / 1000));
    }

    // Fire-and-forget global counter — never blocks or fails the request
    redis.incr("stats:total_questions").catch(() => {});
  }

  const categoryText =
    category && category !== "All"
      ? `in the field of ${category}`
      : `across any finance field including ${CATEGORIES.map(c => c.toLowerCase()).join(", ")}`;

  const mathText = math === "With Math"
    ? "The question MUST require quantitative reasoning, specific calculations, or numerical analysis. The candidate should need to work through actual numbers or formulas to answer it."
    : "The question should be conceptual and qualitative — no math or calculations required.";

  const customText = customPrompt && customPrompt !== "undefined" && customPrompt !== ""
    ? `The question must specifically relate to: ${decodeURIComponent(customPrompt)}.`
    : "";

  const difficultyGuide = {
    Easy: "Foundational and conceptual — suitable for undergrads or first-round screens. Tests core definitions and frameworks. No multi-step reasoning required. Example style: 'What makes a good LBO candidate?'",
    Medium: "Applied and analytical — suitable for experienced analysts. Requires the candidate to walk through a process, apply a framework to a real scenario, or explain trade-offs with some specificity. May involve straightforward calculations. Example style: 'Walk me through a basic LBO model from entry to exit.'",
    Hard: "Advanced and pressure-testing — suitable for associates or final rounds. Multi-step scenarios with edge cases, conflicting constraints, or real market context baked in. Math questions must require actual calculation work with specific numbers. Conceptual questions must require deep judgment, not just textbook knowledge. Example style: 'A portfolio company is approaching a net leverage covenant and EBITDA is declining — walk me through the options and model the trade-offs.'",
  };

  const difficultyInstruction = difficultyGuide[difficulty] || difficultyGuide["Medium"];

  // Sample calibration examples from the question bank
  const examples = type === "question"
    ? sampleQuestions(category, difficulty, math, 3)
    : [];

  const examplesBlock = examples.length > 0
    ? `\nHere are ${examples.length} real example questions at this exact difficulty level — use them to calibrate tone, depth, and specificity. Generate a DIFFERENT question; do not repeat these:\n${examples.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
    : "";

  const systemPrompt = `You are a senior interviewer at a top-tier Wall Street firm conducting a real finance interview. You ask sharp, specific, scenario-based questions that test genuine understanding — not memorized definitions. Your questions reference real deal structures, specific metrics, market conditions, and edge cases. You vary your question formats: sometimes you open with a scenario ("A company has $100M EBITDA and..."), sometimes a comparison ("How would you differentiate..."), sometimes a pressure test ("What would you do if..."), sometimes a walk-through ("Take me through how you'd..."). You never ask vague or generic questions.`;

  const prompt =
    type === "answer"
      ? `Provide a thorough, interview-quality answer to this finance question: ${question}\n\nFormat your response using markdown with bold headers and bullet points where appropriate. Write all formulas and equations in plain text — no LaTeX. Lead with the core answer, then add depth and nuance. Do not include any introductory or closing remarks — just the answer itself.`
      : `Generate a single ${difficulty}-level finance interview question ${categoryText}.\n\nDifficulty standard: ${difficultyInstruction}\n\n${mathText}\n${customText}${examplesBlock}\nAdditional requirements:\n- Be specific: include real metrics, deal sizes, named instruments, or market conditions where they add realism\n- Do not start every question with "Walk me through" — vary the opening\n- Do not ask simple definition questions (e.g., not "What is EBITDA?" — instead ask something that requires applying the concept)\n- The question should feel like it came from a real interviewer, not a textbook\n\nReturn only the question itself, nothing else.`;

  try {
    if (type === "question" && req.body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: true,
      });

      let fullText = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullText += delta;
          res.write(`data: ${JSON.stringify({ delta, text: fullText })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true, text: fullText, ...(questionsUsed !== null && { questionsUsed, questionsLimit: 5 }) })}\n\n`);
      res.end();
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0].message.content;
    res.status(200).json({ result: text, ...(questionsUsed !== null && { questionsUsed, questionsLimit: 5 }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};