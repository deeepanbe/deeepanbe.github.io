const crypto = require('crypto');

function stripeConfigured() { return Boolean(process.env.STRIPE_SECRET_KEY); }

async function stripeRequest(path, params) {
  if (!stripeConfigured()) throw new Error('Stripe is not configured');
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { method: 'POST', headers: { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || 'Stripe request failed');
  return body;
}

async function createCheckoutSession({ user, plan, successUrl, cancelUrl }) {
  const price = plan === 'team' ? process.env.STRIPE_PRICE_TEAM : process.env.STRIPE_PRICE_PRO;
  if (!price) throw new Error(`No Stripe price configured for ${plan}`);
  return stripeRequest('checkout/sessions', {
    mode: 'subscription',
    customer_email: user.email,
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'metadata[user_id]': user.id,
    'metadata[plan]': plan
  });
}

function verifyStripeSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const parts = Object.fromEntries(signature.split(',').map(item => item.split('=')));
  const timestamp = parts.t;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  if (!timestamp || !parts.v1) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

module.exports = { stripeConfigured, createCheckoutSession, verifyStripeSignature };