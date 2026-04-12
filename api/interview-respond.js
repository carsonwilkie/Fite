const openai = require("./_openai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { scenario, questionIndex, question, idealAnswer, userAnswer, isLast } = req.body;

  const blankAnswer = !userAnswer || !userAnswer.trim();

  const prompt = `You are a senior interviewer conducting a finance interview. Here is the context:

Scenario: ${scenario}

Question ${questionIndex + 1}: ${question}

Ideal Answer (internal reference only — do not reveal this directly): ${idealAnswer}

Candidate's Response: ${blankAnswer ? "[No answer provided — candidate did not respond]" : userAnswer}

${blankAnswer
  ? `The candidate did not submit an answer. Score them 0. Respond as an interviewer would — acknowledge the silence briefly, then explain what a strong candidate would have covered for this question. Keep it concise and professional.`
  : `Evaluate the candidate's response against the ideal answer. Determine if they are on the right track.

If on track (score 7-10): Acknowledge what they got right in 1-2 sentences (be specific, not generic). ${isLast ? "Close the interview professionally." : "Then naturally transition to the next topic with a brief bridging sentence."}
If off track (score 1-6): In 2-3 sentences, acknowledge any valid points, then explain where their thinking diverged and what the right approach would have been. Be direct but constructive — like a good interviewer would. ${isLast ? "Then close the interview." : "Then transition forward."}`}

Respond with ONLY a JSON object, no other text:
{
  "score": <integer 1-10, or 0 if no answer>,
  "onTrack": <true if score >= 7, false otherwise>,
  "response": "<your conversational response as the interviewer, 2-4 sentences>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
