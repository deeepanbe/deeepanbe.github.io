# SaaS API contract

Core endpoints:
- GET /health
- GET /api/repos
- GET /api/utility-summary
- POST /api/agent/task
- POST /api/agent/generate
- POST /api/agent/validate
- GET /api/agent/next
- GET /api/evaluate

Multi-user requirement: every authenticated request resolves an account and checks repository ownership/authorization before accessing GitHub data.

Billing requirement: plan limits are enforced server-side; never trust client-supplied plan or usage values.
