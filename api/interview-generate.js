const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { category: rawCategory, difficulty, math, customPrompt } = req.body;

  const { CATEGORIES: ALL_CATEGORIES } = require("./_constants");
  const category = (!rawCategory || rawCategory === "All")
    ? ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)]
    : rawCategory;

  const mathNote = math === "With Math" ? " Include quantitative/numerical elements where appropriate." : " Keep it qualitative — no calculations required.";
  const promptNote = customPrompt && customPrompt !== "undefined" ? ` Focus on: ${customPrompt}.` : "";

  const prompt = `You are a senior interviewer at a top ${category} firm conducting a real interview. Generate a realistic interview scenario and a structured sequence of 4 questions (initial + 3 follow-ups) that probe the candidate's thinking.${mathNote}${promptNote}

Difficulty: ${difficulty}

Requirements:
- The scenario should be a concrete, realistic situation (e.g., a specific company, deal, market event, or financial problem) that's directly relevant to ${category}
- The 4 questions must form a logical progression — each follow-up builds on the previous answer
- The ideal answers should reflect what a top candidate would say
- The interviewer's tone should be professional but direct

Respond with ONLY a JSON object in this exact format, no other text:
{
  "scenario": "<2-4 sentence scenario description setting up the interview context>",
  "questions": [
    { "question": "<opening question>", "idealAnswer": "<what a strong candidate would say, 3-5 sentences>" },
    { "question": "<follow-up 1>", "idealAnswer": "<ideal answer>" },
    { "question": "<follow-up 2>", "idealAnswer": "<ideal answer>" },
    { "question": "<follow-up 3>", "idealAnswer": "<ideal answer>" }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    const parsed = JSON.parse(text);
    res.status(200).json({ ...parsed, resolvedCategory: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
