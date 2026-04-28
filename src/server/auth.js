const { getAuth, clerkClient } = require("@clerk/nextjs/server");

function getAuthenticatedUserId(req) {
  const { userId } = getAuth(req);
  return userId || null;
}

function requireAuthenticatedUserId(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return userId;
}

async function getAuthenticatedUserEmail(userId) {
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primaryId = user.primaryEmailAddressId;
  return (
    user.emailAddresses?.find((email) => email.id === primaryId)?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null
  );
}

async function getAuthenticatedUserProfile(userId) {
  if (!userId) return { userId: null, email: null, name: null };
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primaryId = user.primaryEmailAddressId;
  const email = (
    user.emailAddresses?.find((item) => item.id === primaryId)?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null
  );
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.firstName || null;
  return { userId, email, name };
}

function sanitizeRedirectPath(value, fallback = "/") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://fitefinance.local");
    if (parsed.origin !== "https://fitefinance.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (_) {
    return fallback;
  }
}

module.exports = {
  getAuthenticatedUserId,
  getAuthenticatedUserEmail,
  getAuthenticatedUserProfile,
  requireAuthenticatedUserId,
  sanitizeRedirectPath,
};
