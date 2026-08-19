# DJ AI Learning Loop

DJ AI will improve continuously through a controlled loop:

**Discover → Retrieve → Reason → Verify → Evaluate → Correct → Version → Promote → Monitor**

### Discover
Use approved web/search and user-provided sources to gather new information when the task requires current knowledge.

### Retrieve
Store only approved, provenance-aware knowledge in the RAG layer.

### Reason
Use the best configured model or a multi-model ensemble for complex tasks.

### Verify
Use deterministic checks, citations, cross-model comparison, tool validation, and uncertainty reporting.

### Evaluate
Run regression tests across doubt clarification, coding, SQL, data analysis, multimodal behavior, safety, and tool use.

### Correct
Adjust routing, prompts, retrieval, tools, or knowledge. Do not silently modify production source code.

### Version
Keep model/provider settings, prompts, and evaluation suites versioned.

### Promote
Only promote changes that pass quality, security, cost, and reliability gates.

### Monitor
Measure failures, latency, cost, user feedback, and regression rates, then feed approved findings into the next improvement cycle.
