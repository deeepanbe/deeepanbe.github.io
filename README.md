# Deepanraj Arumugam — Portfolio

**Data & Visualization Engineer | Power BI Developer | SQL · Python · Azure**

Live portfolio: [deeepanbe.github.io](https://deeepanbe.github.io)

---

## 📁 Folder Structure

```
/
├── index.html                      ← Main portfolio homepage
├── style.css                       ← Shared design tokens & utilities
├── script.js                       ← Shared JS (theme, typing, chatbot, AI)
├── portfolio.css                   ← Extended page styles
├── portfolio.js                    ← Extended utilities
├── manifest.json                   ← PWA manifest
│
├── hr-dashboard.html               ← HR Analytics interactive demo
├── sales-dashboard.html            ← Sales Performance dashboard demo
├── operations-dashboard.html       ← Manufacturing/OPS KPI dashboard demo
│
├── resume/
│   ├── Deepanraj_DataVisualization_Engineer.pdf    ← Primary resume
│   ├── Deepanraj_DataVisualization_Engineer_v2.pdf ← Alternate version
│   ├── Deepanraj_DataVisualization_Engineer_v3.pdf ← Alternate version
│   └── Deepanraj_Operational_Analyst.pdf           ← Ops-focused resume
│
├── content/
│   └── certifications/
│       ├── cert_1.png              ← Certificate image 1
│       └── cert_2.png              ← Certificate image 2
│
└── assets/
    └── (icons, images — add as needed)
```

---

## ✨ Features

- **AI-Powered Chatbot** — Claude-powered assistant answers recruiter questions about skills, experience, and availability in real time
- **Typing Animation** — Cycles through role titles (Data Analyst, BI Developer, Visualization Engineer, etc.)
- **Live Dashboards** — Three fully interactive SVG dashboard demos: HR Analytics, Sales Performance, Operations KPIs
- **Download Resume** — Direct PDF download buttons for both resume versions
- **Certificate Gallery** — Lightbox viewer for certificate images
- **Dark / Light Mode** — Full CSS variable theming with localStorage persistence
- **Scroll Animations** — Fade-up entrance animations on all sections
- **Responsive** — Mobile-first, works down to 360px
- **PWA Ready** — manifest.json included for installability

---

## 🚀 Deployment (GitHub Pages)

1. Push all files to your `main` branch
2. Go to **Settings → Pages → Branch: main / root**
3. Your portfolio will be live at `https://deeepanbe.github.io`

---

## 📄 Resume Files

| File | Purpose |
|------|---------|
| `Deepanraj_DataVisualization_Engineer.pdf` | Primary — for Data Viz / BI Developer roles |
| `Deepanraj_Operational_Analyst.pdf` | For Operations Analyst roles |

To add more resumes: drop PDF into the `/resume/` folder and add a new `<a>` tag in the Resume section of `index.html`.

---

## 🖼️ Certificate Images

Place certificate images in `/content/certifications/` named `cert_1.png`, `cert_2.png`, etc.
The gallery in `index.html` auto-hides cards if the image file is missing (`onerror` handler).
To add more: duplicate the `.cert-img-card` block and update the `src` path.

---

## 🤖 AI Chatbot

The chatbot uses the Anthropic Claude API (`claude-sonnet-4-20250514`).
The API key is handled by the platform — no key setup needed on GitHub Pages when served via claude.ai artifacts.

For standalone deployment, you'll need to proxy the API call through a backend service (never expose API keys in frontend).

---

## 📞 Contact

- Email: deepanraj.a@outlook.com
- Phone: +91 89409 91095
- LinkedIn: [linkedin.com/in/deepanraj-data-analyst](https://linkedin.com/in/deepanraj-data-analyst)
- GitHub: [github.com/deeepanbe](https://github.com/deeepanbe)
