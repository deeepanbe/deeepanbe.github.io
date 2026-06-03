(function () {
  "use strict";

  const storageKey = "deepanraj.dj.ai.history.v2";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const drawer = $("[data-ai-drawer]");
  const messagesEl = $("[data-ai-messages]");
  const form = $("[data-ai-form]");
  const input = $("[data-ai-input]");
  const historyEl = $("[data-ai-history-list]");
  const modeButtons = $$("[data-ai-mode]");

  if (!drawer || !messagesEl || !form || !input) return;

  let mode = "chat";
  let activeId = createId();
  let messages = [];
  let history = loadHistory();

  const greeting = {
    role: "assistant",
    content: "Hi, I am DJ AI. Ask me about Deepanraj's Power BI dashboards, SQL work, Python automation, Excel reporting, DAX logic, or AI analytics fit."
  };

  function createId() {
    return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 8)));
  }

  function renderHistory() {
    if (!historyEl) return;
    historyEl.innerHTML = "";

    history.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.title || "Portfolio chat";
      button.addEventListener("click", () => {
        activeId = item.id;
        messages = item.messages || [];
        renderMessages();
        openDrawer();
      });
      historyEl.appendChild(button);
    });
  }

  function persistCurrentConversation() {
    const usefulMessages = messages.filter((msg) => msg.role !== "system");
    if (usefulMessages.length < 2) return;

    const firstUser = usefulMessages.find((msg) => msg.role === "user");
    const title = firstUser ? firstUser.content.slice(0, 54) : "Portfolio chat";
    const entry = { id: activeId, title, messages: usefulMessages.slice(-12) };
    history = [entry, ...history.filter((item) => item.id !== activeId)].slice(0, 8);
    saveHistory();
    renderHistory();
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
    const keywords = {
      sql: ["SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "SUM", "COUNT", "AVG", "CASE", "WHEN", "THEN", "END", "JOIN", "ON"],
      python: ["import", "from", "def", "return", "for", "in", "as", "print", "groupby", "read_csv"],
      dax: ["CALCULATE", "DIVIDE", "SUM", "AVERAGE", "FILTER", "ALL", "DATESYTD"]
    };

    const list = keywords[language] || [];
    let safe = escapeHtml(code);
    list.forEach((word) => {
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

  function renderMessage(message, options = {}) {
    const row = document.createElement("div");
    row.className = `ai-message ${message.role === "user" ? "user" : "assistant"}`;

    const avatar = document.createElement("div");
    avatar.className = "ai-mini-avatar";
    avatar.textContent = message.role === "user" ? "You" : "DJ";

    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    if (options.raw) bubble.textContent = message.content;
    else bubble.innerHTML = formatMarkdown(message.content);

    if (message.role === "user") {
      row.append(bubble, avatar);
    } else {
      row.append(avatar, bubble);
    }

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function renderMessages() {
    messagesEl.innerHTML = "";
    if (!messages.length) renderMessage(greeting);
    messages.forEach((message) => renderMessage(message));
  }

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    if (!messages.length) renderMessages();
    window.setTimeout(() => input.focus(), 50);
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function startNewChat() {
    persistCurrentConversation();
    activeId = createId();
    messages = [];
    renderMessages();
    input.focus();
  }

  function sanitize(text) {
    const cleaned = String(text || "")
      .replace(/[\u0000-\u001f]/g, "")
      .trim()
      .slice(0, 4000);

    const blocked = [
      /ignore\s+(all\s+)?previous\s+instructions/i,
      /reveal\s+(system|developer|hidden)\s+prompt/i,
      /show\s+(api\s+key|secret|token)/i,
      /bypass\s+(security|auth|authentication)/i
    ].some((pattern) => pattern.test(cleaned));

    return {
      blocked,
      value: blocked ? "Please ask a normal analytics, portfolio, SQL, Python, Excel, DAX, or dashboard question." : cleaned
    };
  }

  function responseFor(prompt) {
    const lower = prompt.toLowerCase();

    if (mode === "sql" || lower.includes("sql") || lower.includes("query")) {
      return `Here is a clean SQL pattern Deepanraj would use for a recruiter-ready analysis:\n\n\`\`\`sql\nSELECT\n  region,\n  DATE_TRUNC('month', order_date) AS month,\n  SUM(revenue) AS revenue,\n  COUNT(DISTINCT order_id) AS orders,\n  SUM(profit) / NULLIF(SUM(revenue), 0) AS margin_rate\nFROM sales_orders\nWHERE order_date >= DATE '2025-01-01'\nGROUP BY region, DATE_TRUNC('month', order_date)\nORDER BY month, revenue DESC;\n\`\`\`\n\nThis shows business sense because it connects revenue, order volume, margin, and time trend in one executive-friendly view.`;
    }

    if (mode === "python" || lower.includes("python") || lower.includes("pandas")) {
      return `A strong Python analysis flow for messy business files:\n\n\`\`\`python\nimport pandas as pd\n\ndf = pd.read_excel('sales_report.xlsx')\ndf.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')\ndf['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')\ndf['revenue'] = pd.to_numeric(df['revenue'], errors='coerce').fillna(0)\nsummary = df.groupby(['region', 'category'], as_index=False)['revenue'].sum()\nsummary = summary.sort_values('revenue', ascending=False)\n\`\`\`\n\nThis is dashboard-ready because it standardizes fields, fixes data types, and produces a clean aggregate table for BI.`;
    }

    if (mode === "excel" || lower.includes("excel")) {
      return `For Excel automation, I would structure the workflow like this:\n\n1. Import raw data into a protected raw sheet.\n2. Use Power Query for cleaning and repeatable transformations.\n3. Create pivot-ready tables with clear date, product, region, and value fields.\n4. Build KPI tiles for revenue, variance, aging, and pending actions.\n5. Add refresh instructions so non-technical users can update the report without breaking formulas.`;
    }

    if (mode === "dax" || lower.includes("dax") || lower.includes("power bi")) {
      return `Power BI DAX measures that fit Deepanraj's analytics positioning:\n\n\`\`\`dax\nTotal Revenue = SUM('Sales'[Revenue])\n\nRevenue YoY % =\nDIVIDE([Total Revenue] - [Revenue LY], [Revenue LY])\n\nInventory Risk =\nCALCULATE(\n  [Stock Value],\n  FILTER('Inventory', 'Inventory'[Days In Stock] > 90)\n)\n\`\`\`\n\nThese measures work well because each one maps to an executive question: performance, growth, and operational risk.`;
    }

    if (mode === "dashboard" || lower.includes("dashboard") || lower.includes("kpi")) {
      return `Recommended dashboard architecture:\n\n**Executive Overview**: revenue, margin, inventory value, order count, and exceptions.\n\n**Operations Detail**: stock aging, reorder risk, movement trend, and supplier delay.\n\n**Customer or Region View**: segmentation, contribution, and growth opportunities.\n\n**Action Center**: filters, alerts, top issues, and next recommended decision.`;
    }

    if (mode === "cleaning" || lower.includes("clean")) {
      return `Data cleaning checklist:\n\n1. Profile nulls, duplicates, outliers, and invalid dates.\n2. Standardize column names and category labels.\n3. Convert numeric, date, and boolean fields safely.\n4. Reconcile totals against source reports.\n5. Export a model-ready table with documented assumptions.\n\nThis is the kind of disciplined workflow recruiters expect from a professional analyst.`;
    }

    if (lower.includes("resume") || lower.includes("recruiter") || lower.includes("hire")) {
      return `Recruiter summary:\n\nDeepanraj is positioned as a Data Analyst and AI Solutions Developer who combines Power BI, SQL, Python, Excel, Azure concepts, and practical operations experience. His strongest signal is not only tool usage, but the ability to turn business problems into dashboards, automation flows, and decision-ready narratives.`;
    }

    return `Deepanraj's portfolio shows a professional analyst profile with three strong signals:\n\n**Business impact**: KPI reporting, inventory visibility, sales analysis, and operations analytics.\n\n**Technical delivery**: Power BI, DAX, SQL, Python, Excel, Tableau, and Azure-style data workflows.\n\n**AI readiness**: DJ AI demonstrates how he thinks about analyst copilots, SQL helpers, Python assistants, data cleaning support, and dashboard recommendation engines.`;
  }

  function appendTypingIndicator() {
    const row = document.createElement("div");
    row.className = "ai-message assistant";
    row.innerHTML = `
      <div class="ai-mini-avatar">DJ</div>
      <div class="ai-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>
    `;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  async function streamReply(text) {
    const indicator = appendTypingIndicator();
    await new Promise((resolve) => window.setTimeout(resolve, 420));
    indicator.remove();

    const message = { role: "assistant", content: "" };
    const bubble = renderMessage(message, { raw: true });
    const words = text.split(/(\s+)/);

    for (let i = 0; i < words.length; i += 1) {
      message.content += words[i];
      bubble.textContent = message.content;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      await new Promise((resolve) => window.setTimeout(resolve, words[i].trim() ? 24 : 8));
    }

    bubble.innerHTML = formatMarkdown(message.content);
    messages.push(message);
    persistCurrentConversation();
  }

  async function ask(prompt) {
    const sanitized = sanitize(prompt);
    if (!sanitized.value) return;

    openDrawer();
    const userMessage = { role: "user", content: sanitized.value };
    messages.push(userMessage);
    renderMessage(userMessage);

    const reply = sanitized.blocked ? sanitized.value : responseFor(sanitized.value);
    await streamReply(reply);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    ask(value);
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  $$("[data-ai-open]").forEach((button) => button.addEventListener("click", openDrawer));
  $$("[data-ai-close]").forEach((button) => button.addEventListener("click", closeDrawer));
  $$("[data-ai-new]").forEach((button) => button.addEventListener("click", startNewChat));

  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.aiMode || "chat";
      modeButtons.forEach((item) => item.classList.toggle("active", item === button));
      input.placeholder = `Ask DJ in ${mode.toUpperCase()} mode`;
      input.focus();
    });
  });

  $$("[data-ai-prompt]").forEach((button) => {
    button.addEventListener("click", () => ask(button.dataset.aiPrompt || button.textContent || ""));
  });

  renderHistory();
  window.DJAssistant = { open: openDrawer, close: closeDrawer, ask };
})();
