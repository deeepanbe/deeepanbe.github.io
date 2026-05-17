# DJ AI — Intelligent Portfolio Assistant

> Your Intelligent AI Data Analyst Workspace — built by Deepanraj A.

DJ is an AI assistant embedded in my portfolio. It helps recruiters, hiring managers, and visitors explore my analytics work interactively.

Try it live: [deeepanbe.github.io/dj/dj.html](https://deeepanbe.github.io/dj/dj.html)

## What DJ Can Do

- Answer questions about my projects and experience
- Explain Power BI dashboards and DAX logic
- Generate SQL queries on demand
- Provide Python pandas starter scripts
- Review resume positioning for ATS keywords
- Guide dataset analysis workflows
- Support future CSV/XLSX/JSON upload analysis

## Architecture

- Frontend: HTML, CSS, Vanilla JavaScript
- Hosting: GitHub Pages
- Backend target: FastAPI hosted on Render
- AI target: OpenAI GPT-4o-mini / GPT-4o
- RAG phase 1: markdown knowledge base
- RAG phase 2: ChromaDB or Pinecone
- Data analysis: pandas

## Phases

- [x] Phase 1: Editorial portfolio integration
- [x] Phase 1: DJ chat shell with local fallback replies
- [x] Phase 1: SQL / Python / resume / upload modes
- [ ] Phase 2: FastAPI backend
- [ ] Phase 2: Dataset upload analysis
- [ ] Phase 3: RAG knowledge retrieval
- [ ] Phase 4: Voice and advanced multi-agent workflows
