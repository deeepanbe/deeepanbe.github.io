# DJ AI Agent Safety

DJ AI can become highly capable without becoming uncontrolled.

External actions must use:

- Explicit tool registration
- Authentication and authorization
- Input validation
- Least-privilege credentials
- Rate limits and budgets
- Audit logging
- Confirmation for consequential actions
- Safe failure and rollback

The agent must not grant itself new permissions, expose secrets, disable security controls, or deploy arbitrary self-modifying code.
