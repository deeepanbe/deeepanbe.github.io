# DJ AI — Deepanraj AI Analytics Portfolio

[![Live Site](https://img.shields.io/badge/live-deeepanbe.github.io-1677ff?style=flat-square)](https://deeepanbe.github.io)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-20%2F20%20passing-2ea44f?style=flat-square)](backend/test)
[![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20PostgreSQL-informational?style=flat-square)](backend)
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)](LICENSE)

**Live portfolio:** https://deeepanbe.github.io  
**Repository:** https://github.com/deeepanbe/deeepanbe.github.io

## Professional Positioning

**Deepanraj A — Data Analyst / BI / Operations Analytics candidate with ~9 years of operations, quality, manufacturing and textile-export domain experience.**

The portfolio demonstrates how that business context is being combined with hands-on **Power BI, SQL, Python, Excel, Tableau and Streamlit** capability. Portfolio projects are explicitly separated from commercial analytics employment experience.

**Target roles:** Data Analyst · BI Analyst · Power BI Analyst · MIS/Reporting Analyst · Operations Analyst · Manufacturing/Supply Chain Analyst

## Senior-level analytics approach

Projects are developed around a repeatable workflow:

**Business problem → Data understanding → Data quality → Modeling → Analysis → KPI governance → Visualization → Insight → Decision → Reproducibility**

The portfolio emphasizes traceable metrics, explicit assumptions, data validation, reusable analysis, decision-first dashboards and honest limitations. See [Senior Data Analyst Standards](docs/SENIOR_DATA_ANALYST_STANDARD.md).

## DJ AI Platform

DJ AI is the engineering project inside the portfolio: a Node/Express backend, multi-provider AI orchestration layer, PostgreSQL foundation, authentication/memory components, security middleware and browser-based assistant experience.

Supported provider architecture includes OpenAI, Anthropic, Gemini and a self-hosted Ollama option. Provider credentials remain server-side and are never intended to be placed in public portfolio code.

DJ AI is an **AI orchestration application, not a newly trained foundation model**. Its roadmap includes stronger retrieval, tools, evaluation and production integrations.

## Analytics Portfolio

- Power BI Universal Analytics Dashboard — KPI modeling, DAX, Power Query and SQL
- Olist E-Commerce BI Dashboard — marketplace, order lifecycle and logistics analytics
- Sales Forecasting Dashboard — planning and demand visibility
- BigQuery E-Commerce Analysis — warehouse SQL and revenue/order analysis
- Customer Segmentation ML — Python/pandas/scikit-learn segmentation
- HR Attrition Analysis — Python/Pandas EDA and business interpretation
- Hotel Booking Analysis — cancellation, ADR and time-pattern analysis

Detailed case-study structure: [projects/analytics-case-studies.md](projects/analytics-case-studies.md)

## Repository Structure

```text
.
├── index.html                 # Public analytics portfolio
├── dj/                        # DJ AI workspace and UI
├── ai/                        # Assistant/bridge logic
├── backend/                   # API, providers, auth, persistence
├── android/                   # Android-ready integration foundation
├── app/                       # Platform-side browser logic
├── dashboards/                # Dashboard documentation
├── projects/                  # Analytics case studies
├── assets/                    # Portfolio assets
├── scripts/                   # Platform scripts
├── .github/                  # CI/CD configuration
└── docs/                      # Architecture and analytics standards
```

## Engineering & Analytics Standards

- Preserve working functionality before refactoring.
- Validate data and untrusted input before using results.
- Keep AI providers behind adapters.
- Keep secrets server-side.
- Test critical backend behavior.
- Make important metrics traceable and reproducible.
- Document assumptions and limitations.
- Prefer small, reviewable changes.
- Never claim unsupported analytics, AI, employment or business-impact results.

## Security

Never commit API keys, database passwords, JWT secrets, webhook signing secrets, Turnstile secrets or other credentials. Public GitHub Pages files are public by design.

## Author

**Deepanraj A** — Data Analytics / BI candidate with operations, quality and textile-export domain experience.  
GitHub: https://github.com/deeepanbe  
LinkedIn: https://www.linkedin.com/in/deepanraj-data-analyst  
Portfolio: https://deeepanbe.github.io
