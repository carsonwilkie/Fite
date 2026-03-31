const OpenAI = require("openai");
const { Redis } = require("@upstash/redis");
const { CATEGORIES } = require("./constants");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      const countKey = `questions:${userId || req.headers["x-forwarded-for"]}:${today}`;
      const count = (await redis.get(countKey)) || 0;

      if (count >= 5) {
        return res.status(403).json({ limitReached: true });
      }

      questionsUsed = await redis.incr(countKey);
      await redis.expireat(countKey, Math.floor(new Date().setHours(23, 59, 59, 999) / 1000));
    }
  }

  const categoryText =
    category && category !== "All"
      ? `in the field of ${category}`
      : `across any finance field including ${CATEGORIES.map(c => c.toLowerCase()).join(", ")}`;

  const difficultyText = difficulty ? `at a ${difficulty} difficulty level` : "";
  
  const mathText = math === "With Math"
    ? "The question should involve quantitative analysis, calculations, or mathematical reasoning."
    : "The question should be conceptual and not require any math or calculations.";

  const customText = customPrompt && customPrompt !== "undefined" && customPrompt !== ""
    ? `The question should specifically relate to: ${decodeURIComponent(customPrompt)}.`
    : "";

  const prompt =
    type === "answer"
      ? `Give a thorough but concise answer to this finance interview question: ${question}. Format your response using markdown with bold headers and bullet points where appropriate. Do not use LaTeX or math notation — write all formulas and equations in plain text. Do not include any introductory or closing remarks — just the answer itself.`
      : `Give me a specific, technical finance interview question ${categoryText} ${difficultyText}. The question should be detailed and scenario-based rather than a simple definition question. For example, instead of "what is a DCF?" ask something like "walk me through how you would build a DCF for a company with negative free cash flow." ${customText} ${mathText} Just the question, nothing else.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    res.status(200).json({ result: text, ...(questionsUsed !== null && { questionsUsed, questionsLimit: 5 }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};