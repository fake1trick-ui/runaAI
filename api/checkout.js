const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const baseUrl = `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'LUMIÈRE プレミアム会員',
            description: '高解像度AI美女画像 月額プラン',
          },
          unit_amount: 500,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/member.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/premium.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
