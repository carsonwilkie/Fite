const { Redis } = require("@upstash/redis");
const { requireAuthenticatedUserId } = require("../../src/server/auth");
const { clerkClient } = require("@clerk/nextjs/server");

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;

  try {
    // Remove all user data from Redis before deleting the Clerk user.
    await Promise.allSettled([
      redis.del(`paid:${userId}`),
      redis.del(`stripe_customer:${userId}`),
      redis.del(`history:${userId}`),
      redis.del(`ib_progress:${userId}`),
    ]);

    // Delete the Clerk user — this revokes all sessions and OAuth tokens
    // (including Sign in with Apple and Google) on Clerk's side.
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("delete-account error:", error);
    return res.status(500).json({ error: "Failed to delete account. Please try again." });
  }
};
