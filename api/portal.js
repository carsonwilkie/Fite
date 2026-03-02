const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const session = sessions.data.find(s => s.metadata?.userId === userId);

    if (!session?.customer) {
      return res.status(404).json({ error: "No customer found" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.customer,
      return_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};