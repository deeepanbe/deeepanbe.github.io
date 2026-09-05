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
