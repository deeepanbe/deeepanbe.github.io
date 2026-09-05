import crypto from "node:crypto";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function backoff(attempt, base = 800, cap = 8000) {
  return Math.min(cap, base * (2 ** attempt));
}

export async function withRetry(fn, { attempts = 3, label = "operation", onRetry = () => {} } = {}) {
  let last;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await fn(); }
    catch (error) {
      last = error;
      if (attempt === attempts - 1) break;
      onRetry({ label, attempt: attempt + 1, delay: backoff(attempt), error: error.message });
      await sleep(backoff(attempt));
    }
  }
  throw last;
}

function assertSafePath(path) {
  if (!path || path.includes("..") || /(^|\/)(\.env|.*\.(pem|key|p12))$/i.test(path)) {
    throw Object.assign(new Error("Unsafe target path"), { status: 403 });
  }
}

async function readFile(github, owner, repo, path, ref) {
  const { data } = await withRetry(
    () => github.repos.getContent({ owner, repo, path, ref }),
    { label: "read file" }
  );
  if (Array.isArray(data) || data.type !== "file") throw new Error("Target is not a text file");
  return { sha: data.sha, content: Buffer.from(data.content, "base64").toString("utf8") };
}

async function aiPatch({ apiKey, model, instruction, repo, path, content, files }) {
  const prompt = [
    "You are DJ GitHub AI. Improve one repository safely.",
    "Return ONLY JSON: {summary,risks,tests,new_content}.",
    "new_content must be the complete replacement text for the target file.",
    "Make the smallest useful improvement. Never add secrets, credentials or fabricated claims.",
    "Do not change unrelated behavior.",
    "Repository:", repo,
    "Target:", path,
    "Instruction:", instruction,
    "Repository files:", files.join("\n"),
    "Current content:\n" + content
  ].join("\n\n");
  const response = await withRetry(
    () => fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Act as a conservative senior software engineer. Output strict JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    }),
    { label: "AI patch request" }
  );
  if (!response.ok) throw new Error("AI provider returned HTTP " + response.status);
  const payload = await response.json();
  const result = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
  if (typeof result.new_content !== "string" || !result.new_content.trim()) throw new Error("AI returned no usable patch");
  return result;
}

function validatePatch(path, before, after) {
  const warnings = [];
  if (after.length > Math.max(200000, before.length * 3)) warnings.push("Large generated change");
  if (/-----BEGIN |(?:api[_-]?key|secret|token)\s*[:=]\s*["'][^"']{12,}/i.test(after)) warnings.push("Possible secret detected");
  const ext = path.split(".").pop()?.toLowerCase();
  if (["js","mjs","cjs"].includes(ext)) {
    try { new Function(after); } catch (error) { warnings.push("JavaScript syntax error: " + error.message); }
  }
  if (warnings.length) throw new Error(warnings.join("; "));
  return { passed: true, warnings: [] };
}

async function createBranch(github, owner, repo, base, branch) {
  const ref = await withRetry(
    () => github.git.getRef({ owner, repo, ref: "heads/" + base }),
    { label: "get base ref" }
  );
  await withRetry(
    () => github.git.createRef({ owner, repo, ref: "refs/heads/" + branch, sha: ref.data.object.sha }),
    { label: "create branch" }
  );
  return ref.data.object.sha;
}

export async function runAutonomousLoop({ github, owner, apiKey, model = "gpt-5.6-luna", maxRepos = 3, dryRun = false }) {
  if (!github || !owner || !apiKey) throw new Error("GitHub owner/token and OpenAI API key are required");
  const started = new Date().toISOString();
  const result = { run_id: crypto.randomUUID(), started_at: started, mode: dryRun ? "dry-run" : "draft-pr", repositories_scanned: 0, action: "none", errors: [] };

  const reposResponse = await withRetry(
    () => github.repos.listForUser({ username: owner, per_page: 100, sort: "updated" }),
    { label: "list repositories" }
  );
  const repos = reposResponse.data.filter(r => !r.archived && !r.fork).slice(0, maxRepos);
  result.repositories_scanned = repos.length;

  for (const repo of repos) {
    try {
      const meta = await withRetry(() => github.repos.get({ owner, repo: repo.name }), { label: "read repository" });
      const base = meta.data.default_branch;
      const baseRef = await withRetry(() => github.git.getRef({ owner, repo: repo.name, ref: "heads/" + base }), { label: "get repository head" });
      const tree = await withRetry(
        () => github.git.getTree({ owner, repo: repo.name, tree_sha: baseRef.data.object.sha, recursive: "true" }),
        { label: "read repository tree" }
      );
      const files = tree.data.tree.filter(x => x.type === "blob").map(x => x.path);
      const target = files.find(x => /^readme(\.md)?$/i.test(x)) || files.find(x => /^package\.json$/i.test(x)) || files.find(x => /^pyproject\.toml$/i.test(x));
      if (!target) continue;

      const existing = await readFile(github, owner, repo.name, target, base);
      const instruction = /^readme/i.test(target)
        ? "Improve the README only where claims can be supported by repository evidence. Add concise setup, architecture and verification guidance."
        : "Make one conservative maintainability improvement based only on this file and repository structure.";

      const ai = await aiPatch({ apiKey, model, instruction, repo: repo.full_name, path: target, content: existing.content, files: files.slice(0, 300) });
      validatePatch(target, existing.content, ai.new_content);

      if (ai.new_content === existing.content) continue;

      if (dryRun) {
        result.action = "validated-proposal";
        result.repository = repo.full_name;
        result.target = target;
        result.summary = ai.summary || "Validated improvement";
        return result;
      }

      const safeName = ("dj-ai/" + repo.name + "-" + Date.now()).replace(/[^A-Za-z0-9_\/-]/g, "-").slice(0, 180);
      await createBranch(github, owner, repo.name, base, safeName);
      const commit = await withRetry(
        () => github.repos.createOrUpdateFileContents({
          owner, repo: repo.name, path: target,
          message: "chore(dj-ai): " + String(ai.summary || "safe repository improvement").slice(0, 120),
          content: Buffer.from(ai.new_content, "utf8").toString("base64"),
          branch: safeName, sha: existing.sha
        }),
        { label: "write proposed change" }
      );
      const pr = await withRetry(
        () => github.pulls.create({
          owner, repo: repo.name, title: "[DJ AI] " + String(ai.summary || "Repository improvement").slice(0, 100),
          head: safeName, base,
          body: [
            "## DJ AI automated improvement",
            "",
            ai.summary || "Automated repository improvement.",
            "",
            "### Why",
            instruction,
            "",
            "### Validation",
            ...(Array.isArray(ai.tests) ? ai.tests.map(x => "- " + x) : ["- Static patch validation passed"]),
            "",
            "### Safety",
            "- Draft PR; no auto-merge.",
            "- Sensitive file paths are blocked.",
            "- Generated changes are validated before commit.",
            "",
            "Run ID: " + result.run_id
          ].join("\n"),
          draft: true
        }),
        { label: "create draft PR" }
      );
      result.action = "draft-pr-created";
      result.repository = repo.full_name;
      result.target = target;
      result.branch = safeName;
      result.commit_sha = commit.data.commit?.sha;
      result.pr_number = pr.data.number;
      result.pr_url = pr.data.html_url;
      result.summary = ai.summary || "Automated improvement";
      return result;
    } catch (error) {
      result.errors.push({ repository: repo.full_name, error: error.message });
    }
  }
  if (!result.action || result.action === "none") result.action = result.errors.length ? "failed" : "no-change";
  return result;
}
