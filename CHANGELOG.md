# Changelog

## DJ AI reliability pass — August 2026

A full audit of the DJ AI chat system found it was built correctly in principle (a Node/Express backend holding the AI provider key server-side, never exposed to the browser) but was broken or inconsistent across every surface that used it.

**Bugs fixed:**
- `dj/dj.js` parsed the backend's reply from `data.reply`/`data.message`, but `POST /chat` returns the reply under `data.text`. Real backend replies were silently discarded and the widget always fell back to canned local answers — even with a fully configured, working backend.
- The widget never sent a `session_id`, so the backend's per-session rate limiter on `/chat` was never actually engaged.
- `dj/dj.html` (linked from the site footer as "DJ AI") asked every visitor to paste their own Anthropic API key, then called `https://api.anthropic.com/v1/messages` directly from the browser. This can never work — browsers are blocked by CORS from calling that endpoint directly, regardless of whose key is used. The page was permanently broken for every visitor.
- `ai/dj-assistant.js` (the homepage floating button) never called any AI backend at all — it matched keywords against a fixed set of hardcoded response templates.
- `backend/Procfile` referenced `uvicorn main:app` (Python), but the backend is Node/Express. Would have failed to boot on Render/Heroku.

**Fixes:**
- Unified all three DJ AI surfaces (`ai/dj-assistant.js`, `dj/dj.js`, `dj/dj.html`) onto the one real, secure backend endpoint. The homepage widget now calls the backend first and only falls back to canned answers if no backend is configured yet or a request fails.
- Added `dj/production-config.js` — a single, public-values-only config file (backend URL + Turnstile *site* key, both meant to be public) loaded by every page. Once the backend is deployed, editing this one file and pushing is the only step required — no build process, no secrets, works with plain GitHub Pages.
- Added retry-with-backoff and a request timeout around all three AI providers (OpenAI/Anthropic/Gemini) in `backend/ai/provider.js`, so a transient 429/5xx/timeout no longer hard-fails the chat request.
- Added ~370 lines of previously entirely-missing CSS for the floating AI button and chat drawer (button, panel, message bubbles, code blocks, typing indicator, mode pills, input row), including a mobile-first full-screen layout under 640px.
- Fixed `backend/Procfile`.

**Verified:** no hardcoded secrets in the repo, `npm audit` reports 0 vulnerabilities, all 12 backend tests pass (`cd backend && npm test`).
