function openDJ() {
  window.open('dj/dj.html', '_blank', 'noopener');
}

function djExplain(projectName) {
  const target = `dj/dj.html?prompt=${encodeURIComponent(`Explain ${projectName}`)}`;
  window.open(target, '_blank', 'noopener');
}

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
  });

  navLinks.querySelectorAll('a, button').forEach((item) => {
    item.addEventListener('click', () => navLinks.classList.remove('is-open'));
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.animate(
        [
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 520, easing: 'ease-out', fill: 'both' }
      );
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.section-wrap, .dj-banner').forEach((section) => {
  revealObserver.observe(section);
});
