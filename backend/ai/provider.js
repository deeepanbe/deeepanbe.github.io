const { OpenAI } = require('openai');

class OpenAIProvider {
  constructor({ apiKey, model }) {
    this.name = 'openai';
    this.model = model;
    this.client = new OpenAI({ apiKey });
  }

  async generate({ system, user, maxOutputTokens = 800 }) {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: system,
      input: user,
      max_output_tokens: maxOutputTokens
    });

    if (typeof response.output_text === 'string' && response.output_text.trim()) {
      return response.output_text.trim();
    }

    const parts = [];
    for (const item of response.output || []) {
      for (const content of item.content || []) {
        if (typeof content.text === 'string') parts.push(content.text);
      }
    }
    return parts.join('\n').trim();
  }
}

function createAIProvider(config = process.env) {
  const provider = (config.AI_PROVIDER || 'openai').toLowerCase();
  if (provider !== 'openai') {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
  if (!config.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAIProvider({
    apiKey: config.OPENAI_API_KEY,
    model: config.MODEL || 'gpt-5.6-luna'
  });
}

module.exports = { OpenAIProvider, createAIProvider };
