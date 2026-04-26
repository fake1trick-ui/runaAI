const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session_id, customer_id } = req.query;

  try {
    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.status === 'complete') {
        return res.json({ valid: true, customer_id: session.customer });
      }
    }

    if (customer_id) {
      const subs = await stripe.subscriptions.list({
        customer: customer_id,
        status: 'active',
        limit: 1,
      });
      if (subs.data.length > 0) {
        return res.json({ valid: true, customer_id });
      }
    }

    res.json({ valid: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
