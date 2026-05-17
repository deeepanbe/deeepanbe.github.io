let conversationHistory = [];
let currentMode = 'chat';
const djRateLimit = createLocalRateLimiter({ limit: 60, windowMs: 60_000 });

const SYSTEM_PROMPTS = {
  chat: "You are DJ, Deepanraj A.'s AI Data Analyst assistant. Explain his projects, resume, skills, and analytics workflow clearly.",
  sql: "You are DJ, a SQL expert assistant. Generate clean, well-commented SQL and explain it briefly.",
  python: "You are DJ, a Python data analysis assistant. Use pandas, numpy, matplotlib, seaborn, or scikit-learn.",
  resume: "You are DJ, a resume and career coach for Data Analyst, BI Developer, and Data Engineer roles.",
  upload: "You are DJ, a data analysis assistant. Help users inspect CSV, XLSX, and JSON datasets."
};

const LOCAL_KNOWLEDGE = `
Deepanraj A. is a Power BI Developer and Operations Analyst with 4+ years across manufacturing, textile, merchandising, quality, and operations analytics.
Target roles: Data Analyst, Data Engineer, BI Developer.
Target cities: Bengaluru, Chennai, Kochi.
Skills: Power BI, DAX, Power Query, Oracle SQL, T-SQL, Azure SQL, Python, Pandas, NumPy, Scikit-learn, Azure Data Factory, Blob Storage, Tableau, Excel VBA.
Projects: Sales & Inventory Dashboard, Azure Data Pipeline, Customer Segmentation Model, LinkedIn Automation System, SQL Cheat Sheet Visual, EDA Automation Script.
Certifications: Google Data Analytics Professional Certificate, Business Analyst Master Certification, Tata and BCG Forage simulations, PL-300 in progress.
`;

window.onload = () => {
  document.getElementById('greeting-bubble').textContent = DJ_CONFIG.GREETING;
  renderSuggestions();
  const params = new URLSearchParams(window.location.search);
  const prompt = params.get('prompt');
  if (prompt) {
    setTimeout(() => sendMessage(prompt), 350);
  }
};

function renderSuggestions() {
  const container = document.getElementById('dj-suggestions');
  container.innerHTML = DJ_CONFIG.SUGGESTIONS.map((suggestion) =>
    `<button class="dj-chip" onclick="sendChip('${escapeAttr(suggestion)}')">${suggestion}</button>`
  ).join('');
}

async function sendMessage(customText = null) {
  const input = document.getElementById('dj-input');
  const rate = djRateLimit();
  if (!rate.allowed) {
    appendMessage('ai', 'DJ is rate limited for a moment. Please wait a few seconds and try again.');
    return;
  }

  const sanitized = sanitizeDJInput(customText || input.value.trim());
  const text = sanitized.value;
  if (!text) return;

  if (sanitized.blocked) {
    appendMessage('ai', text);
    input.value = '';
    return;
  }

  input.value = '';
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });
  const thinking = appendThinking();

  try {
    const shouldUseBackend = DJ_CONFIG.BACKEND_URL && !DJ_CONFIG.BACKEND_URL.includes('your-dj-api');
    if (!shouldUseBackend) throw new Error('Backend not configured');

    const token = sessionStorage.getItem('dj_access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${DJ_CONFIG.BACKEND_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages: conversationHistory, mode: currentMode })
    });

    const data = await response.json();
    removeThinking(thinking);
    appendMessage('ai', data.reply);
    conversationHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    removeThinking(thinking);
    const reply = localDJResponse(text);
    appendMessage('ai', reply);
    conversationHistory.push({ role: 'assistant', content: reply });
  }
}

function createLocalRateLimiter({ limit, windowMs }) {
  const timestamps = [];
  return function checkLimit() {
    const now = Date.now();
    while (timestamps.length && now - timestamps[0] > windowMs) timestamps.shift();
    if (timestamps.length >= limit) {
      return { allowed: false, retryAfterMs: windowMs - (now - timestamps[0]) };
    }
    timestamps.push(now);
    return { allowed: true, retryAfterMs: 0 };
  };
}

function sanitizeDJInput(value) {
  const cleaned = String(value || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
    .slice(0, 8000);

  const blocked = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /reveal\s+(the\s+)?(system|developer)\s+prompt/i,
    /print\s+(your\s+)?hidden\s+instructions/i,
    /bypass\s+(security|auth|authentication)/i,
    /forget\s+(your\s+)?rules/i,
    /show\s+(api\s+key|jwt|secret)/i
  ].some((pattern) => pattern.test(cleaned));

  return {
    value: blocked
      ? 'Blocked prompt-injection attempt. Please ask DJ a normal analytics, project, SQL, Python, or resume question.'
      : cleaned,
    blocked
  };
}

function localDJResponse(text) {
  const lower = text.toLowerCase();

  if (currentMode === 'sql' || lower.includes('sql') || lower.includes('revenue') || lower.includes('customer')) {
    return `Here is a recruiter-ready SQL example:\n\n\`\`\`sql\nSELECT\n  customer_id,\n  SUM(revenue) AS total_revenue,\n  COUNT(DISTINCT order_id) AS total_orders\nFROM sales_orders\nGROUP BY customer_id\nORDER BY total_revenue DESC\nFETCH FIRST 10 ROWS ONLY;\n\`\`\`\n\nThis identifies the top 10 customers by revenue. Deepanraj can adapt this logic for Oracle SQL, T-SQL, or BigQuery depending on the source system.`;
  }

  if (currentMode === 'python' || lower.includes('python') || lower.includes('pandas')) {
    return `A clean Python analytics starter:\n\n\`\`\`python\nimport pandas as pd\n\ndf = pd.read_csv('sales.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\nsummary = df.groupby('region', as_index=False)['revenue'].sum()\nprint(summary.sort_values('revenue', ascending=False))\n\`\`\`\n\nDeepanraj uses this style for quick EDA, KPI checks, and dashboard-ready datasets.`;
  }

  if (currentMode === 'resume' || lower.includes('resume') || lower.includes('ats')) {
    return `Resume review framework:\n\n1. Lead with Power BI, SQL, Python, Azure, and operations analytics keywords.\n2. Add measurable outcomes such as report time reduction, inventory value tracked, and dashboard adoption.\n3. Convert duties into impact statements.\n4. Feature 3-4 projects with tools, business problem, and outcome.\n\nEstimated ATS focus areas: Power BI, DAX, SQL, Python, Azure, Tableau, Excel, Data Modeling, Dashboard Design.`;
  }

  if (lower.includes('power bi') || lower.includes('dashboard')) {
    return `Deepanraj's Power BI positioning:\n\n- Builds KPI dashboards for sales, inventory, HR, and operations.\n- Uses DAX, Power Query, slicers, drill-through, and data modeling.\n- Focuses on business decisions, not only visuals.\n- Strong use case: tracking inventory and operational performance for manufacturing/textile teams.`;
  }

  if (lower.includes('azure') || lower.includes('data engineer')) {
    return `Azure Data Pipeline summary:\n\nDeepanraj's Azure project direction uses Azure Data Factory, Blob Storage, and Azure SQL to move raw files into structured analytics tables. It supports a Data Analyst to Data Engineer transition by showing ingestion, transformation, storage, and BI readiness.`;
  }

  return `${SYSTEM_PROMPTS[currentMode]}\n\n${LOCAL_KNOWLEDGE}\n\nBased on your question, I would explain Deepanraj as a business-focused analyst who combines operations domain knowledge with Power BI, SQL, Python, Azure, Tableau, and Excel to build practical dashboards and analytics workflows.`;
}

function sendChip(text) {
  document.getElementById('dj-suggestions').style.display = 'none';
  sendMessage(text);
}

function appendMessage(role, text) {
  const container = document.getElementById('dj-messages');
  const div = document.createElement('div');
  div.className = `dj-msg dj-msg--${role === 'user' ? 'user' : 'ai'}`;
  div.innerHTML = role === 'ai'
    ? `<div class="dj-msg__avatar">DJ</div><div class="dj-msg__bubble">${formatMessage(text)}</div>`
    : `<div class="dj-msg__bubble">${escapeHtml(text)}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function formatMessage(text) {
  return escapeHtml(text)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function appendThinking() {
  const container = document.getElementById('dj-messages');
  const div = document.createElement('div');
  div.className = 'dj-msg dj-msg--ai dj-thinking';
  div.innerHTML = `<div class="dj-msg__avatar">DJ</div><div class="dj-msg__bubble"><span class="dot-pulse"></span><span class="dot-pulse" style="animation-delay:0.2s"></span><span class="dot-pulse" style="animation-delay:0.4s"></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function removeThinking(el) {
  el.remove();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

document.querySelectorAll('.dj-mode').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dj-mode').forEach((mode) => mode.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    document.getElementById('dj-upload-zone').style.display = currentMode === 'upload' ? 'flex' : 'none';
    conversationHistory = [];
  });
});

document.getElementById('file-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  appendMessage('ai', `Dataset upload selected: ${file.name}. Backend upload analysis will activate after the FastAPI service is deployed and DJ_CONFIG.BACKEND_URL is updated.`);
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}
