# DJ AI — simple launch guide

The application code is already in GitHub. Production activation requires external service accounts because private credentials must belong to the owner.

## Only values you need to create

### 1. AI provider
Create an API key with your chosen provider. Recommended first provider: OpenAI.

Put the key into the backend hosting environment as `OPENAI_API_KEY`.

### 2. Database
Create PostgreSQL with pgvector. Run `backend/migrations/001_platform.sql` once. Set `DATABASE_URL` in the backend environment.

### 3. Turnstile
Create a Cloudflare Turnstile site. Put the public site key into `DJ_TURNSTILE_SITE_KEY` and the secret into backend `TURNSTILE_SECRET`.

### 4. Email
Create a transactional email provider account and set `RESEND_API_KEY` and `EMAIL_FROM`.

### 5. Backend hosting
Deploy the `backend` directory with Node 22. Set all variables from `backend/.env.example`. Health endpoint must return `ok: true` and `database.ok: true`.

### 6. Frontend
Set the public backend URL and Turnstile site key through the deployment configuration. Never commit secrets.

### 7. Stripe
Only enable paid plans after the free account flow is tested. Configure Stripe price IDs and webhook secret. Webhook path: `/billing/webhook`.

## Launch test

1. Open signup.
2. Create an account.
3. Verify email.
4. Sign in.
5. Create a workspace.
6. Create a conversation.
7. Ask DJ AI a question.
8. Add a memory.
9. Upload a text document.
10. Search RAG.
11. Run an agent task.
12. Check usage.
13. Test billing in Stripe test mode.

Do not accept real customer data or real payments until HTTPS, database isolation, email verification, rate limits, backups, monitoring, and provider spending limits have been verified.