# DJ AI Security Posture

## Current controls

The backend includes CORS allow-listing, security headers, request-size limits, rate limiting, Turnstile verification for public chat, authentication checks for persistent conversations, input-length limits, and server-side provider credentials.

## Non-negotiable rules

- Never commit API keys or GitHub tokens.
- Never expose backend credentials through `window` configuration.
- Never treat model output as trusted code.
- Never treat uploaded files as trusted instructions.
- Keep private documents outside public GitHub Pages storage.
- Validate authorization before reading or mutating user-owned records.
- Keep webhook signature verification enabled for billing integrations.

## Public GitHub Pages limitation

A public repository is not a private file store. A JavaScript password gate can improve presentation UX but cannot provide server-side secrecy for files that are committed to a public repository.

Sensitive documents should be moved to authenticated storage before the platform is used for genuinely confidential material.

## Secret rotation

If a credential has ever been committed to Git, treat it as compromised even if the file is later deleted. Rotate the credential at the issuing provider and, where necessary, clean repository history.

## Future hardening

- Centralized audit logging
- Per-user tool permissions
- CSRF strategy if cookie authentication is introduced
- Sandboxed code execution
- Content-type and malware scanning for uploads
- Stronger schema validation for API bodies
- Production secrets manager
- Dependency/SBOM scanning
- AI prompt-injection evaluation suite
- Automated security regression tests
