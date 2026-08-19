# DJ AI Reliability

The assistant should degrade gracefully when providers, tools, databases, or external services fail. Use provider fallback where configured, bounded retries, timeouts, clear errors, and safe partial results. Never hide a failed tool call by inventing a result.
