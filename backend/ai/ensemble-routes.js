const express = require('express');
const { compareAndSynthesize, configuredProviders } = require('./orchestrator');

function buildEnsembleRoutes({ systemPersona }) {
  const router = express.Router();

  router.get('/ai/providers', (req, res) => {
    const providers = configuredProviders().map(({ name, provider }) => ({ name, model: provider.model }));
    return res.json({ providers, modes: ['auto', 'single', 'compare', 'best'] });
  });

  router.post('/ai/compare', async (req, res) => {
    try {
      const user = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
      if (!user) return res.status(400).json({ error: 'Message is required' });
      if (user.length > 5000) return res.status(400).json({ error: 'Message too long' });
      const result = await compareAndSynthesize({ system: systemPersona(), user, maxOutputTokens: 1400 });
      return res.json({ ok: true, ...result });
    } catch (error) {
      console.error(`Multi-model request failed: ${error.message}`);
      return res.status(503).json({ error: 'Multi-model service is not available' });
    }
  });

  return router;
}

module.exports = { buildEnsembleRoutes };