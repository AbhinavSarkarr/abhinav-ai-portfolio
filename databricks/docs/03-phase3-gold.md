# Phase 3 — Gold (daily aggregates + rankings/insights)

Status: **shipped, running**
Branch: `databricks-migration`
Date opened: 2026-05-17

---

## Why this phase exists

Silver is a clean, typed event store but not query-shaped for a dashboard:
"how many sessions today?" requires `COUNT(DISTINCT ...) GROUP BY date` over
hundreds of rows. The dashboard's panels and the recommender's lookups need
**pre-aggregated** facts (Layer 2) and **rolling rankings/insights** (Layer 3)
that read in milliseconds.

Gold materializes both. The 11 Layer-2 tables answer *"what happened on day X
along dimension D"*; the 10 Layer-3 tables answer *"what's hot in the last 7
or 30 days"*.

---

## Data flow

```
silver.* (9 typed event tables)
   |
   |  Lakeflow Declarative Pipeline `gold_pipeline`
   |   ── Layer 2 fans out in PARALLEL from Silver (11 tables)
   |       daily_metrics, project_daily_stats, section_daily_stats,
   |       skill_daily_stats, traffic_daily_stats, conversion_funnel,
   |       client_daily_stats, domain_daily_stats, experience_daily_stats,
   |       recommendation_daily_stats, content_reading_stats
   |
   |   ── Layer 3 starts as Layer 2 deps complete (10 tables)
   |       6 simple rankings:   project_rankings, skill_rankings,
   |                            section_rankings, client_rankings,
   |                            domain_rankings, experience_rankings
   |       3 reach to Silver:   visitor_insights, tech_demand_insights,
   |                            recommendation_performance (Silver + L2)
   |       1 reaches to L3:     recommendations (visitor_insights + project_rankings)
   v
gold.* (21 materialized tables; full refresh per run)
```

Pipeline runtime: **~16 seconds** for all 21 tables on real data.

---

## Decisions

### 1. Separate `gold_pipeline`, not extending `silver_pipeline`
- Bounded blast radius (Gold failure doesn't fail Silver).
- Cleaner ops (each pipeline has its own DLT UI / lineage graph).
- Demonstrates pipeline-level orchestration.
- Cost: a second pipeline cold-start. Negligible on serverless.

### 2. Two notebook libraries on one pipeline (`layer2_aggregates.py` + `layer3_rankings.py`)
- Logical separation between aggregates (Layer 2) and rankings/insights (Layer 3).
- Still one DLT DAG (DLT discovers all `@dlt.table`s across both files).

### 3. Cross-pipeline reads via `spark.read.table`, same-pipeline via `dlt.read`
- Silver lives in its own pipeline → consumed as external Delta tables.
- Layer-3 tables read Layer 2 (same pipeline) via `dlt.read("name")` so
  DLT builds the dependency edge automatically.

### 4. Faithful 1:1 port from BigQuery SQL
Behavior matches original Layer-2/3 BigQuery views row-for-row, with the
documented BQ → Spark translations (see "Porting deltas" below). Cleanup of
known data-quality issues (session-row duplication, NULL `client_id` in
client_events) is **explicitly deferred**.

### 5. Expectations: warn-only ("expect"), not "expect_or_drop"
Aggregates can have legitimate "0" or "NULL" rows for sparse dims; dropping
would mask the sparseness instead of surfacing it. The DLT data-quality
dashboard still reports rule hit/miss counts.

### 6. Full refresh, not streaming
Source volumes are small (~6 K Bronze events → ~13 populated Gold tables).
Full refresh per pipeline run completes in <20s and avoids the operational
burden of streaming tables (requires CDF on upstream, watermark management).
Path is open: swap `dlt.read` → `dlt.read_stream` later when volumes grow.

### 7. Workflow chain extended to 3 tasks
The daily job `bronze_ga4_daily_sync` is now:
`sync_ga4_to_bronze` → `refresh_silver` → `refresh_gold`
(each task `depends_on` the previous; failure of any cancels the rest.)
Same chain in the manual `bronze_ga4_backfill` job.

---

## Porting deltas — BigQuery → Spark/Databricks

| BQ idiom | Spark/Databricks equivalent | Where it appeared |
|---|---|---|
| `COUNTIF(x)` | `count_if(x)` (built-in) | every Layer 2/3 file |
| `STRING_AGG(DISTINCT x, ',')` | `concat_ws(',', collect_set(x))` | `conversion_funnel` |
| `ARRAY_AGG(DISTINCT x IGNORE NULLS ORDER BY x LIMIT N)` | `slice(array_sort(collect_set(x)), 1, N)` | `project_daily_stats`, `client_daily_stats`, `visitor_insights` |
| `ARRAY_CONCAT_AGG(arr_col)` | `array_distinct(flatten(collect_list(arr_col)))` | `project_rankings` |
| `ANY_VALUE(x)` | `any_value(x)` (built-in) | `visitor_insights` |
| `ARRAY_LENGTH(arr)` | `size(arr)` | `visitor_insights.interest_profile` |
| `EXISTS (SELECT FROM UNNEST(a) WHERE x IN UNNEST(b))` | `arrays_overlap(a, b)` | `recommendations.content_recs` |
| `x IN (SELECT FROM UNNEST(arr))` | `array_contains(arr, x)` | `recommendations` (exclude-viewed clauses) |
| `DATE_DIFF(a, b, DAY)` | `datediff(a, b)` | `visitor_insights.visitor_tenure_days` |
| `ARRAY(SELECT AS STRUCT ... LIMIT N)` | dedicated CTE returning `collect_list(struct(...))` then `CROSS JOIN` | `recommendation_performance` top recs/drivers |
| `FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))` | `event_date >= date_sub(current_date(), 7)` | every Layer 3 (already DATE-typed, no string compare needed) |
| `QUALIFY` clause | `QUALIFY` (supported natively in Databricks SQL) | `recommendations` dedupe |

No untranslatable BQ idioms.

---

## Final row counts (this run)

| Layer | Table                       | Rows | Why                                                |
|-------|-----------------------------|-----:|----------------------------------------------------|
| L2    | `daily_metrics`             |   41 | 41 days with session activity                      |
| L2    | `project_daily_stats`       |  127 | 41 dates × project_ids that had interactions       |
| L2    | `section_daily_stats`       |  111 |                                                    |
| L2    | `traffic_daily_stats`       |   52 |                                                    |
| L2    | `conversion_funnel`         |    4 | Only 4 days had conversion events                  |
| L2    | `domain_daily_stats`        |   11 |                                                    |
| L2    | `experience_daily_stats`    |    7 |                                                    |
| L2    | `recommendation_daily_stats`|    8 |                                                    |
| L2    | `client_daily_stats`        |    0 | All 97 silver.client_events have NULL `client_id`  |
| L2    | `skill_daily_stats`         |    0 | silver.skill_events has 0 rows (no skill clicks)   |
| L2    | `content_reading_stats`     |    0 | No `problem_statement_read` / `solution_read`      |
| L3    | `project_rankings`          |   11 | 1 row per project                                  |
| L3    | `section_rankings`          |    8 |                                                    |
| L3    | `visitor_insights`          |   93 | Unique visitors in last 30 days                    |
| L3    | `recommendations`           |   14 | Per-(user, project) recs                           |
| L3    | `recommendation_performance`|    1 | Scalar row                                         |
| L3    | `skill_rankings`            |    0 | Empty parent (skill_daily_stats)                   |
| L3    | `client_rankings`           |    0 | Empty parent (client_daily_stats)                  |
| L3    | `domain_rankings`           |    0 | No domain events in last 7 days                    |
| L3    | `experience_rankings`       |    0 | No experience events in last 7 days                |
| L3    | `tech_demand_insights`      |    0 | No qualifying tech events in last 7 days           |

The empty tables are all explainable by data sparseness, not port bugs. They
will populate as those event types accrue.

---

## DE principles applied this phase

| Principle                                  | How it shows up                                    |
|--------------------------------------------|----------------------------------------------------|
| Medallion — Gold                           | 21 query-shaped tables in `gold` schema            |
| Lakeflow Declarative Pipelines (DLT)       | `gold_pipeline`, two-file layout                   |
| Cross-pipeline reads                       | `spark.read.table(silver.X)` from gold_pipeline    |
| Same-pipeline DAG                          | `dlt.read("layer2_table")` from layer3 functions   |
| Expectations                               | warn-only `@dlt.expect` on every table             |
| Workflow dependency                        | Bronze → Silver → Gold via `depends_on`            |
| Unity Catalog governance                   | `portfolio_dev.gold.*`                             |
| Cost tagging                               | `project=portfolio, layer=gold`                    |
| Idempotency                                | Full-refresh DLT tables; safe to replay            |

---

## Open items / explicitly deferred

- **Session-row duplication cleanup** — Silver `sessions` still emits multiple
  rows per `(user, session_id)` when GA4 reports `os = 'macOS'/'iOS'` for the
  same iPhone session. Inflates `daily_metrics.total_page_views`. Fix candidate
  for a "Silver-prime" pass.
- **Test-data filtering** — fake `user_pseudo_id` values like `biofi`,
  `retailstack`, `patra` (planted during development) currently feed into Gold
  rankings. Consider filtering at Silver or at Gold for production accuracy.
- **Streaming refresh** — open path; enable Bronze CDF + swap `dlt.read` →
  `dlt.read_stream` when row volume warrants it.
- **Dashboard rewire** — Render/Supabase still serves the live dashboard.
  Phase 4 cuts that over to read Gold directly via Databricks SQL.

---

## How to operate

```bash
# Full daily chain (Bronze sync → Silver refresh → Gold refresh),
# scheduled at 02:00 UTC; also runnable ad-hoc:
databricks bundle run bronze_ga4_daily_sync --target dev --profile abhinav-personal

# Gold pipeline alone:
databricks bundle run gold_pipeline --target dev --profile abhinav-personal

# Full backfill + Silver + Gold:
databricks bundle run bronze_ga4_backfill --target dev --profile abhinav-personal
```

Query examples:

```sql
-- Today's top-of-dashboard KPIs
SELECT * FROM portfolio_dev.gold.daily_metrics ORDER BY session_date DESC LIMIT 7;

-- Which projects to feature this week
SELECT project_title, engagement_score, recommended_position
FROM portfolio_dev.gold.project_rankings
ORDER BY overall_rank;

-- High-value visitors
SELECT user_pseudo_id, visitor_segment, visitor_value_score
FROM portfolio_dev.gold.visitor_insights
ORDER BY visitor_value_score DESC LIMIT 20;
```

---

## Next phase

Phase 4 — **Serving**. Cut the live dashboard (currently Render → Supabase)
over to Databricks SQL → Gold tables. Includes:
- Replace `analytics-backend/functions/main.py` Supabase queries with
  Databricks SQL Warehouse calls.
- Consider hosting the dashboard backend as a Databricks App (drops Render).
- Optional Genie Space over `portfolio_dev.gold` for NL Q&A.
