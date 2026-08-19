# DJ AI Backend — Secure AI Foundation

This service is the server-side foundation for the future multi-user DJ AI platform. It keeps provider credentials on the server, verifies browser requests with Cloudflare Turnstile, rate-limits abuse, and preserves the existing frontend's local fallback behavior.

## Architecture

```text
Browser DJ AI
    │
    │ POST /chat + short-lived Turnstile token
    ▼
Node/Express API
    ├── CORS allowlist
    ├── IP rate limit
    ├── session rate limit
    ├── Turnstile verification
    ├── input validation
    └── AI provider abstraction
            │
            ▼
        OpenAI Responses API
```

## Local setup

1. `cd backend`
2. Copy `.env.example` to `.env`.
3. Set `OPENAI_API_KEY` and `TURNSTILE_SECRET` in the server environment.
4. Set `CORS_ORIGINS` to the exact origin hosting the frontend.
5. Run `npm install`.
6. Run `npm run dev`.
7. Run `npm test`.

Do not commit `.env`, API keys, Turnstile secrets, or production credentials.

## Turnstile

Create a Cloudflare Turnstile site. The **site key is public** and belongs in frontend configuration. The **secret key stays only on the backend** as `TURNSTILE_SECRET`.

The backend fails closed when a token is missing or cannot be verified. A browser cannot bypass this by simply knowing the public site key.

For local development, use Cloudflare's official Turnstile test credentials and a local origin such as `http://localhost:8000`.

## API

### `GET /health`

Returns service configuration status without exposing secrets.

### `POST /chat`

Accepts either the current frontend shape:

```json
{
  "mode": "chat",
  "messages": [{"role": "user", "content": "Hello"}],
  "session_id": "chat-123",
  "turnstileToken": "..."
}
```

or the simpler server shape:

```json
{
  "page": "index.html",
  "mode": "chat",
  "message": "Hello",
  "session_id": "chat-123",
  "turnstileToken": "..."
}
```

The response is:

```json
{"ok":true,"model":"...","text":"..."}
```

## Security decisions

- No `x-backend-secret` is accepted or required.
- No OpenAI credential is sent to the browser.
- CORS is an allowlist, not an authentication mechanism.
- Turnstile is verified server-side.
- IP and session rate limits are enforced before the model call.
- Message size is bounded.
- Security headers disable framing and caching of API responses.
- Logs contain verification/error metadata, not user message content.
- The provider is abstracted so Claude/Gemini/other providers can be added later without rewriting the API contract.

## Frontend bridge

`../ai/dj-secure-bridge.js` can transparently add a Turnstile token to existing `POST /chat` calls. It contains no server secret. `dj/dj-config.js` exposes only `BACKEND_URL` and the public `TURNSTILE_SITE_KEY`.

The current public portfolio should keep the backend URL/site key empty until the API is deployed and configured. The local assistant remains the fallback.

## Next platform phases

1. Authentication and verified customer accounts
2. PostgreSQL + tenant isolation
3. Persistent conversation and user-controlled memory
4. File ingestion + RAG + pgvector
5. Agent orchestration and tool permissions
6. Multi-provider model routing
7. Projects/workspaces
8. Usage metering, billing, observability, and production deployment
