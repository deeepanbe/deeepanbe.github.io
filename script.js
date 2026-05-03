// script.js — Deepanraj Arumugam Portfolio
// Main JavaScript — runs on all pages

'use strict';

/* ===== THEME ===== */
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('da-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = saved === 'dark' ? '◐' : '●';
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('da-theme', next);
      btn.textContent = next === 'dark' ? '◐' : '●';
    });
  }
})();

/* ===== TYPING ANIMATION ===== */
function initTyping(elId, roles) {
  const el = document.getElementById(elId);
  if (!el) return;
  let ri = 0, ci = 0, deleting = false;
  function tick() {
    const r = roles[ri];
    if (!deleting) {
      el.textContent = r.slice(0, ++ci);
      if (ci === r.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = r.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 45 : 80);
  }
  tick();
}

/* ===== SCROLL FADE ===== */
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

/* ===== EXPERIENCE TOGGLE ===== */
function toggleExp(header) {
  const body = header.nextElementSibling;
  const icon = header.querySelector('.toggle-icon');
  const isOpen = body.classList.toggle('open');
  icon.classList.toggle('open', isOpen);
  icon.textContent = isOpen ? '−' : '+';
}

/* ===== LIGHTBOX ===== */
function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (!lb || !img) return;
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

/* ===== CHATBOT ===== */
const DEEPANRAJ_SYSTEM = `You are an AI assistant on Deepanraj Arumugam's data analyst portfolio website. Answer questions concisely and helpfully about Deepanraj.

PROFILE:
- Name: Deepanraj Arumugam
- Title: Data & Visualization Engineer | Data Analyst | Power BI Developer
- Experience: 8 years
- Location: Tamil Nadu, India | Open to relocate: Chennai / Kochi | Immediate joiner
- Contact: deepanraj.a@outlook.com | +91 8940991095
- GitHub: github.com/deeepanbe (440+ commits)
- LinkedIn: linkedin.com/in/deepanraj-data-analyst

CORE SKILLS:
- Power BI: Advanced DAX, Power Query, Data Modeling, KPI Dashboards, Drill-Through, Row-Level Security
- Python: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn, EDA, automated pipelines
- SQL: MySQL, Oracle SQL, T-SQL, Azure SQL Database, CTEs, Window Functions, query optimization
- Cloud: Microsoft Azure (SQL DB, Blob Storage, Data Factory), GCP BigQuery, Snowflake
- ETL: End-to-end pipeline design, star schema, data modeling, transformation, bulk insert
- Tools: Advanced Excel (VBA, PivotTables, Power Query), Jupyter Notebook, Git/GitHub, CI/CD

WORK HISTORY:
1. Dakshin Home Fashions (Mar 2021–Present): Built 10+ Power BI dashboards for plant leadership, Azure ETL pipelines, reduced manual reporting 40%, improved planning efficiency 30%
2. Lakshmi Life Sciences Ltd (Feb 2019–Jan 2020): Excel VBA MIS dashboards, MySQL/Oracle query analysis, data validation processes
3. Sundram Fasteners Limited (May 2016–Oct 2017): Production data analysis, SQL optimization, Excel dashboards for quality KPIs

KEY PROJECTS:
1. Azure Hybrid Analytics Pipeline — ETL: CSV → Azure Blob → Azure SQL → Power BI with star schema
2. Power BI Sales Performance Dashboard — DAX, drill-through, 30% planning efficiency improvement
3. GCP BigQuery Retail Data Analysis — large-scale SQL + Python visualization across millions of rows
4. Python EDA Retail Customer Analytics — Pandas/Seaborn/Matplotlib data storytelling
5. Snowflake Data Warehousing — cloud warehouse schemas for ingestion, transformation, analytics

CERTIFICATIONS: Microsoft PL-300 Power BI (In Progress), Google Data Analytics Coursera (2024), Business Analyst Master Edureka, Tata Data Visualization Forage, BCG Data Science Forage
EDUCATION: B.E. Mechanical Engineering, Pavai College of Technology, 2016

RULES: Keep answers short and recruiter-friendly. Use bullet points for lists. No markdown headers. Always encourage contacting Deepanraj directly for interviews.`;

function initChatbot() {
  const fab = document.getElementById('chatFab');
  const win = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const suggestions = document.getElementById('chatSuggestions');

  if (!fab || !win) return;

  fab.addEventListener('click', () => win.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => win.classList.add('hidden'));

  function getTime() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  function appendMsg(text, role) {
    const m = document.createElement('div');
    m.className = 'msg ' + role;
    m.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-time">${getTime()}</div>`;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function showTypingIndicator() {
    const m = document.createElement('div');
    m.className = 'msg bot'; m.id = 'typingMsg';
    m.innerHTML = `<div class="msg-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function removeTypingIndicator() {
    const m = document.getElementById('typingMsg');
    if (m) m.remove();
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    appendMsg(text, 'user');
    input.value = '';
    if (suggestions) suggestions.style.display = 'none';
    showTypingIndicator();

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: DEEPANRAJ_SYSTEM,
          messages: [{ role: 'user', content: text }]
        })
      });
      const data = await res.json();
      removeTypingIndicator();
      const reply = data.content?.[0]?.text || "I couldn't get a response right now. Contact Deepanraj at deepanraj.a@outlook.com.";
      appendMsg(reply.replace(/\n/g, '<br>'), 'bot');
    } catch (err) {
      removeTypingIndicator();
      appendMsg('Sorry, there was a network error. Please contact <a href="mailto:deepanraj.a@outlook.com">deepanraj.a@outlook.com</a> directly.', 'bot');
    }
  }

  window.sendSuggestion = function(btn) { sendMessage(btn.textContent); };
  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });
}

/* ===== ACTIVE NAV LINK ===== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ===== KEYBOARD ===== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initFadeUp();
  initActiveNav();
  initChatbot();
  initTyping('typingText', [
    'Data Analyst · SQL · Power BI',
    'BI Developer · DAX · Power Query',
    'Data Visualization Engineer',
    'Azure & Cloud Data Specialist',
    'Python · Pandas · EDA Expert'
  ]);
});
