# DJ AI Evaluation Harness

The regression cases in `dj-ai-regression.json` are the starting point for continuous quality checks.

A production evaluator should run these cases against every enabled provider and orchestration mode, score groundedness/safety/usefulness, and block promotion when regression thresholds fail.

Future evaluator outputs should be versioned as artifacts rather than stored as user secrets or raw private conversations.
