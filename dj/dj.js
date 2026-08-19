(function () {
  "use strict";

  const config = window.DJ_CONFIG || {
    GREETING: "Hi, I am DJ AI. Ask me about Deepanraj's analytics projects, SQL, Python, Power BI, Excel, or resume fit.",
    SUGGESTIONS: [
      "Explain Deepanraj's strongest project",
      "Generate a SQL query for sales trends",
      "Suggest Power BI KPIs",
      "Review resume fit for Data Analyst"
    ],
    BACKEND_URL: ""
  };

  const storageKey = "deepanraj.dj.workspace.history.v2";
  const sessionIdKey = "deepanraj.dj.session.id.v1";
  const rateLimit = createRateLimiter({ limit: 45, windowMs: 60 * 1000 });

  function getSessionId() {
    try {
      let id = sessionStorage.getItem(sessionIdKey);
      if (!id) {
        id = createId();
        sessionStorage.setItem(sessionIdKey, id);
      }
      return id;
    } catch {
      return "";
    }
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const messagesEl = $("#dj-messages");
  const greetingEl = $("#greeting-bubble");
  const suggestionsEl = $("#dj-suggestions");
  const form = $("[data-chat-form]");
  const input = $("#dj-input");
  const uploadZone = $("#dj-upload-zone");
  const fileInput = $("#file-input");
  const historyList = $("[data-history-list]");
  const modeButtons = $$("[data-mode]");

  let mode = "chat";
  let activeId = createId();
  let messages = [];
  let history = loadHistory();

  const systemKnowledge = {
    profile: "Deepanraj Arumugam is a Data Analyst and AI Solutions Developer with Power BI, SQL, Python, Excel, Tableau, Azure concepts, and 4+ years of operations and manufacturing analytics experience.",
    projects: "Portfolio projects include Power BI Universal Analytics Dashboard, Enterprise Analytics Project, Customer Segmentation ML, BigQuery E-Commerce Analysis, Sales Forecasting Dashboard, and Retail Inventory Management.",
    services: "Services include Power BI dashboards, SQL analytics, Excel automation, Python scripting, KPI reporting, data cleaning, and AI analytics integration.",
    target: "Target audiences include HR recruiters, hiring managers, freelance clients, startup founders, and analytics teams."
  };

  function createId() {
    return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function createRateLimiter({ limit, windowMs }) {
    const timestamps = [];
    return function check() {
      const now = Date.now();
      while (timestamps.length && now - timestamps[0] > windowMs) timestamps.shift();
      if (timestamps.length >= limit) return false;
      timestamps.push(now);
      return true;
    };
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 10)));
  }

  function persistConversation() {
    if (messages.length < 2) return;
    const firstUser = messages.find((msg) => msg.role === "user");
    const title = firstUser ? firstUser.content.slice(0, 58) : "DJ AI conversation";
    const entry = { id: activeId, title, mode, messages: messages.slice(-14) };
    history = [entry, ...history.filter((item) => item.id !== activeId)].slice(0, 10);
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    if (!history.length) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "No saved chats yet.";
      historyList.appendChild(empty);
      return;
    }

    history.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.title;
      button.addEventListener("click", () => {
        activeId = item.id;
        mode = item.mode || "chat";
        messages = item.messages || [];
        setMode(mode);
        renderConversation();
      });
      historyList.appendChild(button);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function highlightCode(code, language) {
    const keywordMap = {
      sql: ["SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "SUM", "COUNT", "AVG", "CASE", "WHEN", "THEN", "END", "JOIN", "ON", "DATE_TRUNC"],
      python: ["import", "from", "def", "return", "for", "in", "as", "print", "groupby", "read_csv", "read_excel"],
      dax: ["CALCULATE", "DIVIDE", "SUM", "AVERAGE", "FILTER", "ALL", "DATESYTD", "NULLIF"]
    };
    let safe = escapeHtml(code);
    (keywordMap[language] || []).forEach((word) => {
      safe = safe.replace(new RegExp(`\\b${word}\\b`, "gi"), (match) => `<span class="code-keyword">${match}</span>`);
    });
    return safe;
  }

  function formatMarkdown(text) {
    const fences = [];
    const withoutFences = String(text).replace(/```(\w+)?\n([\s\S]*?)```/g, (_, language = "text", code) => {
      const token = `CODE_BLOCK_${fences.length}_TOKEN`;
      fences.push({ language: language.toLowerCase(), code });
      return token;
    });

    let html = escapeHtml(withoutFences)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br>");

    html = `<p>${html}</p>`.replace(/<p><\/p>/g, "");
    fences.forEach((fence, index) => {
      const token = `CODE_BLOCK_${index}_TOKEN`;
      const block = `<pre><code class="language-${fence.language}">${highlightCode(fence.code, fence.language)}</code></pre>`;
      html = html.replace(`<p>${token}</p>`, block).replace(token, block);
    });

    return html;
  }

  function appendMessage(role, content, options = {}) {
    const row = document.createElement("article");
    row.className = `message ${role === "user" ? "user" : "assistant"}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "You" : "DJ";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (options.raw) bubble.textContent = content;
    else bubble.innerHTML = formatMarkdown(content);

    if (role === "user") row.append(bubble, avatar);
    else row.append(avatar, bubble);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function renderConversation() {
    const first = messagesEl.querySelector(".message");
    messagesEl.innerHTML = "";
    if (!messages.length && first) {
      messagesEl.appendChild(first);
      return;
    }
    messages.forEach((message) => appendMessage(message.role, message.content));
  }

  function sanitize(value) {
    const cleaned = String(value || "")
      .replace(/[\u0000-\u001f]/g, "")
      .trim()
      .slice(0, 5000);

    const blocked = [
      /ignore\s+(all\s+)?previous\s+instructions/i,
      /reveal\s+(system|developer|hidden)\s+prompt/i,
      /show\s+(api\s+key|secret|token)/i,
      /bypass\s+(security|auth|authentication)/i,
      /forget\s+(your\s+)?rules/i
    ].some((pattern) => pattern.test(cleaned));

    return {
      blocked,
      value: blocked ? "Blocked prompt-injection attempt. Please ask DJ a normal analytics, project, SQL, Python, Excel, Power BI, or resume question." : cleaned
    };
  }

  async function backendReply(text) {
    const backendUrl = config.BACKEND_URL || "";
    if (!backendUrl || backendUrl.includes("your-dj-api")) throw new Error("Backend not configured");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    let authToken = "";
    try { authToken = localStorage.getItem("dj.auth.token") || ""; } catch { authToken = ""; }

    let response;
    try {
      response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          mode,
          session_id: getSessionId(),
          page: window.location.pathname,
          messages: [...messages, { role: "user", content: text }]
        }),
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json()).error || ""; } catch { detail = ""; }
      throw new Error(detail || "Backend request failed");
    }

    const data = await response.json();
    // The backend (/chat) returns the reply under `text`; keep `reply`/`message`
    // as fallbacks in case an older or alternate backend shape is deployed.
    const reply = data.text || data.reply || data.message || "";
    if (!reply) throw new Error("Backend returned an empty response");
    return reply;
  }

  function localReply(text) {
    const lower = text.toLowerCase();

    if (mode === "sql" || lower.includes("sql") || lower.includes("query")) {
      return `SQL assistant response:\n\n\`\`\`sql\nSELECT\n  region,\n  DATE_TRUNC('month', order_date) AS sales_month,\n  SUM(revenue) AS total_revenue,\n  COUNT(DISTINCT order_id) AS order_count,\n  SUM(profit) / NULLIF(SUM(revenue), 0) AS margin_rate\nFROM sales_orders\nWHERE order_date >= DATE '2025-01-01'\nGROUP BY region, DATE_TRUNC('month', order_date)\nORDER BY sales_month, total_revenue DESC;\n\`\`\`\n\nBusiness value: this turns raw orders into a monthly performance view for regional sales review.`;
    }

    if (mode === "python" || lower.includes("python") || lower.includes("pandas")) {
      return `Python assistant response:\n\n\`\`\`python\nimport pandas as pd\n\ndf = pd.read_excel('operations.xlsx')\ndf.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')\ndf['report_date'] = pd.to_datetime(df['report_date'], errors='coerce')\ndf = df.drop_duplicates()\nsummary = df.groupby('department', as_index=False)['cost'].sum()\nprint(summary.sort_values('cost', ascending=False))\n\`\`\`\n\nThis workflow supports repeatable cleaning, validation, and dashboard-ready outputs.`;
    }

    if (mode === "excel" || lower.includes("excel")) {
      return `Excel helper response:\n\n1. Import raw data with Power Query.\n2. Standardize column names, date formats, and numeric types.\n3. Load a clean table into the workbook data model.\n4. Build pivot summaries and KPI cells.\n5. Protect the reporting sheet and expose only refresh controls.\n\nThis is client-friendly because the report can be refreshed without breaking formulas.`;
    }

    if (mode === "dax" || lower.includes("dax") || lower.includes("power bi")) {
      return `Power BI DAX assistant response:\n\n\`\`\`dax\nTotal Revenue = SUM('Sales'[Revenue])\n\nRevenue LY =\nCALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[Date]))\n\nRevenue YoY % =\nDIVIDE([Total Revenue] - [Revenue LY], [Revenue LY])\n\`\`\`\n\nThese measures help hiring managers see that Deepanraj thinks in reusable semantic layers, not one-off visuals.`;
    }

    if (mode === "dashboard" || lower.includes("dashboard") || lower.includes("kpi")) {
      return `Dashboard recommendation engine:\n\n**Overview page**: revenue, margin, stock value, open orders, and exception count.\n\n**Trend page**: month-over-month movement, category mix, and regional contribution.\n\n**Operations page**: stock aging, reorder risk, pending actions, and supplier delay.\n\n**Decision page**: top issues, recommended next action, and owner fields.`;
    }

    if (mode === "cleaning" || lower.includes("clean")) {
      return `Data cleaning helper:\n\n1. Create a data profile for missing values, duplicates, data types, and outliers.\n2. Standardize IDs, dates, category labels, and currency fields.\n3. Validate totals against the source report.\n4. Document assumptions in a transformation log.\n5. Export a BI-ready table and a rejected-records table.`;
    }

    if (mode === "resume" || lower.includes("resume") || lower.includes("ats") || lower.includes("hire")) {
      return `Resume fit summary:\n\nDeepanraj should be positioned as a Data Analyst and AI Solutions Developer with Power BI, SQL, Python, Excel automation, Azure data concepts, and operations analytics experience.\n\nBest keywords: Power BI, DAX, SQL, Python, Pandas, Excel, Tableau, Azure Data Factory, Data Cleaning, KPI Reporting, Dashboard Design, Business Intelligence, Stakeholder Communication.`;
    }

    return `${systemKnowledge.profile}\n\n${systemKnowledge.projects}\n\n${systemKnowledge.services}\n\nBest recruiter signal: Deepanraj combines business context, BI delivery, and AI-assisted analytics workflows, which makes the portfolio feel like a professional analytics product rather than a static resume.`;
  }

  function thinkingNode() {
    const row = document.createElement("article");
    row.className = "message assistant";
    row.innerHTML = '<div class="avatar">DJ</div><div class="bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  async function streamAssistantReply(text) {
    const message = { role: "assistant", content: "" };
    const bubble = appendMessage("assistant", "", { raw: true });
    const chunks = text.split(/(\s+)/);

    for (let index = 0; index < chunks.length; index += 1) {
      message.content += chunks[index];
      bubble.textContent = message.content;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      await new Promise((resolve) => window.setTimeout(resolve, chunks[index].trim() ? 22 : 8));
    }

    bubble.innerHTML = formatMarkdown(message.content);
    messages.push(message);
    persistConversation();
  }

  async function sendMessage(text) {
    const rateOk = rateLimit();
    if (!rateOk) {
      appendMessage("assistant", "DJ is rate limited for a moment. Please wait a few seconds and try again.");
      return;
    }

    const sanitized = sanitize(text);
    if (!sanitized.value) return;

    const user = { role: "user", content: sanitized.value };
    messages.push(user);
    appendMessage("user", user.content);

    const thinking = thinkingNode();
    let reply = sanitized.value;

    if (!sanitized.blocked) {
      try {
        reply = await backendReply(sanitized.value);
      } catch {
        reply = localReply(sanitized.value);
      }
    }

    thinking.remove();
    await streamAssistantReply(reply);
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
    if (uploadZone) uploadZone.hidden = mode !== "upload";
    input.placeholder = `Ask DJ in ${mode.toUpperCase()} mode`;
  }

  function renderSuggestions() {
    if (!suggestionsEl) return;
    suggestionsEl.innerHTML = "";
    (config.SUGGESTIONS || []).forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion;
      button.addEventListener("click", () => sendMessage(suggestion));
      suggestionsEl.appendChild(button);
    });
  }

  function init() {
    if (greetingEl) greetingEl.textContent = config.GREETING || "Hi, I am DJ AI.";
    renderSuggestions();
    renderHistory();

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value;
      input.value = "";
      input.style.height = "auto";
      sendMessage(value);
    });

    input?.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 170)}px`;
    });

    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode || "chat"));
    });

    $("[data-new-chat]")?.addEventListener("click", () => {
      persistConversation();
      activeId = createId();
      messages = [];
      renderConversation();
      if (greetingEl) greetingEl.textContent = config.GREETING || "Hi, I am DJ AI.";
      input.focus();
    });

    $("[data-file-button]")?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      sendMessage(`Dataset selected: ${file.name}. Explain how you would inspect and clean this file.`);
      if (uploadZone) uploadZone.hidden = true;
      setMode("cleaning");
    });

    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    if (prompt) window.setTimeout(() => sendMessage(prompt), 350);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
