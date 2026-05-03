// portfolio.js — Deepanraj Arumugam Portfolio
// Shared JS utilities used across all pages

// ===== THEME =====
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('da-theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  root.setAttribute('data-theme', saved || system);
})();

function initThemeToggle(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const root = document.documentElement;
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('da-theme', next);
    btn.textContent = next === 'dark' ? '◐' : '●';
  });
}

// ===== SCROLL FADE =====
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

// ===== EXP TOGGLE =====
function toggleExp(header) {
  const body = header.nextElementSibling;
  const icon = header.querySelector('.toggle-icon');
  const isOpen = body.classList.toggle('open');
  icon.classList.toggle('open', isOpen);
  icon.textContent = isOpen ? '−' : '+';
}

// ===== TYPING =====
function initTyping(elId, roles) {
  const el = document.getElementById(elId);
  if (!el) return;
  let ri = 0, ci = 0, deleting = false;
  function type() {
    const r = roles[ri];
    if (!deleting) {
      el.textContent = r.slice(0, ++ci);
      if (ci === r.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = r.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 45 : 80);
  }
  type();
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeBtn');
  initFadeUp();
  initTyping('typingText', [
    'Data Analyst · SQL · Power BI',
    'BI Developer · DAX · Power Query',
    'Data Visualization Engineer',
    'Azure & Cloud Data Specialist',
    'Python · Pandas · EDA Expert'
  ]);
});
