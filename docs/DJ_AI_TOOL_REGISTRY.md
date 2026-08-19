# DJ AI Tool Registry

Every tool should declare:

- Name and purpose
- Input/output schema
- Authentication requirements
- Permissions
- Cost and rate limits
- Timeout
- Failure behavior
- Audit requirements
- Supported modalities

The orchestrator should select tools based on the task and user authorization. Tools must not receive secrets beyond their required scope.
