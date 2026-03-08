const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, userAnswer } = req.body;

  const prompt = `You are a finance interview coach. A candidate was asked the following interview question and gave the following answer.

Question: ${question}

Candidate's Answer: ${userAnswer}

Give brief, direct written feedback on their answer. Cover: what they got right, what they missed or got wrong, and one specific suggestion to improve. Be concise — 3-5 sentences total. Do not give a score or grade. Write as if you are speaking directly to the candidate.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = completion.choices[0].message.content;
    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};