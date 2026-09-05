# DJ AI Billing Integration

Billing is provider-neutral until a merchant account is configured.

Webhook events to support:
- subscription.created
- subscription.updated
- subscription.cancelled
- invoice.paid
- invoice.payment_failed

Server-side subscription state should map to DJ plans. Payment provider signatures must be verified before changing account entitlements.

No card details should be stored by DJ AI; use the payment provider's hosted checkout/tokenization.
