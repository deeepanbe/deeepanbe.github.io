const DJ_CONFIG = {
  // Public configuration only. Never put API keys, JWT secrets, database credentials,
  // Stripe secrets, or backend authentication secrets in this file.
  BACKEND_URL: window.DJ_BACKEND_URL || "",
  TURNSTILE_SITE_KEY: window.DJ_TURNSTILE_SITE_KEY || "",
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

if (DJ_CONFIG.BACKEND_URL && DJ_CONFIG.TURNSTILE_SITE_KEY) {
  const script = document.createElement('script');
  script.src = '/ai/dj-secure-bridge.js';
  script.defer = true;
  document.head.appendChild(script);
}