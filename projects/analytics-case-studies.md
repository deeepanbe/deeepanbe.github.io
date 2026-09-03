# Analytics Case Studies

This folder documents the portfolio case-study system used on the live site. Each case study is framed for a professional analytics review: **business problem → data → method → quality → insight → decision → limitations**.

## 1. Power BI Universal Analytics Dashboard

**Business problem:** Scattered sales, inventory and operating KPIs can slow leadership review and make drill-down analysis inconsistent.

**Stack:** Power BI, DAX, Power Query, Oracle SQL, data modeling.

**Analytical approach:** Build a reusable KPI layer, prepare source data, define semantic measures and provide drill-through paths for operational investigation.

**Demonstrates:** BI development, stakeholder storytelling, semantic measures, dashboard architecture and KPI design.

**Senior-level review points:** KPI definitions, model grain, relationship quality, refresh considerations, exception handling and reconciliation against source totals.

---

## 2. Enterprise Analytics Project

**Business problem:** Raw operational files need a structured path from ingestion and validation to analytics-ready reporting.

**Stack:** Azure Data Factory concepts, Azure SQL, Blob Storage, Python, Power BI.

**Analytical approach:** Design a source-to-dashboard workflow with ingestion, transformation, validation and reporting layers.

**Demonstrates:** Analytics engineering thinking, data pipeline awareness, validation and cloud analytics readiness.

**Senior-level review points:** Data lineage, incremental-load strategy, schema changes, data-quality controls, orchestration failures and operational monitoring.

---

## 3. Customer Segmentation — Power BI RFM Analysis

**Business problem:** Customer-level transaction history can be difficult to translate into actionable purchasing-behaviour groups.

**Verified data:** Approximately 235K transaction records in the supplied sales dataset.

**Stack:** Power BI, Power Query, DAX.

**Analytical approach:** Calculate Recency, Frequency and Monetary measures at customer level and use the resulting RFM profile for segmentation and behavioural exploration.

**Demonstrates:** Business segmentation, metric design, data preparation, DAX and dashboard storytelling.

**Senior-level review points:** Customer grain, treatment of returns/cancellations where applicable, reference date for recency, scoring methodology and validation of aggregate totals.

**Factuality note:** This project should be described as **RFM customer segmentation**. Do not describe it as K-Means ML unless separately verified.

---

## 4. Customer Segmentation ML

**Business problem:** Customer behaviour can be explored using multiple variables to identify groups with similar characteristics.

**Stack:** Python, pandas, scikit-learn, clustering, EDA.

**Analytical approach:** Prepare customer-level analytical features, explore distributions and apply clustering where appropriate, followed by business interpretation of resulting groups.

**Demonstrates:** Applied machine learning, feature preparation, analytical reasoning and interpretation.

**Senior-level review points:** Feature scaling, outliers, cluster selection, stability, interpretability and whether clusters produce useful business actions.

**Factuality note:** Keep this project distinct from the verified Power BI RFM project unless the source repository confirms the two workflows are combined.

---

## 5. BigQuery E-Commerce Analysis

**Business problem:** Order, customer, product and payment data need structured revenue and sales analysis.

**Stack:** BigQuery, SQL, GCP, exploratory analysis.

**Analytical approach:** Use warehouse SQL to join business entities, aggregate revenue/order metrics and investigate sales trends and category contribution.

**Demonstrates:** SQL depth, cloud warehouse familiarity and business framing.

**Senior-level review points:** Join cardinality, duplicate risk, date grain, NULL handling, query cost awareness and metric reconciliation.

---

## 6. Olist E-Commerce BI Dashboard

**Business problem:** Marketplace data needs a coherent BI story across sellers, categories, geolocation, reviews and logistics.

**Verified data:** 99,441 orders analysed in the documented project.

**Stack:** Power BI, DAX, Python, Power Query.

**Analytical approach:** Prepare marketplace data, establish an analytics-ready model and build measures and dashboard views around order lifecycle and marketplace performance.

**Demonstrates:** End-to-end BI modeling, order lifecycle thinking and enterprise-style dashboard storytelling.

**Senior-level review points:** Multi-table relationship design, order-level versus item-level grain, delivery-date logic, review metrics and reconciliation.

---

## 7. Sales Forecasting Dashboard

**Business problem:** Sales teams need clearer planning and demand visibility from historical sales patterns.

**Stack:** Power BI, Python.

**Analytical approach:** Prepare historical data, explore time patterns and present forecast-oriented views for planning and decision support.

**Demonstrates:** Forecasting concepts, scenario thinking and decision support.

**Senior-level review points:** Forecast horizon, seasonality, train/test separation where applicable, error metrics, baseline comparison and uncertainty communication.

**Factuality note:** Do not claim forecast accuracy or business impact unless supported by the project evidence.

---

## 8. IBM HR Attrition Analysis

**Business problem:** HR teams need to understand employee attrition patterns and potential areas for further investigation.

**Verified data:** 1,470 employee records; 237 attrition records; overall attrition rate 16.1%.

**Stack:** Python, Pandas, EDA and visualization.

**Analytical approach:** Explore attrition across available employee characteristics and identify descriptive patterns for business discussion.

**Demonstrates:** Data cleaning, exploratory analysis, visualization and business interpretation.

**Senior-level review points:** Class imbalance, missing values, subgroup sample sizes, association versus causation and fairness considerations.

**Factuality note:** Do not claim prediction accuracy, ROI, salary impact or production ML performance without verified evidence.

---

## 9. Digital Marketing Leads Performance

**Business problem:** Lead-generation data needs clearer visibility into acquisition source, course interest and time-based patterns.

**Verified data:** 2,399 marketing leads. Current documented dashboard figures include 995 WhatsApp leads and 446 Instagram leads.

**Stack:** Tableau, Excel.

**Analytical approach:** Prepare source data and build Tableau views for lead volume by acquisition source, course interest and time patterns.

**Demonstrates:** Dashboard design, exploratory business analysis and data storytelling.

**Senior-level review points:** Source-data consistency, date hierarchy, channel taxonomy, KPI definitions and avoiding unsupported conversion/ROI conclusions.

---

## 10. Hotel Booking Analysis

**Business problem:** Booking data can reveal patterns in cancellations, ADR, hotel type, market/channel and time periods.

**Verified data:** 119,390 hotel-booking records; 44,224 cancelled bookings; approximately 37.0% cancellation rate.

**Stack:** Python, Pandas, EDA and visualization.

**Analytical approach:** Clean and explore booking attributes, compare cancellation patterns and investigate ADR and time-related behaviour.

**Demonstrates:** Data cleaning, exploratory analysis, descriptive statistics and business interpretation.

**Senior-level review points:** Cancellation definition, missing values, outlier treatment, segment sample sizes and correlation versus causation.

**Factuality note:** Do not claim forecasting, causal pricing impact or a production cancellation model.

---

## Portfolio Definition of Done

A project is ready for recruiter/interviewer review when it contains, where relevant:

- Clear business problem and analytical questions
- Dataset/source and grain description
- Data-quality checks
- Reproducible transformation or analysis steps
- Explicit KPI definitions
- Appropriate SQL/Python/BI methodology
- Decision-oriented visualizations
- Key insights and recommended actions
- Limitations and assumptions
- Evidence that supports important numerical claims

The portfolio intentionally prioritizes **credible, reproducible analytics over inflated business-impact claims**.
