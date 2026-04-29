const Stripe = require("stripe");
const { Redis } = require("@upstash/redis");
const { requireAuthenticatedUserId, sanitizeRedirectPath } = require("../../src/server/auth");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;
  const { returnPath } = req.body || {};

  try {
    let customerId = await redis.get(`stripe_customer:${userId}`);

    if (!customerId) {
      // Search active/past-due subscriptions by userId metadata — reliable for
      // any subscriber regardless of when they signed up.
      const results = await stripe.subscriptions.search({
        query: `metadata['userId']:'${userId}'`,
        limit: 1,
      });
      const sub = results.data[0];
      if (sub?.customer) {
        customerId = sub.customer;
      } else {
        // Last-resort: scan recent checkout sessions (covers canceled/incomplete subs).
        const sessions = await stripe.checkout.sessions.list({ limit: 100 });
        const match = sessions.data.find((s) => s.metadata?.userId === userId);
        if (!match?.customer) {
          return res.status(404).json({ error: "No customer found" });
        }
        customerId = match.customer;
      }
      await redis.set(`stripe_customer:${userId}`, customerId);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}${sanitizeRedirectPath(returnPath, "/")}`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
