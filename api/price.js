const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);
    const amount = (price.unit_amount / 100).toFixed(2);
    const interval = price.recurring.interval;
    res.status(200).json({ amount, interval });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};