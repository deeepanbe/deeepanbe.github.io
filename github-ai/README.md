# DJ GitHub AI

Approval-gated AI software engineer for GitHub portfolios.

## Agent loop
Discover → Understand → Plan → Generate → Validate → Test → Retry on failure (max 3) → Security Review → Human Approval → Branch/PR → Evaluate → Learn.

## Events
Pull requests, commits, issues and workflow failures can become agent tasks. Event handling must verify webhook signatures and deduplicate deliveries.

## Safety
The loop is bounded. It cannot automatically merge, force-push, delete repositories, change permissions, access secret files, or submit external applications.

## Verification
Run:
`python agent_loop_test.py`
`python -m py_compile agent_loop.py`

The loop returns `ready_for_approval` only after validation and tests pass.


## CI
All DJ automation checks are consolidated in `.github/workflows/dj-ci.yml`.
Pushes and pull requests run the backend smoke test and job-profile tests; pull requests also run the review assistant. The bounded agent loop and portfolio audit are manual/scheduled operations.

## Production rule
A green CI run is required before merging changes. AI-generated repository writes remain approval-gated and are opened as review pull requests.
