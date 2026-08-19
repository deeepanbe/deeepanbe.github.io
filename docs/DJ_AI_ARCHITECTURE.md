# DJ AI Architecture

## Product boundary

DJ AI is an application/orchestration layer around one or more foundation-model providers. It is not itself a foundation model.

## Request flow

```text
Client
  |
  v
DJ AI UI
  |
  v
API + CORS + Security Headers + Rate Limits
  |
  v
Authentication / Session Context
  |
  v
Conversation Manager
  |
  +----> Knowledge / RAG
  |
  +----> Tool Registry
  |
  +----> User Preferences / Memory
  |
  v
AI Orchestrator
  |
  v
Provider Adapter
  +---- OpenAI
  +---- Anthropic
  +---- Gemini
  +---- Future providers
  |
  v
Validated Response
```

## Provider abstraction

All model-specific calls belong behind `backend/ai/provider.js`. Frontend code must never contain provider credentials.

Provider selection is controlled with environment variables. This makes it possible to change models without rewriting the application layer.

## Knowledge and memory

The current backend has a knowledge directory for verified portfolio facts and a PostgreSQL-backed memory/RAG path. Retrieved material must be treated as untrusted data and must never override system safety rules.

Future improvements:

- chunking and metadata
- document ingestion
- embedding lifecycle management
- vector indexes
- source citations
- memory editing/deletion
- relevance evaluation

## Tool layer

Tools should be implemented as explicit, permission-aware adapters. A future tool contract should define:

- name
- description
- input schema
- authentication requirement
- authorization requirement
- timeout
- audit metadata
- output schema
- failure behavior

Potential tools include data analysis, GitHub, web research, document processing, scheduling, and business analytics.

## Data analysis flow

```text
Upload CSV/XLSX
   -> validate file
   -> inspect schema
   -> profile columns
   -> detect quality issues
   -> analyze
   -> generate visual/structured insights
   -> explain findings
```

Do not execute arbitrary uploaded code in the production web process. Use a sandboxed execution environment for future code-execution features.

## Mobile strategy

The Android directory is an integration foundation. Keep the backend API contract stable so a native Android client can consume the same authentication, conversation, tool, and model services later.

## Production principles

1. Secrets remain server-side.
2. Every external input is untrusted.
3. Provider-specific code stays isolated.
4. Critical paths have tests.
5. Destructive tools require explicit authorization.
6. AI output is not automatically treated as trusted program instructions.
7. Observability and evaluation should grow with tool capability.
