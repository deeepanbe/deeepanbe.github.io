const DJ_CONFIG = {
  // Set these in the deployed frontend. Never put a backend secret here.
  BACKEND_URL: "",
  TURNSTILE_SITE_KEY: "",
  GREETING: "Hi, I am DJ AI. I can explain Deepanraj's projects, generate SQL, draft Python analysis, help with Excel reporting, suggest Power BI DAX, recommend dashboards, and summarize recruiter fit.",
  SUGGESTIONS: [
    "Explain Deepanraj's strongest Power BI project",
    "Generate SQL for top 10 customers by revenue",
    "Create Python pandas steps for cleaning sales data",
    "Suggest DAX measures for inventory performance",
    "Recommend dashboard pages for an operations report"
  ]
};

window.DJ_CONFIG = DJ_CONFIG;

// Load the secret-free Turnstile bridge only when a real backend and public site key
// are configured. The bridge never contains or transmits a backend secret.
if (DJ_CONFIG.BACKEND_URL && DJ_CONFIG.TURNSTILE_SITE_KEY) {
  const script = document.createElement('script');
  script.src = '../ai/dj-secure-bridge.js';
  script.defer = true;
  document.head.appendChild(script);
}
