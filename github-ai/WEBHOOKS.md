# DJ GitHub Event Engine

Recommended events:
- pull_request: opened, synchronize, reopened
- issues: opened, edited
- push
- workflow_run
- dependabot_alert

Webhook handler requirements:
1. Verify GitHub HMAC signature.
2. Normalize event into a task.
3. Deduplicate by delivery ID.
4. Queue work with a bounded timeout.
5. Run AgentLoop.
6. Persist result and audit record.
7. Never merge or perform destructive writes automatically.

The repository's GitHub Actions workflow is the first deployment option; a FastAPI webhook service can be deployed separately when a public webhook endpoint and secret are configured.
