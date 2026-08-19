const test = require('node:test');
const assert = require('node:assert/strict');
const { configuredProviders } = require('./orchestrator');

test('configuredProviders returns only providers with credentials', () => {
  const providers = configuredProviders({
    OPENAI_API_KEY: 'test-openai-key',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    GEMINI_API_KEY: 'test-gemini-key',
    MODEL: 'test-model',
    ANTHROPIC_MODEL: 'test-claude',
    GEMINI_MODEL: 'test-gemini'
  });
  assert.deepEqual(providers.map(p => p.name), ['openai', 'anthropic', 'gemini']);
});

test('configuredProviders returns empty when no credentials exist', () => {
  assert.deepEqual(configuredProviders({}).map(p => p.name), []);
});
