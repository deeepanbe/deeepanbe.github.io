# DJ AI Cost-Aware Routing

DJ AI should optimize for quality per rupee, not maximum model usage.

- **Fast mode:** lowest-cost suitable configured model.
- **Balanced mode:** capable default model with fallback.
- **Deep mode:** strongest suitable model when complexity justifies cost.
- **Compare mode:** multiple providers followed by synthesis.
- **Free plan:** bounded usage and no unrestricted expensive ensemble calls.
- **Paid plans:** higher limits and optional advanced orchestration.

The router should record provider, model, estimated token usage, latency, and outcome so pricing and routing can be tuned from real usage data.
