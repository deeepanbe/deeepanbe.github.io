# DJ AI — Deepanraj AI Analytics Platform

[![Live Site](https://img.shields.io/badge/live-deeepanbe.github.io-1677ff?style=flat-square)](https://deeepanbe.github.io)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-12%2F12%20passing-2ea44f?style=flat-square)](backend/test)
[![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20PostgreSQL-informational?style=flat-square)](backend)
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)](LICENSE)

**Live portfolio:** https://deeepanbe.github.io
**Repository:** https://github.com/deeepanbe/deeepanbe.github.io

A recruiter-facing portfolio for a Data Analyst / BI Developer, built as a full mini AI platform rather than a static page: a secure Node/Express backend, a multi-provider AI orchestration layer (OpenAI / Anthropic / Gemini with retry-and-fallback), Postgres-backed auth and conversation memory, and **DJ AI** — a personal AI copilot embedded across the site that can answer questions about the projects, generate SQL/Python/DAX on request, and discuss recruiter fit, without needing the visitor to bring their own API key.

See [`CHANGELOG.md`](CHANGELOG.md) for the most recent engineering pass.

DJ AI is a portfolio-driven AI analytics platform built around **Data Analytics, Power BI, SQL, Python, automation, and AI-assisted workflows**. The repository combines a public portfolio, DJ AI assistant experience, backend services, analytics demos, an Android-ready foundation, and GitHub automation.

## Vision

Build DJ AI into a practical personal AI assistant that can combine modern language models with:

- Conversation and context
- Personal knowledge and portfolio context
- Retrieval-augmented generation (RAG)
- Data and document analysis
- SQL / Python / Power BI assistance
- GitHub-aware development workflows
- Automation and future integrations

DJ AI is an **AI orchestration platform**, not a newly trained foundation model. Model providers are isolated behind a provider layer so the product can evolve without locking the entire application to one vendor.

## Repository at a glance

```text
.
├── index.html                 # Public portfolio
├── dj/                        # DJ AI web workspace and UI
├── ai/                        # Client-side assistant/bridge logic
├── backend/                   # API, AI providers, auth, RAG, persistence
├── android/                   # Android-ready integration foundation
├── app/                       # Platform-side browser logic
├── frontend/security/         # Client-side security helpers
├── dashboards/                # Dashboard documentation
├── projects/                 # Analytics case studies
├── assets/                   # Public portfolio assets
├── scripts/                   # Platform scripts
├── .github/                  # CI/CD and GitHub configuration
└── docs/                     # Architecture and engineering documentation
```

## DJ AI architecture

```text
Browser / Mobile
      │
      ▼
Portfolio + DJ AI UI
      │
      ▼
API / Authentication / Rate Limits
      │
      ▼
AI Orchestrator
      ├── Model Provider Layer
      ├── Conversation Context
      ├── Knowledge / RAG
      ├── Tool Registry
      └── Safety / Validation
      │
      ▼
External Models + Services
```

See [`docs/DJ_AI_ARCHITECTURE.md`](docs/DJ_AI_ARCHITECTURE.md) for the detailed design and extension points.

## Current capabilities

### Portfolio
- Recruiter-oriented Data Analyst / BI positioning
- Power BI, SQL, Python and analytics case studies
- Dashboard demonstrations
- Resume and professional contact paths
- Responsive, accessibility-focused interface
- SEO and social metadata

### DJ AI
DJ AI is a personal AI copilot embedded across the site — not a scripted FAQ bot. It runs on a secure Node/Express backend (`/backend`) that holds the AI provider key server-side (never exposed to the browser), with:

- Multi-provider support (OpenAI, Anthropic, Gemini) with automatic retry-with-backoff and timeouts
- Optional Postgres-backed user accounts, conversation history, and long-term memory (degrades gracefully if no database is configured)
- Cloudflare Turnstile bot protection so the API budget isn't drained by scrapers
- A single public config file (`dj/production-config.js`) is all that's needed to point every page at a deployed backend — no build step, works with plain GitHub Pages

It can explain the projects below, generate SQL/Python/DAX on request, walk through Excel/Power BI workflows, and discuss recruiter fit — as a real conversation, not a fixed set of canned answers.

### Backend
- Node.js / Express API
- PostgreSQL persistence
- Authentication foundation
- RAG/memory foundation
- Billing/webhook foundation
- Health endpoint
- Security middleware
- Automated tests

## Model configuration

The backend keeps model credentials server-side. Configure the provider through environment variables; never place API keys in frontend JavaScript.

Example:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_secret_here
MODEL=gpt-5.6-luna
```

Other provider adapters are available through the backend provider layer.

## Local development

### Backend

```bash
cd backend
npm install
npm test
npm start
```

Create `backend/.env` from `backend/.env.example` and provide only the secrets required by the features you enable.

### Static portfolio

The portfolio is intentionally compatible with GitHub Pages and does not require a frontend build step for its current static layer.

## Security

Never commit API keys, GitHub tokens, database passwords, JWT secrets, webhook signing secrets, or other credentials. GitHub Pages cannot make files inside a public repository private. Sensitive documents must live in authenticated server-backed storage rather than a public `assets/` path.

See [`SECURITY.md`](SECURITY.md) and [`docs/SECURITY_POSTURE.md`](docs/SECURITY_POSTURE.md).

## Engineering standards

- Preserve working functionality before refactoring.
- Keep AI providers behind adapters.
- Validate untrusted input.
- Keep secrets server-side.
- Add tests for critical behavior.
- Prefer small, reviewable changes.
- Do not claim unsupported AI capabilities.

## Roadmap

1. Harden the existing backend and public portfolio.
2. Complete the DJ AI orchestration/tool layer.
3. Expand document and data-analysis workflows.
4. Add secure GitHub-aware developer tools.
5. Improve persistent memory and RAG quality.
6. Build a production Android client on the existing API foundation.
7. Add evaluation, observability, and model-routing controls.

## Author

**Deepanraj Arumugam** — Data Analyst / AI Analytics Developer  
GitHub: https://github.com/deeepanbe  
LinkedIn: https://www.linkedin.com/in/deepanraj-data-analyst
