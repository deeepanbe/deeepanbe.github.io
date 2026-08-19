# DJ AI Beta Safety Gate

Do not invite public users until all required production checks pass.

## Required
- HTTPS backend
- Production PostgreSQL + pgvector
- Unique tenant scoping for every private query
- Email verification enabled
- JWT secret configured with strong random value
- Turnstile server verification enabled
- Rate limits enabled
- AI provider spending/usage limits configured
- Request and output limits configured
- No API keys in frontend or repository
- Automated tests passing
- Database backups configured
- Basic uptime/error monitoring configured
- Privacy policy and terms prepared before collecting real customer data

## Beta data policy
Only collect the minimum customer information required to provide the service. Do not use customer documents or conversations to train or improve a model automatically. Product improvement should use reviewed, minimized, and appropriately consented feedback/evaluation data.

## Rollback
If AI cost, security, latency, or data-isolation problems are detected, disable public signup and return the system to local/offline mode while the issue is investigated.