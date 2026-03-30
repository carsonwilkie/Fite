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

Evaluate their answer and respond with ONLY a JSON object in this exact format, with no other text:
{"score": <integer 1-10>, "feedback": "<feedback text>"}

Score rubric: 1-2 fundamentally incorrect or off-topic, 3-4 significant gaps or inaccuracies, 5-6 covers basics but misses key details, 7-8 strong with minor gaps, 9-10 exceptional with full coverage and nuance.

For the feedback: 3-5 sentences, direct. Cover what they got right, what they missed, and one improvement suggestion. Write directly to the candidate.`;

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