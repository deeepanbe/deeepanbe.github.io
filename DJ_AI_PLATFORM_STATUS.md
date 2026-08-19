# DJ AI Platform — implementation status

## What is implemented in this branch

### Phase 1 — Security foundation
- Server-side OpenAI API access
- Cloudflare Turnstile verification
- CORS allowlist
- security headers
- IP/session rate limiting
- bounded requests
- secret-free frontend
- automated backend tests

### Phase 2 — AI provider layer
- OpenAI Responses API provider
- Anthropic HTTP provider
- Gemini HTTP provider
- provider abstraction
- OpenAI embeddings for RAG

### Phase 3 — Accounts
- email/password registration
- bcrypt password hashing
- email verification token
- JWT access tokens
- verified-user middleware

### Phase 4 — Multi-tenancy / database
- PostgreSQL schema
- users
- workspaces
- workspace members and roles
- conversations
- messages
- usage events
- subscriptions
- tenant-scoped queries

### Phase 5 — Persistent memory
- user memories
- embeddings
- semantic memory search
- conversation history persistence

### Phase 6 — RAG
- text document ingestion
- chunking
- vector embeddings
- pgvector similarity search
- workspace isolation

### Phase 7 — Agents
- safe calculator tool
- agent endpoint
- model-backed agent mode
- usage event tracking

### Phase 8 — Provider routing
- provider abstraction supports OpenAI / Anthropic / Gemini
- environment-driven provider selection

### Phase 9 — Billing
- Stripe checkout session adapter
- signed webhook verification
- plan/subscription persistence
- free/pro/team plan model

### Phase 10 — Web platform
- signup
- login
- email verification
- customer dashboard
- workspace creation
- conversation management
- document indexing
- agent interface
- billing page

### Phase 11 — Browser extension
- Manifest V3 scaffold
- secret-free extension architecture
- backend URL configuration

### Phase 12 — Android
- Jetpack Compose starter
- shared API architecture
- no provider/backend secrets in the client

### Phase 13 — Operations
- Dockerfile
- Docker Compose with PostgreSQL + pgvector
- CI tests
- environment template
- deployment documentation

## Required external setup

The code is ready, but these actions require credentials/accounts owned by the project operator:

1. Create a production PostgreSQL/pgvector database and run `backend/migrations/001_platform.sql`.
2. Deploy `backend/` to a Node 22 host.
3. Add environment variables from `backend/.env.example`.
4. Create Cloudflare Turnstile site/secret keys.
5. Configure Resend (or another transactional email provider) for verification emails.
6. Create Stripe products/prices and configure webhook URL `/billing/webhook`.
7. Set the frontend `BACKEND_URL` and public `TURNSTILE_SITE_KEY` in `dj/dj-config.js` during deployment.
8. Configure Android signing/Google Play credentials for release.

No production secret should ever be committed to this repository.
