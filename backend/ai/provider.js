const { OpenAI } = require('openai');

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!response.ok) throw new Error(`AI provider HTTP ${response.status}`);
  return body;
}

class OpenAIProvider {
  constructor({ apiKey, model }) { this.name = 'openai'; this.model = model; this.client = new OpenAI({ apiKey }); }
  async generate({ system, user, maxOutputTokens = 800 }) {
    const response = await this.client.responses.create({ model: this.model, instructions: system, input: user, max_output_tokens: maxOutputTokens });
    return (response.output_text || '').trim();
  }
  async embed(text) {
    const response = await this.client.embeddings.create({ model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small', input: text });
    return response.data[0].embedding;
  }
}

class AnthropicProvider {
  constructor({ apiKey, model }) { this.name = 'anthropic'; this.model = model; this.apiKey = apiKey; }
  async generate({ system, user, maxOutputTokens = 800 }) {
    const body = await fetchJson('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: this.model, max_tokens: maxOutputTokens, system, messages: [{ role: 'user', content: user }] }) });
    return (body.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n').trim();
  }
}

class GeminiProvider {
  constructor({ apiKey, model }) { this.name = 'gemini'; this.model = model; this.apiKey = apiKey; }
  async generate({ system, user, maxOutputTokens = 800 }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    const body = await fetchJson(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens } }) });
    return (body.candidates?.[0]?.content?.parts || []).map(x => x.text || '').join('').trim();
  }
}

function createAIProvider(config = process.env) {
  const provider = String(config.AI_PROVIDER || 'openai').toLowerCase();
  if (provider === 'openai') {
    if (!config.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
    return new OpenAIProvider({ apiKey: config.OPENAI_API_KEY, model: config.MODEL || 'gpt-5.6-luna' });
  }
  if (provider === 'anthropic') {
    if (!config.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured');
    return new AnthropicProvider({ apiKey: config.ANTHROPIC_API_KEY, model: config.ANTHROPIC_MODEL || 'claude-sonnet-4-5' });
  }
  if (provider === 'gemini') {
    if (!config.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    return new GeminiProvider({ apiKey: config.GEMINI_API_KEY, model: config.GEMINI_MODEL || 'gemini-2.5-flash' });
  }
  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

module.exports = { OpenAIProvider, AnthropicProvider, GeminiProvider, createAIProvider };