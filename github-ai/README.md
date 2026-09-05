# DJ GitHub AI — V1

A controlled AI development agent for GitHub repositories.

## V1
- Inspect repositories, files, commits, issues and pull requests.
- Generate repository improvement recommendations.
- Propose file patches.
- Require explicit approval before repository writes.
- Create approved commits and keep an audit trail.

## Safety
Read operations are available by default. Writes require explicit approval and are scoped to a repository, branch and file. The agent never deletes repositories, force-pushes, merges PRs, changes permissions, or handles secrets in prompts.

## Production
Use a GitHub App with least-privilege permissions. Keep GitHub private keys and AI API keys server-side.
