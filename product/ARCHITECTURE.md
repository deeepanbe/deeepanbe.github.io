# DJ AI Product Architecture

Web UI → Auth → Profile Service → Job Matching → Document Assistant → Application Tracker

Storage:
- PostgreSQL for accounts, structured profiles, jobs and application state.
- Object storage for encrypted resume documents.
- Secrets manager for API credentials.
- Audit log for user-visible application actions.

Auth:
- Email/OAuth authentication.
- Per-user tenant isolation.
- Short-lived sessions and CSRF protection for browser flows.

Integrations:
- Job sources supplied by authorized APIs/partners or user-provided job URLs/text.
- LinkedIn/Naukri: manual-assist by default; partner/API integrations only after access approval.
- No scraping, credential collection, automated login or auto-submit.

Operational controls:
- Encryption in transit/at rest.
- Data deletion/export.
- Rate limits.
- Abuse prevention.
- Human confirmation before external application submission.
