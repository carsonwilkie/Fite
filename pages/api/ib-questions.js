const { requireAuthenticatedUserId } = require("../../src/server/auth");
const { IB_QUESTIONS } = require("./_ibQuestions");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const userId = await requireAuthenticatedUserId(req, res);
  if (!userId) return;

  return res.status(200).json({ questions: IB_QUESTIONS });
}
