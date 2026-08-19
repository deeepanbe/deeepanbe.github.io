# DJ AI Platform — Phase 0 Architecture & Security Audit

Date: 2026-08-19
Branch: `ai-platform-audit`
Base: `main`

## 1. Executive Summary

The repository is a strong portfolio-first foundation with an existing local DJ AI assistant, a Node/Express backend scaffold, Markdown knowledge files, PWA support, and a backend integration point. The current system is not yet a multi-user AI platform and should not be exposed as a commercial SaaS until authentication, tenant isolation, secrets, persistent storage, abuse controls, and a provider abstraction are implemented.

The recommended strategy is incremental migration: preserve the existing GitHub Pages portfolio and local assistant, harden the backend, then introduce an API-first platform layer for future web, Android, and browser clients.

## 2. Current Architecture

- Public static portfolio: HTML/CSS/vanilla JavaScript on GitHub Pages.
- DJ AI frontend: `dj/dj.js`, `ai/dj-assistant.js`, widget assets and localStorage history.
- Backend: `backend/server.js`, Node/Express, OpenAI SDK, CORS, IP rate limiting, Markdown knowledge loading.
- Knowledge: `backend/knowledge/*.md`.
- Configuration: `backend/.env.example` and frontend DJ configuration.
- PWA: `manifest.json` and static deployment assets.
- Existing architecture documentation: `DJ_AI_BACKEND_BLUEPRINT.md`.

## 3. Current DJ AI Capabilities

The frontend already supports conversational UI, history, suggestions, multiple modes, Markdown/code formatting, local fallback responses, and workflows around SQL, Python, Excel, DAX/Power BI, cleaning, dashboards and resume assistance.

The backend currently accepts `/chat`, loads all Markdown knowledge files, constructs a DJ persona prompt, and calls the OpenAI Responses API.

## 4. Critical Security Findings

### High priority

1. `backend/server.js` still supports `x-backend-secret`. A browser cannot keep such a secret confidential. Remove it from the browser-to-backend authentication design.
2. The backend currently has no real user authentication or authorization.
3. There is no tenant isolation because there is no persistent user identity/database authorization layer.
4. `session_id` is accepted but is not authenticated or persisted securely.
5. The backend currently permits server-to-server/curl requests when the CORS origin is absent; CORS is not authentication.
6. The current knowledge context is global and concatenated for every request. It is not suitable for customer-private knowledge.
7. `.env.example` documents a backend secret pattern that must be retired.

### Medium priority

8. No structured security headers middleware is present.
9. No persistent usage accounting or per-user quotas exist.
10. No server-side conversation persistence exists.
11. No Turnstile/anti-abuse verification is currently enforced.
12. Error handling is broad and currently logs raw server errors; logging policy should be formalized before production.
13. The current OpenAI dependency and Express stack are older scaffold versions and should be upgraded deliberately during the backend hardening phase.
14. Knowledge files are loaded on every request and concatenated into the prompt; this will not scale and may exceed useful context limits.

## 5. Product Target

DJ AI should evolve into a secure personal-to-public AI platform:

`Web / Android / Browser Extension -> API Gateway -> Auth -> AI Gateway -> Agents/Tools -> Memory/RAG -> Models`

Each customer gets one isolated account/workspace. User-approved memory and knowledge improve personalization without allowing the model to rewrite production source code autonomously.

## 6. Target Technology

### Client

- Preserve current static portfolio.
- Introduce a separate modern AI application incrementally.
- Next.js + React + TypeScript is recommended for the full application.
- PWA support should remain.
- Android should consume the same API later through React Native/Expo or a comparable client.

### Backend

- API-first TypeScript/Node or Python/FastAPI service.
- Keep the current Node backend during the first hardening phase to minimize migration risk.
- Introduce clean modules for auth, AI providers, memory, RAG, agents, tools, files and usage.

### Data

- PostgreSQL for users, sessions, conversations, projects, memory, feedback, tasks and usage.
- pgvector for embeddings/RAG.
- S3-compatible object storage for files.
- Redis/BullMQ later for background jobs and rate/queue workloads.

## 7. Database Model — Initial

Recommended entities:

- `users`
- `profiles`
- `sessions`
- `oauth_accounts`
- `conversations`
- `messages`
- `projects`
- `project_members`
- `files`
- `file_chunks`
- `memories`
- `feedback`
- `tasks`
- `tool_calls`
- `ai_requests`
- `usage_events`
- `audit_logs`

All user-owned records must have an authenticated ownership/tenant relationship. Never trust a `user_id` supplied by a client request.

## 8. Authentication Architecture

Future production account flow:

Registration -> email verification -> session -> authenticated API -> authorization middleware.

Later support:

- Google OAuth
- GitHub OAuth
- phone OTP
- MFA
- password reset
- device/session management
- account deletion
- data export

The browser must never receive database/API/provider secrets.

## 9. AI Gateway

Create a provider abstraction rather than embedding OpenAI calls throughout the application.

Interface direction:

- `generate()`
- `stream()`
- `embed()`

Initial provider: OpenAI.
Future providers: Anthropic and Google Gemini.

A routing layer can later choose a provider/model based on task, quality, latency and cost.

## 10. Memory Architecture

Memory categories:

1. Conversation context
2. User preferences
3. Approved user facts
4. Project memory
5. Document knowledge
6. Feedback-derived improvement candidates

Users must be able to view, edit, delete and disable memory.

Controlled learning rule:

`AI proposal -> user approval -> memory update -> future retrieval`

Do not allow unrestricted self-modifying production code.

## 11. RAG Architecture

Future flow:

`Upload -> security validation -> object storage -> parser -> chunks -> embeddings -> pgvector -> user/tenant filtered retrieval -> model -> cited answer`

Every vector query must apply tenant/user filtering before returning chunks.

Initial Phase 1 can retain Markdown knowledge retrieval as a temporary global portfolio knowledge source.

## 12. Agent Architecture

Recommended agents:

- General Assistant
- Research Agent
- Coding Agent
- Data Analyst Agent
- Document Agent
- Writing Agent
- Automation Agent

An orchestrator should route requests to agents and tools using strict schemas and authorization.

## 13. Tool Architecture

Future tools:

- Web search
- GitHub
- PDF/DOCX/XLSX/CSV parsing
- SQL
- Python in isolated execution
- Image analysis
- Document generation
- Email/calendar/task integrations

No arbitrary shell execution for untrusted customer prompts.

## 14. API Direction

Initial hardened endpoints:

- `GET /health`
- `POST /chat`

Future:

- `/auth/*`
- `/users/me`
- `/conversations/*`
- `/projects/*`
- `/files/*`
- `/memory/*`
- `/feedback/*`
- `/agents/*`
- `/tools/*`
- `/tasks/*`
- `/usage/*`

## 15. Frontend Direction

Preserve the existing DJ assistant and local fallback.

For the new platform, build an original AI workspace with:

- Chat
- Projects
- Files
- Memory
- Agents
- Research
- Coding
- Data analysis
- Automation
- Settings

Do not copy proprietary ChatGPT/Claude/Gemini/Slack interfaces or branding.

## 16. Phase Roadmap

### Phase 1 — Secure AI foundation

- Remove browser secret authentication.
- Add Turnstile verification.
- Add provider abstraction.
- Upgrade dependencies deliberately.
- Add security headers.
- Strengthen validation and rate limiting.
- Add structured error handling.
- Add tests.
- Preserve local fallback.

### Phase 2 — Real AI integration

- Connect frontend to secure `/chat`.
- Add conversation context.
- Add streaming.
- Add retries/cancellation.
- Add usage accounting foundation.

### Phase 3 — Accounts + private memory

- PostgreSQL.
- Authentication.
- Sessions.
- Authorization.
- Tenant isolation.
- User-controlled memory.

### Phase 4 — Files + RAG

- Object storage.
- PDF/DOCX/XLSX/CSV ingestion.
- pgvector.
- User-filtered retrieval.
- Citations.

### Phase 5 — Agents + tools

- Orchestrator.
- Research, coding, data and document agents.
- Secure tool calling.

### Phase 6 — Multi-model

- OpenAI provider.
- Anthropic provider.
- Gemini provider.
- Routing and cost controls.

### Phase 7 — Product workspace

- Projects.
- Channels.
- Tasks.
- Notifications.
- Usage limits.

### Phase 8 — Production clients

- Web application.
- Android application.
- Browser extension.

## 17. Testing Strategy

Mandatory security tests:

- User A cannot read User B conversation.
- User A cannot retrieve User B vector chunks.
- User A cannot access User B files.
- Unauthenticated requests cannot access private APIs.
- Expired sessions are rejected.
- Rate limits are enforced.
- Invalid Turnstile tokens are rejected.
- Provider secrets never appear in frontend bundles.

Also add unit, integration and API tests for core AI, memory, RAG and agent routing behavior.

## 18. Deployment Strategy

Keep the portfolio on GitHub Pages.

Deploy the AI backend separately with server-side environment variables.

Production secrets:

- `OPENAI_API_KEY`
- `TURNSTILE_SECRET`
- database credentials
- session/JWT secrets
- storage credentials

Never commit real secrets.

## 19. Immediate Implementation Decision

The next code PR should be a security-focused Phase 1 backend hardening change. Do not migrate the entire portfolio or build Android yet.

Success criteria for Phase 1:

- No browser backend secret.
- Turnstile server verification.
- Secure configuration.
- Rate limiting.
- Request validation.
- Security headers.
- Provider abstraction.
- Health endpoint.
- Tests.
- Local DJ fallback remains functional.
- Existing portfolio remains functional.
