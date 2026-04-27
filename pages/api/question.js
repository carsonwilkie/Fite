const openai = require("./_openai");
const { Redis } = require("@upstash/redis");
const { CATEGORIES } = require("./_constants");
const { sampleQuestions } = require("./_questionBank");

const redis = Redis.fromEnv();

// ─── Question format definitions ────────────────────────────────────────────
// Each format describes a distinct structural style for a finance interview question.
// One is selected randomly per request and injected into the prompt to maximize variety.
const QUESTION_FORMATS = {
  "scenario":      "Open with a specific financial situation, deal structure, or company — give the candidate something concrete to react to (e.g., 'A company has $100M EBITDA and…', 'You're advising a client who…', 'A portfolio company is approaching a covenant breach…')",
  "pitch":         "Ask the candidate to recommend, argue for, or defend a position — they must have and express a view (e.g., 'Pitch me a stock', 'Would you rather own X or Y?', 'Make the case for entering this market')",
  "walk-through":  "Ask the candidate to walk through a process, methodology, or analytical framework step by step, explaining each stage and the reasoning behind it",
  "comparison":    "Frame the question around comparing two alternatives — instruments, strategies, companies, capital structures, or approaches — and explaining the trade-offs and when you'd choose each",
  "pressure-test": "Present a constraint, an edge case, or conflicting data and ask the candidate what they would do or how they'd think through it (e.g., 'The model needs 20% IRR but the auction is at 13x — what do you do?')",
};

// ─── Negative examples (too generic — never generate questions like these) ──
const NEGATIVE_EXAMPLES = [
  "What is EBITDA?",
  "What does DCF stand for?",
  "Why do you want to work in finance?",
  "Can you explain what a P/E ratio is?",
  "What is the difference between stocks and bonds?",
  "What is working capital?",
  "Define depreciation.",
];

// ─── Market context — update each quarter ────────────────────────────────────
// Injected into the system prompt to make Hard questions feel timely and grounded.
const MARKET_CONTEXT = `Current market context (Q2 2026): The Fed is in a gradual easing cycle after several years of elevated rates; the federal funds rate has come off its highs and markets are pricing in continued cuts. Credit spreads have tightened significantly from their 2023 wides. Private equity deal flow is recovering after a muted 2023–2024, with LBO financing becoming more accessible. M&A activity is accelerating, particularly in technology, healthcare, and financial services. Public equity valuations remain elevated relative to historical averages, with AI-related names commanding substantial premiums. The dollar has been range-bound and emerging market assets are attracting renewed interest as the rate cycle turns.`;

const FORMAT_KEYS = Object.keys(QUESTION_FORMATS);

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

  const isOTG = difficulty === "OTG";

  const difficultyGuide = {
    Easy: "Foundational and conceptual — suitable for undergrads or first-round screens. Tests core definitions and frameworks. No multi-step reasoning required. Example style: 'What makes a good LBO candidate?'",
    Medium: "Applied and analytical — suitable for experienced analysts. Requires the candidate to walk through a process, apply a framework to a real scenario, or explain trade-offs with some specificity. May involve straightforward calculations. Example style: 'Walk me through a basic LBO model from entry to exit.'",
    Hard: "Advanced and pressure-testing — suitable for associates or final rounds. Multi-step scenarios with edge cases, conflicting constraints, or real market context baked in. Math questions must require actual calculation work with specific numbers. Conceptual questions must require deep judgment, not just textbook knowledge. Example style: 'A portfolio company is approaching a net leverage covenant and EBITDA is declining — walk me through the options and model the trade-offs.'",
  };

  const difficultyInstruction = difficultyGuide[difficulty] || difficultyGuide["Medium"];

  // Randomly select a question format to enforce variety across requests
  const targetFormat = FORMAT_KEYS[Math.floor(Math.random() * FORMAT_KEYS.length)];

  // OTG questions don't use the question bank, formats, or negative examples.
  const { questions: examples, selectedFormat } = type === "question" && !isOTG
    ? sampleQuestions(category, difficulty, math, 5, targetFormat)
    : { questions: [], selectedFormat: null };

  const examplesBlock = examples.length > 0
    ? `\nHere are ${examples.length} real example questions at this exact difficulty level — use them to calibrate tone, depth, and specificity. Generate a DIFFERENT question; do not repeat these:\n${examples.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
    : "";

  const formatInstruction = !isOTG && selectedFormat && QUESTION_FORMATS[selectedFormat]
    ? `\nQuestion format — structure your question in this style:\n${QUESTION_FORMATS[selectedFormat]}\n`
    : "";

  const negativeBlock = isOTG
    ? ""
    : `\nDo NOT generate questions like these — they are too generic or definitional:\n${NEGATIVE_EXAMPLES.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`;

  const isOTGMath = isOTG && math === "With Math";

  const otgSystemPrompt = isOTGMath
    ? `You are a finance coach testing quick mental-math instincts. Ask short, punchy questions that require the candidate to work through a calculation or estimate out loud — no pen and paper, just clear thinking. Each question gives them a specific number to work with. Keep every question under 30 words. Vary the opening word.`
    : `You are a friendly finance coach asking quick on-the-go questions to keep someone's brain sharp between real prep sessions. Each question is a single short line, conversational and punchy — no scenarios, no setups, no preamble. You mix three styles: (1) bite-size definitions ("Define beta in one sentence."), (2) quick term comparisons ("LIFO vs FIFO — what's the difference?"), and (3) finance or logic brain-teasers in the spirit of "How would you find a needle in a haystack if you got to use any one tool?". Keep every question under or around 25 words. Vary the opening word.`;

  const systemPrompt = isOTG
    ? otgSystemPrompt
    : `You are a senior interviewer at a top-tier Wall Street firm conducting a real finance interview. You ask sharp, specific, scenario-based questions that test genuine understanding — not memorized definitions. Your questions reference real deal structures, specific metrics, market conditions, and edge cases. You vary your question formats: sometimes you open with a scenario ("A company has $100M EBITDA and..."), sometimes a comparison ("How would you differentiate..."), sometimes a pressure test ("What would you do if..."), sometimes a walk-through ("Take me through how you'd..."), sometimes a pitch ("Make the case for..."). You never ask vague or generic questions.\n\n${MARKET_CONTEXT}`;

  const otgMathPrompt = `Generate a single short mental-math or quick-estimation question ${categoryText}.\n\nHard rules:\n- Maximum 30 words. Give them specific numbers to work with.\n- The question should reveal how someone thinks through a calculation, not test memorized formulas.\n- Mix these styles at random:\n  • Straightforward arithmetic with finance-relevant numbers ("What's 100 million times 0.38 percent?")\n  • Quick mental estimation ("A company does $2.4B in revenue annually — what's that per month? Per week?")\n  • Back-of-envelope sanity checks ("If a company trades at 12x EBITDA and EBITDA is $85M, what's the implied equity value assuming $200M of net debt?")\n  • Percentage / ratio problems ("A stock drops 40% and then rises 40% — are you up or down, and by how much?")\n- Return only the question itself, nothing else.`;

  const otgPrompt = isOTGMath
    ? otgMathPrompt
    : `Generate a single short on-the-go finance question ${categoryText}.\n\nHard rules:\n- Maximum 25 words. Aim for under 15.\n- Single sentence. Conversational. No scenario setup, no numbers heavy enough to need pen and paper.\n- Pick one style at random: a quick definition, a one-line term comparison, or a finance/logic brain-teaser.\n- Brain-teaser examples for tone:\n  • "How would you find a needle in a haystack if you got to use any one tool?"\n  • "If every public company suddenly went private overnight, what breaks first?"\n  • "Why might a company with rising revenue still be a worse business than last year?"\n- Definition / comparison examples for tone:\n  • "Define beta in one sentence."\n  • "LIFO vs FIFO — what's the difference in one line?"\n  • "What does it mean for a bond to trade at a discount?"\nReturn only the question itself, nothing else.`;

  const prompt =
    type === "answer"
      ? `Provide a thorough, interview-quality answer to this finance question: ${question}\n\nFormat your response using markdown with bold headers and bullet points where appropriate. Write all formulas and equations in plain text — no LaTeX. Lead with the core answer, then add depth and nuance. Do not include any introductory or closing remarks — just the answer itself.`
      : isOTG
        ? otgPrompt
        : `Generate a single ${difficulty}-level finance interview question ${categoryText}.\n\nDifficulty standard: ${difficultyInstruction}\n\n${mathText}\n${customText}${formatInstruction}${examplesBlock}${negativeBlock}\nAdditional requirements:\n- Be specific: include real metrics, deal sizes, named instruments, or market conditions where they add realism\n- Do not start every question with "Walk me through" — vary the opening\n- The question should feel like it came from a real interviewer at a top firm, not a textbook\n\nReturn only the question itself, nothing else.`;

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
