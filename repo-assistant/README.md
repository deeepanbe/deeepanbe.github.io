# DJ Repo Assistant

A lightweight GitHub code-review agent. It reads pull-request diffs through the GitHub API, performs deterministic checks, optionally asks a configured LLM for senior-level review, and writes a machine-readable result.

## Run
Set GITHUB_TOKEN, GITHUB_OWNER, OPENAI_API_KEY (optional), OPENAI_MODEL (optional), PR_NUMBER, then run `python agent.py`.

## Design
- No scraping or browser automation.
- Read-only by default.
- Specific findings only; no fabricated claims.
- Review fingerprints can be stored to measure repeated patterns over time.
