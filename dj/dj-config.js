const DJ_CONFIG = {
  // Public configuration only. Never put API keys, JWT secrets, database credentials,
  // Stripe secrets, or backend authentication secrets in this file.
  BACKEND_URL: window.DJ_BACKEND_URL || "",
  TURNSTILE_SITE_KEY: window.DJ_TURNSTILE_SITE_KEY || "",
  GREETING: "Hi, I am DJ AI. I am Deepanraj's portfolio assistant. Ask me about his verified Data Analyst / BI projects, Power BI, SQL, Python, Excel, operations analytics, or recruiter fit.",
  SUGGESTIONS: [
    "What is Deepanraj's strongest verified analytics project?",
    "Explain his Power BI RFM project",
    "What SQL skills does he demonstrate?",
    "Summarize his Python analytics capability",
    "Why is his operations experience useful for analytics?"
  ],
  POSITIONING: "Data Analyst / BI / Operations Analytics candidate with approximately 9 years of operations, quality, manufacturing and textile-export domain experience.",
  TARGET_ROLES: [
    "Data Analyst",
    "BI Analyst",
    "Power BI Analyst",
    "MIS / Reporting Analyst",
    "Operations Analyst",
    "Manufacturing / Supply Chain Analyst"
  ],
  VERIFIED_PROJECTS: [
    "Power BI Universal Analytics Dashboard",
    "Olist E-Commerce BI Dashboard",
    "BigQuery E-Commerce Analysis",
    "Customer Segmentation — RFM Analysis",
    "IBM HR Attrition Analysis",
    "Digital Marketing Leads Performance",
    "GDP Dashboard",
    "Hotel Booking Analysis",
    "Sales Forecasting Dashboard"
  ]
};

window.DJ_CONFIG = DJ_CONFIG;

if (DJ_CONFIG.BACKEND_URL && DJ_CONFIG.TURNSTILE_SITE_KEY) {
  const script = document.createElement('script');
  script.src = '/ai/dj-secure-bridge.js';
  script.defer = true;
  document.head.appendChild(script);
}