import Stripe from "stripe";
import { Redis } from "@upstash/redis";

// Stripe webhook signature verification requires the raw request body.
// Next.js pages/api parses bodies by default — disable it for this route.
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);
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

  res.status(200).json({ received: true });
}
