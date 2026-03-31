const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { scenario, questions, category, difficulty } = req.body;
  // questions: [{ question, idealAnswer, userAnswer, score, feedback }]

  const questionSummary = questions.map((q, i) =>
    `Q${i + 1} (score ${q.score}/10): ${q.question}\nCandidate answered: ${q.userAnswer || "[no answer]"}`
  ).join("\n\n");

  const prompt = `You are a senior ${category} interviewer debriefing a candidate after a full interview session.

Scenario: ${scenario}
Difficulty: ${difficulty}

Interview summary:
${questionSummary}

Write a concise debrief (4-6 sentences) that covers:
1. Overall impression of the candidate's performance across all 4 questions
2. Their strongest moment and their weakest moment
3. One concrete area to improve and why it matters in ${category} interviews

Write directly to the candidate. Be honest and constructive — not generic. Avoid just repeating their scores.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({ feedback: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
