import Stripe from "stripe";
import { Redis } from "@upstash/redis";

// Unified billing webhook. Handles two providers on one route to stay
// under Vercel Hobby's 12-function cap:
//   • Stripe checkout/subscription events (web + Android purchases)
//   • RevenueCat purchase/renewal events  (iOS in-app purchases)
//
// Stripe signs requests; RevenueCat uses a shared-secret Authorization header
// configured in the RC dashboard.
//
// Stripe needs the raw request body for signature verification, so we read
// the body manually and JSON-parse for the RevenueCat branch.
export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = Redis.fromEnv();

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// ── RevenueCat helpers ───────────────────────────────────────────────────────
const RC_GRANT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
]);

const RC_REVOKE_TYPES = new Set([
  "EXPIRATION",
  "BILLING_ISSUE",
  "SUBSCRIPTION_PAUSED",
]);

async function handleRevenueCat(req, res, buf) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected) {
    console.error("REVENUECAT_WEBHOOK_AUTH not set");
    return res.status(500).json({ error: "Webhook not configured" });
  }
  if ((req.headers["authorization"] ?? "") !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let payload;
  try {
    payload = JSON.parse(buf.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const event = payload?.event;
  if (!event || typeof event !== "object") {
    return res.status(400).json({ error: "Missing event" });
  }

  const type = event.type;
  const userId = event.app_user_id || event.original_app_user_id;

  if (type === "TEST") {
    console.log("RevenueCat test event received");
    return res.status(200).json({ received: true, test: true });
  }

  if (!userId) {
    console.warn("RevenueCat webhook missing user id", { type });
    return res.status(200).json({ received: true, skipped: "no-user" });
  }

  if (RC_GRANT_TYPES.has(type)) {
    console.log("RevenueCat grant:", type, "→", userId);
    await redis.set(`paid:${userId}`, "true");
    return res.status(200).json({ received: true, action: "granted" });
  }

  if (RC_REVOKE_TYPES.has(type)) {
    console.log("RevenueCat revoke:", type, "→", userId);
    await redis.del(`paid:${userId}`);
    return res.status(200).json({ received: true, action: "revoked" });
  }

  if (type === "CANCELLATION") {
    // User cancelled but still has access until expiration_at_ms.
    // Do not revoke; EXPIRATION will fire later.
    console.log("RevenueCat cancellation (access retained until expiry):", userId);
    return res.status(200).json({ received: true, action: "noop-cancel" });
  }

  if (type === "TRANSFER") {
    const expiresAt = Number(event.expiration_at_ms ?? 0);
    if (expiresAt > Date.now()) {
      await redis.set(`paid:${userId}`, "true");
      return res.status(200).json({ received: true, action: "transfer-grant" });
    }
    await redis.del(`paid:${userId}`);
    return res.status(200).json({ received: true, action: "transfer-revoke" });
  }

  console.log("RevenueCat unhandled event type:", type);
  return res.status(200).json({ received: true, action: "ignored" });
}

// ── Stripe handler ───────────────────────────────────────────────────────────
async function handleStripe(req, res, buf) {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    console.log("Marking user as paid:", userId);
    await redis.set(`paid:${userId}`, "true");
    if (session.customer) {
      await redis.set(`stripe_customer:${userId}`, session.customer);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const userId = subscription.metadata.userId;
    console.log("Removing paid status:", userId);
    await redis.del(`paid:${userId}`);
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const userId = subscription.metadata.userId;
    if (subscription.cancel_at_period_end) {
      console.log("Subscription scheduled to cancel:", userId);
      await redis.del(`paid:${userId}`);
    }
  }

  return res.status(200).json({ received: true });
}

// ── Dispatcher ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);

  // Branch on which provider sent the request. Stripe signs every event with
  // its own header; RevenueCat sends the shared-secret Authorization header
  // we configured in its dashboard.
  if (req.headers["stripe-signature"]) {
    return handleStripe(req, res, buf);
  }
  if (req.headers["authorization"]) {
    return handleRevenueCat(req, res, buf);
  }

  return res.status(400).json({ error: "Unknown webhook source" });
}
