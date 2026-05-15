const { Redis } = require("@upstash/redis");
const { requireAuthenticatedUserId } = require("../../src/server/auth");
const { IB_QUESTIONS } = require("./_ibQuestions");

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;

  const isPaid = await redis.get(`paid:${userId}`);
  if (!isPaid) return res.status(403).json({ error: "Premium required" });

  return res.status(200).json({ questions: IB_QUESTIONS });
};
