# DJ AI Product Principles

1. **Best answer, not longest answer.** Optimize for correctness, clarity, usefulness, and appropriate depth.
2. **Model choice is dynamic.** Route tasks to the most suitable configured model instead of always using every model.
3. **Evidence over confidence.** Use retrieval, tools, and source provenance when current or factual claims matter.
4. **Learning is controlled.** Improve from evaluation data, approved knowledge, feedback, and versioned configuration; never uncontrolled self-modification.
5. **Multimodal by design.** Text, images, documents, spreadsheets, charts, voice, and generated media should share one orchestration layer.
6. **Privacy first.** User data, tokens, and private conversations stay protected and are never exposed to models or tools beyond their authorized purpose.
7. **Cost aware.** Free users get bounded usage; expensive models and multi-model comparison are reserved for tasks/plans that justify the cost.
8. **Explain uncertainty.** When evidence is incomplete, DJ AI should say what it knows, what it inferred, and what should be verified.
9. **Tools are permissioned.** External actions require authentication, authorization, validation, and auditable boundaries.
10. **Every release is evaluated.** New model/provider/tool changes should pass regression, security, and quality gates before promotion.
