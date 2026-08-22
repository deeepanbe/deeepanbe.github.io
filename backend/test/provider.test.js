const test = require('node:test');
const assert = require('node:assert/strict');
const { createAIProvider } = require('../ai/provider');

test('selects OpenAI provider from configuration', () => {
  const provider = createAIProvider({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key', MODEL: 'gpt-5.6-luna' });
  assert.equal(provider.name, 'openai');
  assert.equal(provider.model, 'gpt-5.6-luna');
});

test('selects Anthropic provider from configuration', () => {
  const provider = createAIProvider({ AI_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_MODEL: 'claude-sonnet-4-5' });
  assert.equal(provider.name, 'anthropic');
  assert.equal(provider.model, 'claude-sonnet-4-5');
});

test('selects Gemini provider from configuration', () => {
  const provider = createAIProvider({ AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-2.5-flash' });
  assert.equal(provider.name, 'gemini');
  assert.equal(provider.model, 'gemini-2.5-flash');
});

test('selects Ollama (self-hosted) provider from configuration', () => {
  const provider = createAIProvider({ AI_PROVIDER: 'ollama', OLLAMA_BASE_URL: 'http://localhost:11434', OLLAMA_MODEL: 'llama3.2' });
  assert.equal(provider.name, 'ollama');
  assert.equal(provider.model, 'llama3.2');
});

test('Ollama provider requires a base URL', () => {
  assert.throws(() => createAIProvider({ AI_PROVIDER: 'ollama' }), /OLLAMA_BASE_URL/);
});

test('rejects unsupported provider', () => {
  assert.throws(() => createAIProvider({ AI_PROVIDER: 'unknown' }), /Unsupported AI_PROVIDER/);
});
