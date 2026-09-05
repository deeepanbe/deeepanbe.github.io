# DJ AI GitHub OAuth / App Setup

Production assumption: use a GitHub App or OAuth App with the minimum repository permissions required by each feature.

Recommended permission tiers:
- Metadata: read
- Contents: read
- Pull requests: read/write only when user explicitly enables PR assistance
- Issues: read/write only for enabled issue workflows

Never request organization administration or secrets access for normal users.

Production callback URLs, client ID/secret and webhook secret belong in the deployment secret manager—not source control.
