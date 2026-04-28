const OpenAI = require("openai");
const { Redis } = require("@upstash/redis");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, userAnswer, userId, idealAnswer } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const isPaid = await redis.get(`paid:${userId}`);
  if (!isPaid) {
    return res.status(403).json({ error: "Premium subscription required" });
  }

  if (!userAnswer || !userAnswer.trim()) {
    return res.status(200).json({ feedback: "No answer was submitted before time ran out.", score: 0 });
  }

  const referenceBlock = idealAnswer && typeof idealAnswer === "string" && idealAnswer.trim()
    ? `\n\nReference model answer (use this to anchor your evaluation — the candidate does NOT need to match it word for word, and credit valid alternative framings):\n${idealAnswer}\n`
    : "";

  const prompt = `You are a finance interview coach. A candidate was asked the following interview question and gave the following answer.

Question: ${question}

Candidate's Answer: ${userAnswer}${referenceBlock}

Evaluate their answer and respond with ONLY a JSON object in this exact format, with no other text:
{"score": <integer 1-10>, "feedback": "<feedback text>"}

Score rubric: 1-2 fundamentally incorrect or off-topic, 3-4 significant gaps or inaccuracies, 5-6 covers basics but misses key details, 7-8 strong with minor gaps, 9-10 exceptional with full coverage and nuance.

For the feedback: 3-5 sentences, direct, written to the candidate ("you"). Cover what they got right, what they missed relative to a strong answer, and one concrete improvement. Do not quote the reference answer verbatim or tell them "the model answer says…" — speak in your own voice as a coach.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    let score = null;
    let feedback = text;
    try {
      const parsed = JSON.parse(text);
      score = parsed.score;
      feedback = parsed.feedback;
    } catch (_) {
      // fallback: treat full response as feedback, no score
    }
    res.status(200).json({ feedback, score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
