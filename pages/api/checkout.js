const Stripe = require("stripe");
const { getAuthenticatedUserEmail, requireAuthenticatedUserId } = require("../../src/server/auth");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;

  try {
    const email = await getAuthenticatedUserEmail(userId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      allow_promotion_codes: true,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
