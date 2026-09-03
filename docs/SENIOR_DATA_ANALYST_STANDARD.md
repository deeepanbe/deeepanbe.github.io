# Senior Data Analyst Portfolio Standard

This document defines the quality bar used for analytics projects in this repository.

## 1. Business framing

Every project should state:

- Business problem
- Stakeholder / decision maker
- Key questions
- Scope and exclusions
- Expected analytical output

A technically impressive notebook is not enough; the analysis must support a decision.

## 2. Data understanding

Document:

- Source and dataset grain
- Important entities and keys
- Time period
- Row counts where verified
- Missing and duplicate patterns
- Known limitations and assumptions

## 3. Data quality

Use explicit checks where applicable:

- Null and duplicate checks
- Referential/key integrity
- Range and outlier checks
- Category/value validation
- Reconciliation against source totals
- Date and currency consistency

Record important findings instead of silently cleaning them away.

## 4. Analytical design

Choose the right tool for the question:

- **SQL:** filtering, joins, aggregation, CTEs, windows and repeatable data preparation
- **Python/Pandas:** cleaning, EDA, statistical exploration and practical ML
- **Power BI:** semantic modeling, DAX, KPI definitions and interactive decision support
- **Excel:** operational reporting, reconciliation and lightweight analysis
- **Tableau:** visual exploration and stakeholder storytelling

Avoid unnecessary tool complexity.

## 5. KPI governance

For each important KPI, document:

- Business definition
- Calculation logic
- Numerator / denominator where relevant
- Grain
- Filters
- Time logic
- Known caveats

Two dashboards should not report different answers because a KPI was defined differently.

## 6. BI modeling

For Power BI projects, prefer a clean analytical model with clear fact/dimension responsibilities, reusable measures, sensible relationships and documented business logic. Separate transformation logic from presentation wherever practical.

## 7. Insight quality

Move beyond observations such as “sales increased.” Explain:

- What changed?
- Where did it change?
- What appears to drive the change?
- How confident are we?
- What should the stakeholder do next?

Do not imply causation when the analysis only establishes correlation or association.

## 8. Dashboard design

A professional dashboard should make the following easy to find:

1. Executive KPI summary
2. Trend / time context
3. Key drivers and breakdowns
4. Exceptions or risks
5. Drill-down path
6. Recommended action

Visual complexity should serve the decision rather than distract from it.

## 9. Reproducibility

A reviewer should be able to understand how the result was produced from the repository. Include appropriate datasets or references, notebooks/scripts, transformation logic, metric definitions and README instructions.

## 10. Engineering discipline

Analytics work should demonstrate professional software habits where appropriate:

- Git-based change history
- Clear project structure
- Small reusable functions
- Environment/secrets separation
- Tests for critical logic
- CI checks where practical
- Defensive handling of bad input
- Documentation of assumptions

## 11. AI-assisted analytics

AI may accelerate SQL, Python, documentation and exploration, but analyst ownership remains essential. Validate generated queries, calculations, assumptions and claims before publishing results.

For DJ AI specifically, provider credentials remain server-side and unsupported capabilities must not be claimed.

## 12. Interview readiness

Every featured project should be explainable in five layers:

**Problem → Data → Method → Insight → Decision**

A strong interview explanation should also cover data-quality issues, trade-offs, limitations, alternative approaches and what would be improved with production access.

## Definition of Done

An analytics project is portfolio-ready when a reviewer can answer:

- What business problem was solved?
- Where did the data come from?
- Can the important numbers be verified?
- Is the data quality understood?
- Are KPIs clearly defined?
- Is the analytical method appropriate?
- Are insights actionable?
- Can another analyst reproduce the workflow?
- Are limitations honestly stated?
- Does the project demonstrate business judgment as well as technical skill?
