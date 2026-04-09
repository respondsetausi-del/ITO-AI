export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;

  const plans = {
    basic: { amount: 19900, description: 'AIP Solutions Basic — Monthly Subscription' },
    pro: { amount: 49900, description: 'AIP Solutions Pro — Monthly Subscription' },
  };

  const selected = plans[plan];
  if (!selected) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: selected.amount,
        currency: 'ZAR',
        metadata: { plan: plan, product: 'AIP Solutions Subscription' },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Checkout creation failed' });
    }

    return res.status(200).json({ id: data.id, redirectUrl: data.redirectUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
