const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(200).json({ isPaid: false });
  }

  const isPaid = await redis.get(`paid:${userId}`);
  res.status(200).json({ isPaid: !!isPaid });
};