const { Redis } = require("@upstash/redis");
const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, entry } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId" });

    const key = `history:${userId}`;
    await redis.lpush(key, JSON.stringify(entry));
    await redis.ltrim(key, 0, 99); //keep last 100 entries
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const userId = req.query?.userId || new URL(req.url, "http://localhost").searchParams.get("userId");
    if (!userId) return res.status(400).json({ error: "No userId" });

    const key = `history:${userId}`;
    const entries = await redis.lrange(key, 0, -1);
    return res.status(200).json({ entries: entries.map(e => typeof e === "string" ? JSON.parse(e) : e) });
  }

  return res.status(405).json({ error: "Method not allowed" });
};