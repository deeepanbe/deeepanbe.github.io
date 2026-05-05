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
});