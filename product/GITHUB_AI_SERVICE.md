# DJ GitHub AI — Product

## Positioning
An AI engineering assistant for GitHub users: understand repositories, review pull requests, identify technical debt, propose safe patches, and turn approved changes into reviewable pull requests.

## Launch pricing assumptions
| Tier | Price | Core value |
|---|---:|---|
| Free | ₹0 | 3 public repos, weekly health scan, basic issue/PR summaries |
| Pro | ₹499/month | 10 repos, daily scans, AI PR reviews, patch proposals, learning history |
| Developer | ₹999/month | Unlimited public repos, private-repo support, advanced reviews |
| Team | ₹2,999/month | 5 seats, shared policies, audit logs, team dashboards |

Validate pricing with customers before launch.

## Monetization
Bill by active repositories, seats and/or AI usage. Never expose GitHub tokens. Use least-privilege GitHub App/OAuth permissions. Keep repository writes approval-gated; merging, deletion, permissions and secret operations remain outside autonomous scope.

## Architecture
Browser -> API -> GitHub App/OAuth -> repository intelligence -> model provider -> review/patch engine -> PR.

## Launch checklist
1. Deploy `github-ai/backend` on Render.
2. Configure GitHub App/OAuth and model credentials as server-side secrets.
3. Configure GitHub webhook to `/api/webhook`.
4. Add a payment provider after legal entity, tax and billing decisions.
5. Start with public repositories; add private repositories after a security review.

## Compliance
Use GitHub's official APIs and webhooks. Do not scrape GitHub or automate user logins. Generated changes should be reviewable before merge.
