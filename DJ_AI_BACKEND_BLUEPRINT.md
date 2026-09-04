# DJ AI Backend Architecture

The production DJ AI backend in this repository is Node.js + Express. This document describes the implementation that is actually configured, rather than the older FastAPI concept.

## Runtime
- Node.js >= 22
- Express 4
- PostgreSQL via pg
- JWT authentication
- express-rate-limit
- Cloudflare Turnstile
- Multi-provider AI adapter: OpenAI, Anthropic, Gemini, Ollama

## Request flow

    GitHub Pages
       | POST /chat: session_id + Turnstile token
       v
    Node / Express
       | CORS + security headers
       | IP rate limit
       | session rate limit
       | Turnstile verification
       | authenticated conversation ownership check
       | portfolio knowledge
       | optional PostgreSQL memory / RAG
       | AI provider adapter
       v
    JSON { ok, provider, model, text }

## Core endpoints

### GET /health
Returns backend, AI provider, Turnstile, database and platform status.

### POST /chat
Required: message or messages, session_id, and turnstileToken.
Optional: conversation_id, page, and mode.
The backend never accepts an AI API key from the browser.

## Environment
Set these on the backend host only:

    AI_PROVIDER=openai
    OPENAI_API_KEY=...
    MODEL=<provider-supported-model>
    DATABASE_URL=...
    TURNSTILE_SECRET=...
    CORS_ORIGINS=https://deeepanbe.github.io

Provider alternatives use ANTHROPIC_API_KEY, GEMINI_API_KEY, or OLLAMA_BASE_URL as appropriate. Never commit secrets.

## Frontend configuration
`dj/production-config.js` contains public configuration only:

    window.DJ_BACKEND_URL = "https://<verified-backend-host>";
    window.DJ_TURNSTILE_SITE_KEY = "<public-turnstile-site-key>";

The backend URL and Turnstile site key are safe for browser delivery. The Turnstile secret key remains on the backend.

The shared `dj/turnstile-client.js` renders an invisible Turnstile challenge and supplies the one-time token to `/chat`.

## Deployment checklist
1. Deploy the Node backend with Node >= 22.
2. Configure TURNSTILE_SECRET.
3. Configure CORS_ORIGINS for the GitHub Pages origin.
4. Verify GET /health reports turnstile_configured: true and ai_configured: true; database.ok should be true when a database is intended.
5. Put the verified public backend URL and Turnstile site key into dj/production-config.js.
6. Open /dj/dj.html and test a real chat request.
7. Confirm a missing or invalid Turnstile token is rejected with HTTP 403.
8. Confirm repeated requests eventually receive the configured rate-limit response.
9. Run the backend test suite before release.

## Security posture
- API keys remain server-side.
- Browser requests use a public Turnstile site key only.
- Prompt-injection attempts are filtered in the UI and supplied knowledge is treated as untrusted data.
- CORS is allow-list based.
- Security headers disable framing and unnecessary browser capabilities.
- Request size and message length are bounded.
- IP and session throttling protect the chat endpoint.
- Persistent conversations are checked for user ownership.
- AI provider calls use timeouts and retries for transient failures.

## Product boundary
DJ AI is an AI orchestration application. It does not claim to be a newly trained foundation model. Portfolio facts should come from verified knowledge files; generated SQL, Python and DAX are examples unless backed by project evidence.