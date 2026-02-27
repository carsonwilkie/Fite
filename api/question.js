import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type } = req.body;

  const prompt =
    type === "answer"
      ? `Give a thorough but concise answer to this finance interview question: ${req.body.question}`
      : "Give me a finance interview question. Just the question, nothing else.";

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
}