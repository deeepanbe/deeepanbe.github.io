const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const { OpenAI } = require('openai');

const app = express();
app.use(express.json({ limit: '32kb' }));

const PORT = process.env.PORT || 8787;
const BACKEND_SECRET = process.env.BACKEND_SECRET;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const MODEL = process.env.MODEL || 'gpt-5.6-luna';

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Requests to OpenAI will fail until it is provided.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Basic CORS allowlist
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server or curl
    if (CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
};
app.use(cors(corsOptions));

// Simple rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, branch: process.env.BRANCH || null });
});

// Helper: load knowledge files from backend/knowledge
async function loadKnowledge() {
  const dir = path.join(__dirname, 'knowledge');
  try {
    const files = await fs.readdir(dir);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    const results = [];
    for (const file of markdownFiles) {
      const full = path.join(dir, file);
      const content = await fs.readFile(full, 'utf8');
      results.push({ name: file, content: content.slice(0, 60_000) });
    }
    return results;
  } catch (err) {
    console.warn('Could not load knowledge:', err.message);
    return [];
  }
}

// Build a compact context from knowledge files (simple concatenation for Phase 1)
function buildKnowledgeContext(knowledge) {
  if (!knowledge || knowledge.length === 0) return '';
  return knowledge.map(k => `=== ${k.name}\n${k.content}`).join('\n\n');
}

// DJ AI system persona
function systemPersona() {
  return `You are DJ AI, the official AI assistant for Deepanraj Arumugam ("Deepanraj").\n\nYour job is to answer visitor questions about Deepanraj's portfolio, projects, skills, resume, Power BI and SQL/DAX work, and GitHub projects.\n\nRules:\n- Use only information present in the provided knowledge context or explicitly available public GitHub repositories; if you don't know something, say you don't know.\n- Distinguish between verified portfolio information and reasonable suggestions.\n- For recruiter questions: be concise and professional.\n- For technical questions: provide practical examples and code where helpful.\n- For project questions: explain problem → data → approach → technology → result.\n- Do not invent clients, employers, or certifications that are not present in the knowledge content.\n`;
}

// /chat endpoint
app.post('/chat', async (req, res) => {
  try {
    // Simple secret header check
    const secret = req.headers['x-backend-secret'];
    if (BACKEND_SECRET && secret !== BACKEND_SECRET) {
      return res.status(401).json({ error: 'Unauthorized (invalid backend secret)' });
    }

    const { page, mode, message, session_id } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 8000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // Load knowledge (synchronous for now)
    const knowledge = await loadKnowledge();
    const knowledgeContext = buildKnowledgeContext(knowledge);

    // Build the prompt
    let preface = systemPersona();
    let pageInfo = page ? `Visitor is on page: ${page}\n` : '';
    let modeInfo = mode ? `Requested mode: ${mode}\n` : '';

    const userPrompt = `${pageInfo}${modeInfo}User message:\n${message}\n`;

    // Construct the Responses API input combining system + knowledge + user message
    const combinedInput = `${preface}\n---\nKnowledge:\n${knowledgeContext}\n---\n${userPrompt}`;

    // Call OpenAI Responses API via official openai package
    const response = await openai.responses.create({
      model: MODEL,
      input: combinedInput,
      max_output_tokens: 800,
    });

    // Response parsing (best-effort)
    let text = null;
    try {
      // new Responses API returns response.output array with content objects
      if (response && response.output && Array.isArray(response.output)) {
        // join all text parts
        text = response.output.map(item => {
          if (typeof item === 'string') return item;
          if (item.content) {
            if (Array.isArray(item.content)) {
              return item.content.map(c => (c.text || c)).join('');
            }
            return item.content.text || JSON.stringify(item.content);
          }
          return JSON.stringify(item);
        }).join('\n');
      }
    } catch (err) {
      console.warn('Error parsing response output', err.message);
    }

    if (!text) {
      // Fallback: stringify the whole response
      text = JSON.stringify(response, null, 2).slice(0, 64_000);
    }

    return res.json({ ok: true, model: MODEL, text });
  } catch (err) {
    console.error('Chat error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`DJ AI backend listening on port ${PORT} (model=${MODEL})`);
});
