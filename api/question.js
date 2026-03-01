const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, question } = req.body;

  const categoryText = req.body.category && req.body.category !== "All"
    ? `in the field of ${req.body.category}`
    : "across any finance field including investment banking, private equity, asset management, accounting, financial modeling, valuation, or sales and trading";

  const difficultyText = req.body.difficulty ? `at a ${req.body.difficulty} difficulty level` : "";
    
  const prompt =
    type === "answer"
        ? `Give a thorough but concise answer to this finance interview question: ${question}. Format your response using markdown with bold headers and bullet points where appropriate. Do not use LaTeX or math notation — write all formulas and equations in plain text. Do not include any introductory or closing remarks — just the answer itself.`
        : `Give me a finance interview question ${categoryText} ${difficultyText}. Just the question, nothing else.`
        

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};