# DJ AI Architecture

## Goal
Build a model-agnostic AI engineering platform first, then develop a proprietary DJ foundation model when data, evaluation quality and compute justify it.

## Layers
1. Agent Runtime — plans tasks, selects tools, maintains state and enforces policies.
2. Repository Intelligence — indexes repositories, commits, issues, PRs, workflows and dependency/security signals.
3. Model Gateway — routes tasks to the best available model and later to DJ models.
4. Code Engine — context selection, patch generation, validation, test feedback and PR creation.
5. Memory — stores durable project facts, decisions, successful fixes and evaluation outcomes.
6. Evaluation — regression tests, coding tasks, security tests and agent success metrics.
7. DJ Model Program — dataset pipeline, tokenizer, pretraining, post-training and inference.

## Operating principle
Existing models are the short-term engine. DJ's proprietary data, orchestration, evaluations and developer workflow are the product moat. A proprietary LLM becomes a later capability, not a prerequisite.

## Safety
Consequential repository writes require approval. No automatic merge, repository deletion, force push, permission changes or secret-file access.
