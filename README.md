# Deepanraj Arumugam - AI Analytics Portfolio

Live site: https://deeepanbe.github.io

## Recent maintenance (DJ AI reliability pass)

- **Fixed:** the DJ AI chat widget (`dj/dj.js`) parsed the backend's reply from `data.reply`/`data.message`, but `POST /chat` returns the reply under `data.text`. This meant that even with the backend fully configured, the widget always silently fell back to canned local answers. It now reads `data.text` first.
- **Fixed:** the widget never sent a `session_id`, so the backend's per-session rate limiting on `/chat` was effectively inactive. It now generates and sends a per-tab session id.
- **Added:** request timeout (20s, `AbortController`) and a clearer thrown error (including the backend's error message) on failed chat requests.
- **Added:** retry-with-backoff (`AI_REQUEST_MAX_RETRIES`, default 2) and a request timeout (`AI_REQUEST_TIMEOUT_MS`, default 25s) around all three AI providers (OpenAI/Anthropic/Gemini) in `backend/ai/provider.js`, so transient 429/5xx/timeout failures no longer surface as a hard 500 to the user.
- Verified: no hardcoded secrets in the repo, `npm audit` reports 0 vulnerabilities, all 12 backend tests pass (`cd backend && npm test`).
- See `backend/.env.example` for the two new optional env vars (`AI_REQUEST_TIMEOUT_MS`, `AI_REQUEST_MAX_RETRIES`).

Premium GitHub Pages portfolio for a Data Analyst and AI Solutions Developer. The site is designed to feel like a modern AI analytics platform, with recruiter-first storytelling, client-ready service positioning, dashboard case studies, a DJ AI copilot, resume preview, certifications, and a private resource center.

## Positioning

Deepanraj Arumugam builds intelligent dashboards, automation systems, and AI-powered analytics solutions across Power BI, SQL, Python, Excel, Tableau, Azure concepts, and business intelligence workflows.

Target audiences:

- HR recruiters
- Hiring managers
- Freelance clients
- Startup founders
- Analytics teams

Target opportunities:

- Data Analyst
- BI Developer
- Power BI Developer
- Analytics Engineer
- AI-assisted Analytics Developer
- Freelance dashboard and reporting projects

## Core Experience

- Premium light-theme SaaS visual system
- Sticky navigation with active section states
- Floating previous, next, and back-to-top navigation
- Recruiter-optimized hero with profile image, KPI counters, CTAs, and AI preview
- Currently-learning ticker for PL-300, Azure Data Factory, dbt, and Snowflake SQL
- Client-ready services and consulting sections
- Enterprise-style project case studies
- DJ AI assistant drawer and full workspace
- Certifications and experience timeline
- GitHub contribution activity proof and public Open Graph image
- Resume preview, download, LinkedIn, GitHub, email, WhatsApp, and Formspree fallback CTAs
- Encoded private access validation with session timeout
- Mobile responsive layout and accessibility-focused controls

## Repository Structure

```text
/
  index.html                 # Main AI analytics platform portfolio
  sales-dashboard.html        # Dashboard demo
  hr-dashboard.html           # Dashboard demo
  operations-dashboard.html   # Dashboard demo
  ai/                         # DJ AI assistant scripts and docs
  assets/                     # Profile, resume, screenshots, secure files
  assets/og-image.svg         # Public social preview image
  certifications/             # Certification documentation
  components/                 # Static component architecture notes
  dashboards/                 # Dashboard demo documentation
  dj/                         # Full DJ AI workspace
  pages/                      # Page architecture notes
  private/                    # Private access documentation
  projects/                   # Case study documentation
  scripts/                    # Site interaction scripts
  styles/                     # Premium design system CSS
```

## Project Case Studies

- Power BI Universal Analytics Dashboard
- Enterprise Analytics Project
- Customer Segmentation ML
- BigQuery E-Commerce Analysis
- Olist E-Commerce BI Dashboard
- Sales Forecasting Dashboard
- Retail Inventory Management

Each showcased project is framed by business problem, tools used, measurable impact, GitHub link, live demo or assistant-driven case study.

## DJ AI

DJ AI is a portfolio copilot for:

- Project explanations
- SQL generation
- Python and pandas workflows
- Excel reporting help
- Power BI DAX measures
- Dashboard recommendations
- Data cleaning checklists
- Resume and recruiter fit review

The current GitHub Pages version includes a polished local fallback assistant. The backend-ready integration point remains available through `DJ_CONFIG.BACKEND_URL`.

## Private Access

Private Access is implemented for static hosting compatibility:

- Encoded SHA-256 password validation
- Session timeout
- Authorized resource area
- Resume, certificates, and dashboard resource downloads

Static-site note: GitHub Pages cannot provide true server-side secrecy. Private Access is a professional presentation layer for authorized resources in this public repo. Confidential files should move to server-backed storage when required.

## Stack

- HTML
- CSS
- Vanilla JavaScript
- GitHub Pages

No build step is required.

## SEO Focus

- Data Analyst
- Power BI Developer
- Microsoft PL-300
- BI Developer
- SQL Analyst
- BigQuery
- Snowflake
- GCP
- Python Data Analyst
- AI Analytics Developer
- Analytics Consultant
- Dashboard Automation
- KPI Reporting
- Chennai
- Bengaluru
- Kochi
