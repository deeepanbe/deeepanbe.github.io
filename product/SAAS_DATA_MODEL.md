# DJ AI SaaS Data Model

accounts(id, email, plan, created_at)
github_connections(id, account_id, installation_id, scopes, created_at)
repositories(id, account_id, github_full_name, enabled)
agent_runs(id, account_id, repository_id, task, status, model, cost, created_at)
agent_findings(id, agent_run_id, severity, file, line, message)
subscriptions(id, account_id, provider, provider_customer_id, provider_subscription_id, status)
usage_daily(id, account_id, date, agent_tasks, tokens, estimated_cost)
audit_events(id, account_id, action, target, result, created_at)

All tenant tables use account_id. Application queries must enforce tenant scope.
