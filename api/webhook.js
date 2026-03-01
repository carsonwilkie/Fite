const Stripe = require("stripe");
const { Redis } = require("@upstash/redis");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = Redis.fromEnv();

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async function handler(req, res) {
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
    await redis.del(`paid:${userId}`);
  }

  res.status(200).json({ received: true });
};