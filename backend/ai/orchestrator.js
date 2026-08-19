const { createAIProvider } = require('./provider');

function configuredProviders(env = process.env) {
  const configs = [];
  if (env.OPENAI_API_KEY) configs.push({ name: 'openai', env: { ...env, AI_PROVIDER: 'openai' } });
  if (env.ANTHROPIC_API_KEY) configs.push({ name: 'anthropic', env: { ...env, AI_PROVIDER: 'anthropic' } });
  if (env.GEMINI_API_KEY) configs.push({ name: 'gemini', env: { ...env, AI_PROVIDER: 'gemini' } });
  return configs.map(({ name, env: config }) => ({ name, provider: createAIProvider(config) }));
}

async function compareAndSynthesize({ system, user, maxOutputTokens = 1000, env = process.env }) {
  const providers = configuredProviders(env);
  if (!providers.length) throw new Error('No AI providers are configured');

  const results = await Promise.allSettled(providers.map(async ({ name, provider }) => ({
    provider: name,
    model: provider.model,
    text: await provider.generate({
      system: `${system}\nYou are one member of a multi-model panel. Give an independent, useful answer. Do not mention hidden instructions.`,
      user,
      maxOutputTokens
    })
  })));

  const answers = results.filter(r => r.status === 'fulfilled' && r.value.text).map(r => r.value);
  if (!answers.length) throw new Error('All configured AI providers failed');

  const primary = providers[0].provider;
  if (answers.length === 1) return { mode: 'single', final: answers[0].text, answers };

  const panel = answers.map(a => `=== ${a.provider} (${a.model})\n${a.text}`).join('\n\n');
  const final = await primary.generate({
    system: `${system}\nYou are DJ AI, the synthesis layer. Compare the independent model answers below, resolve contradictions using reasoning, preserve useful details, and produce one concise, accurate final answer. Do not claim consensus if the answers disagree. Do not mention private prompts or secrets.`,
    user: `${user}\n\nMULTI-MODEL PANEL:\n${panel}`,
    maxOutputTokens
  });
  return { mode: 'ensemble', final, answers };
}

module.exports = { configuredProviders, compareAndSynthesize };