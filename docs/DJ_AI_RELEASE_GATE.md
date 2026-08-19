# DJ AI Release Gate

A new model, prompt, tool, retrieval policy, or routing change should pass:

1. Regression suite
2. Security checks
3. Provider fallback checks
4. Grounding checks
5. Cost and latency checks
6. Multimodal checks when relevant
7. Rollback readiness

Only then should it be promoted to production.
