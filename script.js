/* ===========================
   DARK MODE TOGGLE
   =========================== */
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const htmlElement = document.documentElement;
  
  // Check localStorage for saved preference
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'enabled') {
    htmlElement.setAttribute('data-theme', 'dark');
    if (darkModeToggle) darkModeToggle.checked = true;
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      if (htmlElement.getAttribute('data-theme') === 'dark') {
        htmlElement.removeAttribute('data-theme');
        localStorage.setItem('darkMode', 'disabled');
        darkModeToggle.textContent = '🌙';
      } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'enabled');
        darkModeToggle.textContent = '☀️';
      }
    });
  }
}

/* ===========================
   CONTACT FORM HANDLER
   =========================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      timestamp: new Date().toISOString()
    };

    try {
      // Using Formspree for serverless form handling
      const response = await fetch('https://formspree.io/f/xyzabc123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showNotification('Message sent successfully! I will get back to you soon.', 'success');
        contactForm.reset();
      } else {
        showNotification('Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showNotification('Error sending message. Please try again.', 'error');
    }
  });
}

/* ===========================
   NOTIFICATION SYSTEM
   =========================== */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#4caf50' : '#f44336'};
    color: white;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ===========================
   MOBILE NAV TOGGLE
   =========================== */
const navToggle = document.getElementById('navToggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Close menu when link is clicked
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

/* ===========================
   SCROLL REVEAL ANIMATION
   =========================== */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.section, .card, .timeline-item').forEach(el => {
  revealObserver.observe(el);
});

/* ===========================
   ANIMATED COUNTERS
   =========================== */
const statSection = document.querySelector('.animated-stats');
let statsStarted = false;

function animateStats() {
  if (!statSection || statsStarted) return;

  const rect = statSection.getBoundingClientRect();
  if (rect.top < window.innerHeight - 80) {
    statsStarted = true;

    const values = statSection.querySelectorAll('.stat-value');
    values.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + (target >= 40 ? '%' : '+');
      }, 30);
    });
  }
}

window.addEventListener('scroll', animateStats);
window.addEventListener('load', animateStats);

/* ===========================
   GITHUB STATS FETCH
   =========================== */
async function loadGitHubStats() {
  try {
    const userRes = await fetch('https://api.github.com/users/deeepanbe');
    const user = await userRes.json();

    const ghRepos = document.getElementById('gh-repos');
    const ghFollowers = document.getElementById('gh-followers');
    
    if (ghRepos) ghRepos.textContent = user.public_repos ?? 0;
    if (ghFollowers) ghFollowers.textContent = user.followers ?? 0;

    const reposRes = await fetch('https://api.github.com/users/deeepanbe/repos?per_page=100');
    const repos = await reposRes.json();
    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    const ghStars = document.getElementById('gh-stars');
    if (ghStars) ghStars.textContent = stars;
  } catch (e) {
    console.log('GitHub stats error:', e);
  }
}

window.addEventListener('load', loadGitHubStats);

/* ===========================
   LAZY LOAD DASHBOARDS
   =========================== */
document.querySelectorAll('iframe').forEach(frame => {
  const src = frame.getAttribute('src');
  if (src) {
    frame.setAttribute('data-src', src);
    frame.removeAttribute('src');
  }
});

const iframeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        if (iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
        }
        iframeObserver.unobserve(iframe);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('iframe').forEach(iframe => {
  iframeObserver.observe(iframe);
});

/* ===========================
   CERTIFICATE SLIDER (SMOOTH)
   =========================== */
const certTrack = document.querySelector('.cert-track');
if (certTrack) {
  let certOffset = 0;

  function slideCerts() {
    certOffset -= 1;
    if (Math.abs(certOffset) >= certTrack.scrollWidth / 2) {
      certOffset = 0;
    }
    certTrack.style.transform = `translateX(${certOffset}px)`;
    requestAnimationFrame(slideCerts);
  }

  requestAnimationFrame(slideCerts);
}

/* ===========================
   SMOOTH SCROLL BEHAVIOR
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ===========================
   INITIALIZE ON PAGE LOAD
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initContactForm();
  initPrivateAccessPortal();
});

/* ===========================
   PRIVATE ACCESS PORTAL
   Static-site security note:
   This is frontend password protection for GitHub Pages compatibility.
   Do not store sensitive confidential company data in this public repo.
   Firebase Authentication or another server-backed auth layer can be added later.
   =========================== */
function initPrivateAccessPortal() {
  const PASSWORD = 'De910995@';
  const SESSION_KEY = 'deepanrajPrivateAccessUnlocked';
  const root = document.getElementById('privateAccessRoot') || createPrivateAccessRoot();

  ensurePrivateAccessStylesheet();
  root.innerHTML = privateAccessTemplate();

  const accessButton = root.querySelector('[data-private-open]');
  const loginOverlay = root.querySelector('[data-private-login-overlay]');
  const loginModal = root.querySelector('[data-private-login-modal]');
  const loginClose = root.querySelector('[data-private-login-close]');
  const loginForm = root.querySelector('[data-private-login-form]');
  const passwordInput = root.querySelector('[data-private-password]');
  const passwordToggle = root.querySelector('[data-private-password-toggle]');
  const errorMessage = root.querySelector('[data-private-error]');
  const dashboard = root.querySelector('[data-secure-dashboard]');
  const dashboardGrid = root.querySelector('[data-secure-content]');
  const dashboardClose = root.querySelector('[data-secure-dashboard-close]');
  const logoutButton = root.querySelector('[data-secure-logout]');
  const previewOverlay = root.querySelector('[data-secure-preview-overlay]');
  const previewTitle = root.querySelector('[data-secure-preview-title]');
  const previewBody = root.querySelector('[data-secure-preview-body]');
  const previewClose = root.querySelector('[data-secure-preview-close]');

  const sections = getSecureFileSections();
  dashboardGrid.innerHTML = sections.map(renderSecureSection).join('');

  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    accessButton.classList.add('is-unlocked');
  }

  accessButton.addEventListener('click', () => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      openDashboard();
      return;
    }
    openLogin();
  });

  loginClose.addEventListener('click', closeLogin);
  loginOverlay.addEventListener('click', (event) => {
    if (event.target === loginOverlay) closeLogin();
  });

  passwordToggle.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    passwordToggle.textContent = isHidden ? 'Hide' : 'Show';
    passwordToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    passwordInput.focus();
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (passwordInput.value === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      errorMessage.textContent = '';
      passwordInput.value = '';
      closeLogin();
      openDashboard();
      accessButton.classList.add('is-unlocked');
      return;
    }

    errorMessage.textContent = 'Invalid password';
    loginModal.classList.remove('is-shaking');
    void loginModal.offsetWidth;
    loginModal.classList.add('is-shaking');
    passwordInput.select();
  });

  dashboardClose.addEventListener('click', closeDashboard);
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    accessButton.classList.remove('is-unlocked');
    closeDashboard();
    openLogin();
  });

  dashboardGrid.addEventListener('click', (event) => {
    const previewButton = event.target.closest('[data-secure-preview]');
    if (!previewButton) return;

    const file = findSecureFile(previewButton.dataset.securePreview, sections);
    if (file) openPreview(file);
  });

  previewClose.addEventListener('click', closePreview);
  previewOverlay.addEventListener('click', (event) => {
    if (event.target === previewOverlay) closePreview();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (previewOverlay.classList.contains('is-open')) closePreview();
    else if (dashboard.classList.contains('is-open')) closeDashboard();
    else if (loginOverlay.classList.contains('is-open')) closeLogin();
  });

  function openLogin() {
    loginOverlay.classList.add('is-open');
    loginOverlay.setAttribute('aria-hidden', 'false');
    errorMessage.textContent = '';
    setTimeout(() => passwordInput.focus(), 60);
  }

  function closeLogin() {
    loginOverlay.classList.remove('is-open');
    loginOverlay.setAttribute('aria-hidden', 'true');
  }

  function openDashboard() {
    dashboard.classList.add('is-open');
    dashboard.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDashboard() {
    dashboard.classList.remove('is-open');
    dashboard.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openPreview(file) {
    previewTitle.textContent = file.name;
    previewBody.innerHTML = buildPreviewMarkup(file);
    previewOverlay.classList.add('is-open');
    previewOverlay.setAttribute('aria-hidden', 'false');
  }

  function closePreview() {
    previewOverlay.classList.remove('is-open');
    previewOverlay.setAttribute('aria-hidden', 'true');
    previewBody.innerHTML = '';
  }
}

function createPrivateAccessRoot() {
  const root = document.createElement('div');
  root.id = 'privateAccessRoot';
  document.body.appendChild(root);
  return root;
}

function ensurePrivateAccessStylesheet() {
  const hasStyleSheet = Array.from(document.styleSheets).some((sheet) => {
    return sheet.href && sheet.href.includes('style.css');
  });

  if (hasStyleSheet) return;

  if (document.getElementById('privateAccessScopedStyles')) return;

  const style = document.createElement('style');
  style.id = 'privateAccessScopedStyles';
  style.textContent = getPrivateAccessScopedStyles();
  document.head.appendChild(style);
}

function getPrivateAccessScopedStyles() {
  return `
    #privateAccessRoot{--secure-bg:#070b14;--secure-panel-strong:rgba(12,19,33,.96);--secure-border:rgba(148,163,184,.22);--secure-border-bright:rgba(96,165,250,.46);--secure-text:#f8fafc;--secure-muted:#9ca3af;--secure-dim:#64748b;--secure-blue:#60a5fa;--secure-green:#34d399;--secure-red:#fb7185;--secure-glow:0 24px 80px rgba(37,99,235,.34);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0}
    #privateAccessRoot *,#privateAccessRoot *::before,#privateAccessRoot *::after{box-sizing:border-box}
    #privateAccessRoot button,#privateAccessRoot input,#privateAccessRoot a{font-family:inherit;letter-spacing:0}
    #privateAccessRoot section{padding:0}
    #privateAccessRoot .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .private-access-button{position:fixed;left:clamp(14px,2vw,28px);bottom:clamp(14px,2vw,28px);z-index:2147482000;display:inline-flex;align-items:center;gap:11px;min-height:54px;padding:12px 18px;border:1px solid rgba(255,255,255,.2);border-radius:16px;background:linear-gradient(135deg,rgba(96,165,250,.2),rgba(52,211,153,.12)),rgba(10,14,26,.76);color:var(--secure-text);box-shadow:0 18px 48px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.1);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);cursor:pointer;font:800 .94rem/1.1 Inter,ui-sans-serif,system-ui,sans-serif;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
    .private-access-button:hover{transform:translateY(-4px);border-color:rgba(96,165,250,.58);box-shadow:0 24px 70px rgba(37,99,235,.34),inset 0 1px 0 rgba(255,255,255,.16)}
    .private-access-button__icon{display:grid;place-items:center;width:32px;height:32px;border-radius:11px;background:rgba(96,165,250,.18);box-shadow:inset 0 0 0 1px rgba(96,165,250,.28)}
    .private-access-button__text{display:grid;gap:3px;text-align:left}.private-access-button__sub{color:#b6c4d8;font-size:.68rem;font-weight:650}
    .private-access-overlay,.secure-preview-overlay{position:fixed;inset:0;z-index:2147482500;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(2,6,23,.72);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;transition:opacity .22s ease}
    .private-access-overlay.is-open,.secure-preview-overlay.is-open{display:flex;opacity:1}
    .private-access-modal{width:min(100%,440px);position:relative;overflow:hidden;border:1px solid var(--secure-border);border-radius:24px;background:radial-gradient(circle at 15% 0%,rgba(96,165,250,.2),transparent 32%),radial-gradient(circle at 90% 12%,rgba(52,211,153,.13),transparent 34%),var(--secure-panel-strong);box-shadow:var(--secure-glow),0 24px 90px rgba(0,0,0,.62);padding:30px;color:var(--secure-text);transform:translateY(14px) scale(.98);animation:privateAccessIn .26s ease forwards}
    .private-access-close,.secure-dashboard-close,.secure-preview-close{border:1px solid rgba(148,163,184,.24);background:rgba(15,23,42,.72);color:var(--secure-text);width:38px;height:38px;border-radius:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
    .private-access-close:hover,.secure-dashboard-close:hover,.secure-preview-close:hover{transform:translateY(-2px);border-color:var(--secure-border-bright);background:rgba(30,41,59,.88)}
    .private-access-close{position:absolute;top:18px;right:18px}.private-access-modal h2,.secure-dashboard h2{color:var(--secure-text);margin:0;letter-spacing:0}.private-access-kicker{margin-top:8px;color:var(--secure-muted);font-size:.98rem}
    .private-access-form{margin-top:26px;display:grid;gap:16px}.private-password-field{position:relative}.private-password-field input{width:100%;height:54px;border:1px solid rgba(148,163,184,.22);border-radius:15px;background:rgba(2,6,23,.58);color:var(--secure-text);padding:0 54px 0 16px;outline:none;font:700 1rem/1 Inter,ui-sans-serif,system-ui,sans-serif;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.private-password-field input:focus{border-color:rgba(96,165,250,.72);box-shadow:0 0 0 4px rgba(96,165,250,.14);background:rgba(2,6,23,.72)}
    .private-password-toggle{position:absolute;top:8px;right:8px;width:38px;height:38px;border:0;border-radius:12px;background:rgba(96,165,250,.12);color:#dbeafe;cursor:pointer}.private-unlock-button,.secure-logout-button,.secure-card-action{border:0;color:#06111f;background:linear-gradient(135deg,var(--secure-blue),var(--secure-green));border-radius:14px;font-weight:850;cursor:pointer;box-shadow:0 16px 36px rgba(37,99,235,.3);transition:transform .18s ease,box-shadow .18s ease,filter .18s ease}.private-unlock-button{height:52px;font-size:.98rem}.private-unlock-button:hover,.secure-logout-button:hover,.secure-card-action:hover{transform:translateY(-2px);box-shadow:0 20px 46px rgba(37,99,235,.38);filter:saturate(1.08)}
    .private-access-error{min-height:20px;color:var(--secure-red);font-size:.88rem;font-weight:750}.private-access-modal.is-shaking{animation:secureShake .42s ease}
    .secure-dashboard-shell{position:fixed;inset:0;z-index:2147482300;display:none;overflow:auto;background:radial-gradient(circle at 12% 0%,rgba(96,165,250,.2),transparent 30%),radial-gradient(circle at 92% 12%,rgba(52,211,153,.14),transparent 28%),var(--secure-bg);color:var(--secure-text);padding:26px}.secure-dashboard-shell.is-open{display:block}.secure-dashboard{width:min(1240px,100%);margin:0 auto}
    .secure-dashboard-header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px;padding:18px;border:1px solid var(--secure-border);border-radius:22px;background:rgba(8,13,24,.76);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,.32)}.secure-dashboard-subtitle{color:var(--secure-muted);margin-top:5px;font-size:.94rem}.secure-dashboard-actions{display:flex;gap:10px;align-items:center}.secure-logout-button{min-height:38px;padding:0 16px}
    .secure-section{margin:0 0 28px}.secure-section-title{display:flex;align-items:baseline;gap:10px;margin-bottom:14px}.secure-section-title h3{margin:0;color:var(--secure-text);font-size:1rem}.secure-section-title span{color:var(--secure-dim);font-size:.82rem;font-weight:700}.secure-file-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
    .secure-file-card,.secure-empty-card{position:relative;overflow:hidden;min-height:178px;border:1px solid var(--secure-border);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.02)),rgba(15,23,42,.66);box-shadow:0 18px 48px rgba(0,0,0,.28);padding:18px;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.secure-file-card:hover{transform:translateY(-5px);border-color:var(--secure-border-bright);box-shadow:0 24px 70px rgba(37,99,235,.22)}
    .secure-file-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.secure-file-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:rgba(96,165,250,.14);color:#bfdbfe;font-size:1.45rem;box-shadow:inset 0 0 0 1px rgba(96,165,250,.18)}.secure-file-badge{border-radius:999px;padding:5px 9px;background:rgba(52,211,153,.13);color:#bbf7d0;font-size:.68rem;font-weight:850}.secure-file-name{margin-top:18px;color:var(--secure-text);font-size:.98rem;font-weight:800;line-height:1.35}.secure-file-meta,.secure-empty-card{color:var(--secure-muted);font-size:.82rem}.secure-file-actions{display:flex;gap:10px;margin-top:18px}.secure-card-action{display:inline-flex;justify-content:center;align-items:center;min-height:38px;padding:0 13px;font-size:.78rem;text-decoration:none}.secure-card-action.secondary{color:var(--secure-text);background:rgba(148,163,184,.12);border:1px solid rgba(148,163,184,.2);box-shadow:none}.secure-empty-card{display:grid;place-items:center;text-align:center;border-style:dashed}
    .secure-preview-dialog{width:min(1120px,100%);height:min(86vh,820px);display:grid;grid-template-rows:auto 1fr;overflow:hidden;border:1px solid var(--secure-border);border-radius:22px;background:var(--secure-panel-strong);box-shadow:var(--secure-glow),0 24px 90px rgba(0,0,0,.64)}.secure-preview-header{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--secure-border)}.secure-preview-title{color:var(--secure-text);font-weight:850}.secure-preview-body{display:grid;place-items:center;min-height:0;padding:14px}.secure-preview-body iframe,.secure-preview-body img{width:100%;height:100%;border:0;border-radius:14px;background:rgba(2,6,23,.72);object-fit:contain}.secure-preview-message{color:var(--secure-muted);text-align:center;max-width:520px}
    @keyframes privateAccessIn{to{transform:translateY(0) scale(1)}}@keyframes secureShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
    @media (max-width:720px){.private-access-button{min-height:48px;padding:10px 13px;border-radius:14px}.private-access-button__sub{display:none}.private-access-overlay,.secure-preview-overlay{padding:14px}.private-access-modal{padding:24px 20px;border-radius:20px}.secure-dashboard-shell{padding:14px}.secure-dashboard-header{position:static;align-items:flex-start;flex-direction:column}.secure-dashboard-actions{width:100%}.secure-logout-button,.secure-dashboard-close{flex:1}.secure-file-grid{grid-template-columns:1fr}.secure-file-actions{flex-direction:column}.secure-preview-dialog{height:82vh}}
    @media (prefers-reduced-motion:reduce){.private-access-button,.private-access-modal,.secure-file-card,.secure-card-action{animation:none;transition:none}}
  `;
}

function privateAccessTemplate() {
  return `
    <button class="private-access-button" type="button" data-private-open aria-label="Open private access portal">
      <span class="private-access-button__icon" aria-hidden="true">🔒</span>
      <span class="private-access-button__text">
        <span>Private Access</span>
        <span class="private-access-button__sub">Authorized files</span>
      </span>
    </button>

    <div class="private-access-overlay" data-private-login-overlay aria-hidden="true">
      <section class="private-access-modal" data-private-login-modal role="dialog" aria-modal="true" aria-labelledby="privateAccessTitle">
        <button class="private-access-close" type="button" data-private-login-close aria-label="Close private access">×</button>
        <h2 id="privateAccessTitle">🔒 Private Access</h2>
        <p class="private-access-kicker">Authorized access only</p>
        <form class="private-access-form" data-private-login-form>
          <label class="private-password-field">
            <span class="sr-only">Password</span>
            <input type="password" data-private-password autocomplete="current-password" placeholder="Enter password" aria-label="Password" required>
            <button class="private-password-toggle" type="button" data-private-password-toggle aria-label="Show password">Show</button>
          </label>
          <div class="private-access-error" data-private-error aria-live="polite"></div>
          <button class="private-unlock-button" type="submit">Unlock Secure Portal</button>
        </form>
      </section>
    </div>

    <section class="secure-dashboard-shell" data-secure-dashboard aria-hidden="true" aria-label="Private Information Center">
      <div class="secure-dashboard">
        <header class="secure-dashboard-header">
          <div>
            <h2>Private Information Center</h2>
            <p class="secure-dashboard-subtitle">Premium recruiter/client document portal</p>
          </div>
          <div class="secure-dashboard-actions">
            <button class="secure-logout-button" type="button" data-secure-logout>Logout</button>
            <button class="secure-dashboard-close" type="button" data-secure-dashboard-close aria-label="Close private dashboard">×</button>
          </div>
        </header>
        <div data-secure-content></div>
      </div>
    </section>

    <div class="secure-preview-overlay" data-secure-preview-overlay aria-hidden="true">
      <section class="secure-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="securePreviewTitle">
        <header class="secure-preview-header">
          <div class="secure-preview-title" id="securePreviewTitle" data-secure-preview-title></div>
          <button class="secure-preview-close" type="button" data-secure-preview-close aria-label="Close preview">×</button>
        </header>
        <div class="secure-preview-body" data-secure-preview-body></div>
      </section>
    </div>
  `;
}

function getSecureFileSections() {
  const base = 'assets/secure-files/';
  return [
    {
      title: 'Resume Files',
      files: [
        { id: 'resume-pdf', name: 'Deepanraj Arumugam Resume', type: 'PDF', url: base + 'deepanraj_resume.pdf', icon: '📄' },
        { id: 'resume-docx', name: 'Deepanraj Arumugam Resume - Word', type: 'DOCX', url: base + 'deepanraj_resume.docx', icon: '📝' }
      ]
    },
    {
      title: 'Certificates',
      files: [
        { id: 'google-analytics-pdf', name: 'Google Analytics Certificate', type: 'PDF', url: base + 'google_analytics_certificate.pdf', icon: '🎓' },
        { id: 'google-analytics-jpg', name: 'Google Analytics Certificate Image', type: 'JPG', url: base + 'google_analytics_certificate.jpg', icon: '🖼️' },
        { id: 'microsoft-data-viz', name: 'Microsoft Data Visualization', type: 'PDF', url: base + 'microsoft_data_visualization.pdf', icon: '🎓' },
        { id: 'data-viz-jpg', name: 'Data Visualization Certificate Image', type: 'JPG', url: base + 'data_visualization_certificate.jpg', icon: '🖼️' },
        { id: 'edureka-business', name: 'Business Analyst Master Program', type: 'PDF', url: base + 'business_analyst_master_program.pdf', icon: '🎓' }
      ]
    },
    {
      title: 'Dashboard Screenshots',
      files: [
        { id: 'dashboard-showcase', name: 'Dashboard Showcase Preview', type: 'JPG', url: base + 'dashboard_showcase.jpg', icon: '📊' }
      ]
    },
    {
      title: 'Reports',
      files: [
        { id: 'report-business-analyst', name: 'Business Analyst Program Report', type: 'PDF', url: base + 'business_analyst_master_program.pdf', icon: '📑' }
      ]
    },
    {
      title: 'Excel Files',
      files: []
    },
    {
      title: 'Word Documents',
      files: [
        { id: 'resume-word-document', name: 'Resume Source Document', type: 'DOCX', url: base + 'deepanraj_resume.docx', icon: '📝' }
      ]
    }
  ];
}

function renderSecureSection(section) {
  const files = section.files.length
    ? section.files.map(renderSecureFileCard).join('')
    : '<article class="secure-empty-card">Upload clean .xlsx, .pptx, .pdf, .png, or .jpg files into assets/secure-files to show them here.</article>';

  return `
    <section class="secure-section">
      <div class="secure-section-title">
        <h3>${escapeHtml(section.title)}</h3>
        <span>${section.files.length} item${section.files.length === 1 ? '' : 's'}</span>
      </div>
      <div class="secure-file-grid">${files}</div>
    </section>
  `;
}

function renderSecureFileCard(file) {
  return `
    <article class="secure-file-card">
      <div class="secure-file-top">
        <div class="secure-file-icon" aria-hidden="true">${file.icon}</div>
        <span class="secure-file-badge">${escapeHtml(file.type)}</span>
      </div>
      <div class="secure-file-name">${escapeHtml(file.name)}</div>
      <div class="secure-file-meta">${escapeHtml(file.type)} secure-file asset</div>
      <div class="secure-file-actions">
        <button class="secure-card-action" type="button" data-secure-preview="${escapeHtml(file.id)}">Preview</button>
        <a class="secure-card-action secondary" href="${encodeURI(file.url)}" download>Download</a>
      </div>
    </article>
  `;
}

function findSecureFile(id, sections) {
  for (const section of sections) {
    const match = section.files.find((file) => file.id === id);
    if (match) return match;
  }
  return null;
}

function buildPreviewMarkup(file) {
  const safeUrl = encodeURI(file.url);
  const safeName = escapeHtml(file.name);
  const imageTypes = ['JPG', 'JPEG', 'PNG'];

  if (file.type === 'PDF') {
    return `<iframe src="${safeUrl}" title="${safeName} PDF preview"></iframe>`;
  }

  if (imageTypes.includes(file.type)) {
    return `<img src="${safeUrl}" alt="${safeName} preview">`;
  }

  return `
    <div class="secure-preview-message">
      <strong>${safeName}</strong><br>
      Browser preview is limited for ${escapeHtml(file.type)} files on static hosting. Use Download to open the file locally.
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
