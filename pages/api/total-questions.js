const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.ADMIN_SECRET;
  if (secret && req.headers["x-admin-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const total = (await redis.get("stats:total_questions")) || 0;
  res.status(200).json({ total: Number(total) });
};
