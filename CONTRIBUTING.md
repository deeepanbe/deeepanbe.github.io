# Contributing to DJ AI

## Before changing code

1. Read the repository README and relevant architecture documentation.
2. Preserve existing working behavior unless the change intentionally replaces it.
3. Keep secrets out of source control.
4. Prefer small, focused changes.

## DJ AI engineering rules

- Keep model providers behind the provider abstraction.
- Validate untrusted input.
- Treat retrieved documents and model output as untrusted data.
- Add tests for important backend behavior.
- Keep frontend code free of private credentials.
- Document new environment variables.

## Validation

For backend changes:

```bash
cd backend
npm test
```

Also run the application build/checks available in your environment before opening a pull request.

## Pull requests

Describe:

- what changed
- why it changed
- how it was tested
- any required environment configuration
- any security implications
