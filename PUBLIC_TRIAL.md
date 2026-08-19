# DJ AI Public Trial

## Goal

The public website can remain on GitHub Pages while the AI backend runs as a separate HTTPS service. The current DJ AI backend already exposes a public `/chat` route protected by Cloudflare Turnstile and rate limiting. Authenticated users can later receive persistent conversations, memory, RAG, documents, agent runs, usage and billing.

## Recommended trial architecture

```text
Visitor
  |
  v
https://deeepanbe.github.io
  |
  | DJ AI chat request
  v
Render Node/Express API
  |
  +--> OpenAI / selected AI provider
  |
  +--> Render PostgreSQL + pgvector
  |
  +--> Cloudflare Turnstile
```

Render supports public Node/Express web services and can provide a public `onrender.com` URL. Free web services are suitable for testing, but they spin down after 15 minutes of inactivity and can take about a minute to wake. Free Render Postgres is also intended for testing and expires after 30 days, so move the database to a paid plan before treating the service as production. See the official Render documentation for current limits.

## One-time setup

### 1. Deploy the backend

Use the repository's `render.yaml` as a Render Blueprint. It creates:

- `dj-ai-api` — Node/Express backend
- `dj-ai-db` — PostgreSQL database with pgvector
- generated JWT secret
- server-side secret placeholders for AI, Turnstile, email and Stripe

Render Blueprints support `fromDatabase` for wiring a Postgres connection string and `sync: false` for secrets that must be entered privately in the Render dashboard.

### 2. Add the AI provider secret

In the Render backend service environment variables, set:

```text
OPENAI_API_KEY=<your real provider key>
```

Never put this value in `dj/dj-config.js`, HTML, GitHub Pages, or any public repository file.

### 3. Create Cloudflare Turnstile

Create a production Turnstile widget for `deeepanbe.github.io`. Copy:

- Sitekey -> `TURNSTILE_SITE_KEY`
- Secret -> `TURNSTILE_SECRET`

The sitekey is public. The secret must stay only on the backend. Turnstile requires server-side Siteverify validation; the DJ AI backend already performs this validation.

### 4. Connect the website to the API

After Render deploys the backend, it will provide a URL similar to:

```text
https://dj-ai-api.onrender.com
```

Set the browser's public configuration to use that URL and the Turnstile sitekey. The frontend must never contain the provider API key.

The current secure bridge automatically obtains a Turnstile token and attaches it to `/chat` requests.

## Public trial model

### Free visitor

A visitor should be able to:

- open DJ AI without creating an account
- ask normal questions
- ask about Deepanraj's portfolio
- generate SQL/Python/DAX examples
- get dashboard recommendations
- use the assistant for a limited number of messages

The current backend already has IP and session rate limits. For a real public launch, keep the free trial deliberately limited because every successful AI request can create provider cost.

### Registered user

After email verification, a user can receive:

- persistent conversations
- workspaces
- memory
- document/RAG features
- agent runs
- usage history

### Paid plans later

Stripe billing is already scaffolded. A sensible product structure is:

| Plan | Suggested access |
| --- | --- |
| Free Trial | Limited anonymous messages |
| Free Account | More messages + saved conversations |
| Pro | Higher limits + documents/RAG + advanced agent features |
| Team | Shared workspace + team usage |

Do not activate paid billing until usage metering, limits, support and refund/cancellation policies have been tested.

## Important security rules

1. Never expose an OpenAI/Anthropic/Gemini key in frontend code.
2. Never commit Render, Stripe, Resend, database, JWT or Turnstile secrets.
3. Keep CORS restricted to the real website and trusted development origins.
4. Keep Turnstile verification enabled for anonymous chat.
5. Keep rate limits enabled before sharing the public URL.
6. Monitor provider usage before increasing the free quota.
7. Do not claim that DJ AI can perform an external action unless a real tool is connected and the action succeeded.

## What 'like ChatGPT' means for DJ AI

The architecture can evolve toward a ChatGPT-style experience, but the current implementation is not yet equivalent to ChatGPT. It has the foundation for model routing, conversations, memory, RAG, documents, an agent endpoint, usage and billing. The next engineering layer should add real tool adapters such as web research, calculator, file/data analysis and GitHub operations, with explicit permissions and confirmation for destructive actions.

## Testing before public launch

1. Open the portfolio.
2. Click **Launch DJ AI**.
3. Ask a portfolio question.
4. Ask a SQL question.
5. Ask a calculation question.
6. Refresh and verify anonymous chat still works.
7. Create an account and verify email.
8. Create a workspace and conversation.
9. Upload a small text document and test RAG.
10. Test rate limiting.
11. Check `/health` and confirm AI + database + Turnstile are configured.
12. Check Render logs for errors and provider usage.

## Current deployment boundary

The GitHub-connected work can prepare the code and deployment configuration, but the actual Render/Cloudflare/AI-provider account credentials belong to the account owner. Those secrets should be entered directly into the provider dashboards rather than pasted into chat.
