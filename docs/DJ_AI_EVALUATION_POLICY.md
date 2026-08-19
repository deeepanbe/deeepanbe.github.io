# DJ AI Evaluation & Promotion Policy

Before a new model, prompt, retrieval policy, or tool is promoted:

- Run the regression suite.
- Verify security and secret handling.
- Test provider failures and fallback behavior.
- Check factual grounding for knowledge tasks.
- Check code/data outputs with deterministic validation where possible.
- Check multimodal outputs against supported capabilities.
- Measure latency and estimated cost.
- Keep a rollback path.

User feedback may inform future improvements, but private user content must not automatically become training data. Any learning dataset must use an explicit, privacy-preserving collection and review process.
