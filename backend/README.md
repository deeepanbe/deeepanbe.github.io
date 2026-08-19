# DJ AI Backend — Multi-user AI Platform

This service is the secure backend for the DJ AI platform. Provider credentials stay server-side; browser traffic is protected with CORS, Turnstile, rate limits, and bounded inputs. PostgreSQL + pgvector provide accounts, workspaces, conversations, memory, RAG and usage persistence.

## Architecture

```text
Web / Android / Extension
        │ HTTPS
        ▼
Node 22 + Express
  ├─ Turnstile / rate limits / CORS
  ├─ Auth + verified accounts
  ├─ Workspace tenant isolation
  ├─ Conversations + memory
  ├─ RAG / pgvector
  ├─ Agent tools
  ├─ Usage + billing
  └─ AI provider router
       ├─ OpenAI
       ├─ Anthropic
       └─ Gemini
```

## Local setup

### Option A — Docker

1. `cp .env.example .env`
2. Set at least `OPENAI_API_KEY`, `JWT_SECRET`, `TURNSTILE_SECRET` and `CORS_ORIGINS`.
3. `docker compose up --build`
4. API: `http://localhost:8787`

The compose stack includes PostgreSQL with pgvector and automatically runs `migrations/001_platform.sql` on first database creation.

### Option B — Node

1. `npm install`
2. Configure `.env` and a PostgreSQL/pgvector database.
3. Run `npm test`.
4. Run `npm start`.

Never commit `.env` or production secrets.

## Core endpoints

### Public

- `GET /health`
- `POST /chat` — public chat with Turnstile verification
- `POST /auth/register`
- `GET /auth/verify?token=...`
- `POST /auth/login`

### Authenticated

Send `Authorization: Bearer <access_token>`.

- `GET /auth/me`
- `GET/POST /workspaces`
- `GET/POST /conversations`
- `GET /conversations/:id/messages`
- `POST /memory`
- `GET /memory/search?q=...`
- `POST /documents` — text ingestion/chunking/embedding
- `GET /rag/search`
- `POST /agent/run`
- `GET /usage`
- `POST /billing/checkout`

### Stripe

- `POST /billing/webhook`

The webhook is mounted before the JSON parser and verifies the Stripe signature against the raw request body.

## Data model

`users → workspaces → workspace_members → conversations → messages`

User/workspace memory and document chunks are embedded into pgvector. Queries always scope private data by authenticated user/workspace ownership.

## Security

- No backend secret is accepted from the browser.
- No OpenAI/Anthropic/Gemini credential is shipped to clients.
- Turnstile is verified server-side.
- CORS is an origin allowlist, not authentication.
- Passwords use bcrypt.
- Access tokens are signed JWTs with an issuer and expiry.
- Vector searches are tenant-scoped.
- Stripe webhooks are HMAC-verified and timestamp-bounded.
- Rate limits apply to chat and authentication endpoints.
- Input sizes are bounded.

## Providers

Set `AI_PROVIDER=openai`, `anthropic`, or `gemini`. OpenAI uses the Responses API; embeddings use `text-embedding-3-small` by default. Provider-specific credentials remain backend-only.

## Email verification

Production registration requires `RESEND_API_KEY` and `EMAIL_FROM`. In non-production mode, the API returns a verification URL to make local development easy.

## Frontend

`dj/dj-config.js` contains only public configuration. `app/dj-platform.js` is the web client for account/workspace/memory/RAG/agent/billing APIs. `dashboard.html`, `login.html`, `signup.html`, `verify-email.html`, and `billing.html` provide the first customer UI.

## Client apps

- `extension/` — Manifest V3 browser extension scaffold.
- `android/` — Jetpack Compose Android starter using the same backend contract.

Production Android signing, Play Console publishing, extension-store publishing, and third-party account setup require owner credentials and cannot be completed safely from GitHub source code alone.

## Full status

See `../DJ_AI_PLATFORM_STATUS.md` for the phase-by-phase implementation status and the remaining deployment credentials/setup.