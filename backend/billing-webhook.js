const express = require('express');
const { query } = require('./db');
const { verifyStripeSignature } = require('./billing');

const router = express.Router();
router.post('/webhook', express.raw({ type: 'application/json', limit: '256kb' }), async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!verifyStripeSignature(rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) return res.status(400).json({ error: 'Invalid Stripe signature' });
  let event; try { event = JSON.parse(rawBody); } catch { return res.status(400).json({ error: 'Invalid webhook JSON' }); }
  const object = event.data?.object || {};
  const metadata = object.metadata || {};
  const userId = metadata.user_id;
  if (userId && ['checkout.session.completed','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)) {
    const plan = metadata.plan || (object.items?.data?.[0]?.price?.id === process.env.STRIPE_PRICE_TEAM ? 'team' : 'pro');
    const status = event.type === 'customer.subscription.deleted' ? 'canceled' : (object.status || 'active');
    await query(`INSERT INTO subscriptions(user_id,provider,customer_id,subscription_id,status,plan,current_period_end) VALUES($1,'stripe',$2,$3,$4,$5,to_timestamp($6)) ON CONFLICT(user_id) DO UPDATE SET customer_id=EXCLUDED.customer_id,subscription_id=EXCLUDED.subscription_id,status=EXCLUDED.status,plan=EXCLUDED.plan,current_period_end=EXCLUDED.current_period_end,updated_at=now()`, [userId, object.customer || null, object.subscription || object.id || null, status, plan, Number(object.current_period_end || 0)]);
    await query('UPDATE users SET plan=$2,updated_at=now() WHERE id=$1', [userId, status === 'canceled' ? 'free' : plan]);
  }
  return res.json({ received: true });
});
module.exports = router;