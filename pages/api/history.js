const { Redis } = require("@upstash/redis");
const { requireAuthenticatedUserId } = require("../../src/server/auth");
const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;

  const scope = (req.method === "GET" ? req.query?.scope : req.body?.scope) || null;

  if (scope === "ib") {
    const key = `ib_progress:${userId}`;

    if (req.method === "GET") {
      const raw = (await redis.hgetall(key)) || {};
      const progress = {};
      for (const [qid, val] of Object.entries(raw)) {
        try {
          progress[qid] = typeof val === "string" ? JSON.parse(val) : val;
        } catch {
          progress[qid] = null;
        }
      }
      return res.status(200).json({ progress });
    }

    if (req.method === "POST") {
      const { questionId, score, timestamp } = req.body || {};
      if (!questionId) return res.status(400).json({ error: "Missing questionId" });
      const payload = {
        score: score === undefined ? null : score,
        timestamp: timestamp || Date.now(),
      };
      await redis.hset(key, { [questionId]: JSON.stringify(payload) });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method === "POST") {
    const { entry } = req.body;
    if (!entry) return res.status(400).json({ error: "No history entry" });

    const key = `history:${userId}`;
    await redis.lpush(key, JSON.stringify(entry));
    await redis.ltrim(key, 0, 99); //keep last 100 entries
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const key = `history:${userId}`;
    const entries = await redis.lrange(key, 0, -1);
    return res.status(200).json({ entries: entries.map(e => typeof e === "string" ? JSON.parse(e) : e) });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
