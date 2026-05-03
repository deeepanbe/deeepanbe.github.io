/* -----------------------------
   MOBILE NAV TOGGLE
------------------------------ */
const navToggle = document.getElementById("navToggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

/* -----------------------------
   SCROLL REVEAL ANIMATION
------------------------------ */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".section, .card, .timeline-item").forEach(el => {
  revealObserver.observe(el);
});

/* -----------------------------
   ANIMATED COUNTERS
------------------------------ */
const statSection = document.querySelector(".animated-stats");
let statsStarted = false;

function animateStats() {
  if (!statSection || statsStarted) return;

  const rect = statSection.getBoundingClientRect();
  if (rect.top < window.innerHeight - 80) {
    statsStarted = true;

    const values = statSection.querySelectorAll(".stat-value");
    values.forEach(el => {
      const target = parseInt(el.getAttribute("data-target"), 10);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + (target >= 40 ? "%" : "+");
      }, 30);
    });
  }
}

window.addEventListener("scroll", animateStats);
window.addEventListener("load", animateStats);

/* -----------------------------
   GITHUB STATS FETCH
------------------------------ */
async function loadGitHubStats() {
  try {
    const userRes = await fetch("https://api.github.com/users/deeepanbe");
    const user = await userRes.json();

    document.getElementById("gh-repos").textContent = user.public_repos ?? 0;
    document.getElementById("gh-followers").textContent = user.followers ?? 0;

    const reposRes = await fetch("https://api.github.com/users/deeepanbe/repos?per_page=100");
    const repos = await reposRes.json();
    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    document.getElementById("gh-stars").textContent = stars;
  } catch (e) {
    console.log("GitHub stats error:", e);
  }
}

window.addEventListener("load", loadGitHubStats);

/* -----------------------------
   LAZY LOAD DASHBOARDS
------------------------------ */
document.querySelectorAll("iframe").forEach(frame => {
  const src = frame.getAttribute("src");
  frame.setAttribute("data-src", src);
  frame.removeAttribute("src");
});

const iframeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.src = iframe.dataset.src;
        iframeObserver.unobserve(iframe);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll("iframe").forEach(iframe => {
  iframeObserver.observe(iframe);
});

/* -----------------------------
   CERTIFICATE SLIDER (SMOOTH)
------------------------------ */
const certTrack = document.querySelector(".cert-track");
let certOffset = 0;

function slideCerts() {
  certOffset -= 1;
  if (Math.abs(certOffset) >= certTrack.scrollWidth / 2) {
    certOffset = 0;
  }
  certTrack.style.transform = `translateX(${certOffset}px)`;
  requestAnimationFrame(slideCerts);
}

if (certTrack) {
  requestAnimationFrame(slideCerts);
}
