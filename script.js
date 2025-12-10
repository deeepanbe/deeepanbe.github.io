/* ==========================================================
   ADVANCED PORTFOLIO SCRIPT — Deepanraj A
   Features:
   ✔ Smooth scroll
   ✔ Sidebar active link detection
   ✔ ScrollSpy
   ✔ Dark mode memory
   ✔ Mobile nav behavior
   ✔ Section reveal animations
========================================================== */

/* --------------------------
   SMOOTH SCROLLING FOR LINKS
--------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
            top: target.offsetTop - 20,
            behavior: "smooth"
        });
    });
});

/* --------------------------
   SIDEBAR ACTIVE LINK UPDATE
--------------------------- */
const navLinks = document.querySelectorAll(".sidebar-nav a");

function setActiveLink() {
    let scrollPos = window.scrollY + 150;

    navLinks.forEach(link => {
        const section = document.querySelector(link.getAttribute("href"));
        if (!section) return;

        if (
            scrollPos > section.offsetTop &&
            scrollPos < section.offsetTop + section.offsetHeight
        ) {
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        }
    });
}
window.addEventListener("scroll", setActiveLink);

/* --------------------------
   DARK MODE TOGGLE (Optional)
--------------------------- */
const darkModeToggle = document.getElementById("darkToggle");

if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        // Save preference
        localStorage.setItem("theme", 
            document.body.classList.contains("dark") ? "dark" : "light"
        );
    });

    // Load saved preference
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
}

/* --------------------------
   MOBILE NAVIGATION
--------------------------- */
const mobileNav = document.createElement("div");
mobileNav.classList.add("mobile-nav");
mobileNav.innerHTML = `
    <button class="mobile-toggle">☰ Menu</button>
    <div class="mobile-links">
        <a href="#home">Home</a>
        <a href="#projects">Projects</a>
        <a href="#tools">AI Tools</a>
        <a href="#contact">Contact</a>
    </div>
`;
document.body.prepend(mobileNav);

document.querySelector(".mobile-toggle").addEventListener("click", () => {
    document.querySelector(".mobile-links").classList.toggle("open");
});

/* Close menu on link click */
document.querySelectorAll(".mobile-links a").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelector(".mobile-links").classList.remove("open");
    });
});

/* --------------------------
   SECTION REVEAL ANIMATION
--------------------------- */
const revealElements = document.querySelectorAll(".section, .project-card, .stat-card");

function revealOnScroll() {
    let trigger = window.innerHeight * 0.88;

    revealElements.forEach(el => {
        let top = el.getBoundingClientRect().top;
        if (top < trigger) {
            el.classList.add("visible");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* Add animation class (CSS must include .visible) */
document.querySelectorAll(".section, .project-card, .stat-card").forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(20px)";
});

/* When visible */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.transition = "0.6s ease";
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
        }
    });
});

document.querySelectorAll(".section, .project-card, .stat-card").forEach(el => {
    observer.observe(el);
});

/* --------------------------
   CONTACT FORM AUTO-FOCUS
--------------------------- */
document.querySelectorAll('a[href="#contact"]').forEach(btn => {
    btn.addEventListener("click", () => {
        setTimeout(() => {
            const input = document.querySelector('.contact-form input[name="name"]');
            if (input) input.focus();
        }, 600);
    });
});
