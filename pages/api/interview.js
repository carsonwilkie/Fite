const openai = require("./_openai");
const { Redis } = require("@upstash/redis");
const { CATEGORIES: ALL_CATEGORIES } = require("./_constants");
const { sampleQuestions } = require("./_questionBank");

const redis = Redis.fromEnv();

async function handleGenerate(req, res) {
  const { category: rawCategory, difficulty, math, customPrompt } = req.body;

  const category = (!rawCategory || rawCategory === "All")
    ? ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)]
    : rawCategory;

  const mathNote = math === "With Math" ? " Include quantitative/numerical elements where appropriate." : " Keep it qualitative — no calculations required.";
  const promptNote = customPrompt && customPrompt !== "undefined" ? ` Focus on: ${customPrompt}.` : "";

  const examples = sampleQuestions(category, difficulty, math, 2);
  const examplesBlock = examples.length > 0
    ? `\nHere are ${examples.length} example questions at this difficulty level — use them to calibrate the tone, depth, and specificity of your questions. Do not repeat them:\n${examples.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
    : "";

  const prompt = `You are a senior interviewer at a top ${category} firm conducting a real interview. Generate a realistic interview scenario and a structured sequence of 4 questions (initial + 3 follow-ups) that probe the candidate's thinking.${mathNote}${promptNote}${examplesBlock}

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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0].message.content;
  const clean = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(clean);
  redis.incrby("stats:total_questions", 4).catch(() => {});
  res.status(200).json({ ...parsed, resolvedCategory: category });
}

async function handleRespond(req, res) {
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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0].message.content;
  const clean = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(clean);
  res.status(200).json(parsed);
}

async function handleDebrief(req, res) {
  const { scenario, questions, category, difficulty } = req.body;

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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({ feedback: completion.choices[0].message.content });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action } = req.body || {};

  try {
    if (action === "generate") return await handleGenerate(req, res);
    if (action === "respond")  return await handleRespond(req, res);
    if (action === "debrief")  return await handleDebrief(req, res);
    return res.status(400).json({ error: "Invalid or missing action. Use 'generate', 'respond', or 'debrief'." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
