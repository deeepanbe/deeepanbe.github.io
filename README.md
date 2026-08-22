# Deepanraj Arumugam — AI Analytics Portfolio

[![Live Site](https://img.shields.io/badge/live-deeepanbe.github.io-1677ff?style=flat-square)](https://deeepanbe.github.io)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-12%2F12%20passing-2ea44f?style=flat-square)](backend/test)
[![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20PostgreSQL-informational?style=flat-square)](backend)
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)](LICENSE)

**Live site:** https://deeepanbe.github.io

A recruiter-facing portfolio for a Data Analyst / BI Developer, built as a full mini AI platform rather than a static page: a secure Node/Express backend, a multi-provider AI orchestration layer (OpenAI / Anthropic / Gemini with retry-and-fallback), Postgres-backed auth and conversation memory, and **DJ AI** — a personal AI copilot embedded across the site that can answer questions about the projects, generate SQL/Python/DAX on request, and discuss recruiter fit, without needing the visitor to bring their own API key.

See [`CHANGELOG.md`](CHANGELOG.md) for the most recent engineering pass.

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

DJ AI is a personal AI copilot embedded across the site — not a scripted FAQ bot. It runs on a secure Node/Express backend (`/backend`) that holds the AI provider key server-side (never exposed to the browser), with:

- Multi-provider support (OpenAI, Anthropic, Gemini) with automatic retry-with-backoff and timeouts
- Optional Postgres-backed user accounts, conversation history, and long-term memory (degrades gracefully if no database is configured)
- Cloudflare Turnstile bot protection so the API budget isn't drained by scrapers
- A single public config file (`dj/production-config.js`) is all that's needed to point every page at a deployed backend — no build step, works with plain GitHub Pages

It can explain the projects below, generate SQL/Python/DAX on request, walk through Excel/Power BI workflows, and discuss recruiter fit — as a real conversation, not a fixed set of canned answers.

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
