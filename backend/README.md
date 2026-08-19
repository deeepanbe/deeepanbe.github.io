# DJ AI Backend (Phase 1 scaffold)

This folder contains a minimal Node.js/Express scaffold to act as a secure backend proxy for the DJ AI assistant on your GitHub Pages site.

Files added:
- server.js            : Express server with POST /chat
- package.json         : dependencies and scripts
- .env.example         : example environment variables
- knowledge/           : placeholder markdown knowledge files

Quick start (local):
1. cd backend
2. cp .env.example .env and edit values (set OPENAI_API_KEY and BACKEND_SECRET)
3. npm install
4. npm run dev
5. POST to http://localhost:8787/chat with body {"page":"index.html","mode":"chat","message":"Hello"} and header x-backend-secret: your BACKEND_SECRET

Security notes:
- Never commit a .env with secrets to the repository.
- The server enforces a simple x-backend-secret header check and CORS allowlist. For production, add stronger auth and monitoring.

Next steps (phase 1->2):
- Wire frontend to call BACKEND_URL and include x-backend-secret header (keep secret on deployment environment)
- Implement knowledge retrieval improvements (embeddings / vector DB) for better retrieval
- Add server-side logging, persistence, and optional session storage
