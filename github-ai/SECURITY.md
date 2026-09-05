# DJ AI Security Model

## Default
Read-only analysis. Every consequential action is auditable and approval-gated.

## Allowed agent actions
Read repository metadata/code, analyze, generate patches, validate, run tests, create a branch and prepare a pull request.

## Never autonomous
Merge, force-push, delete repositories/files, change permissions, access secrets, rotate credentials, or submit external job applications.

## Webhooks
Verify `X-Hub-Signature-256` with HMAC before processing. Deduplicate webhook deliveries and reject oversized payloads.

## Secrets
Never store tokens in source, logs or memory records. Use environment/secret-manager injection and redact known secret patterns from agent output.
