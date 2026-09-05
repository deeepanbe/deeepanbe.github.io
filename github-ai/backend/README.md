# DJ GitHub AI Backend

A lightweight GitHub engineering agent for repository intelligence, code-review proposals, validation and webhook-based learning.

## Capabilities
- Public-repository inventory and health scoring
- Repository overview, issues, PRs and commits
- AI-assisted task planning and code-review proposals
- Proposal validation boundary before writes
- GitHub webhook event memory for coding-pattern learning
- Provider-agnostic fallback when no model key is configured

## Environment
GITHUB_TOKEN=least-privilege GitHub token
GITHUB_OWNER=deeepanbe
OPENAI_API_KEY=server-side model key (optional)
MODEL=gpt-5.6-luna
GITHUB_WEBHOOK_SECRET=random secret (optional but recommended)
CORS_ORIGINS=https://deeepanbe.github.io

Run: gunicorn --bind 0.0.0.0:$PORT app:app

Security rule: never put GitHub or model secrets in the browser. Automatic merge, deletion and permission changes are intentionally not exposed.
