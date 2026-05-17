# Phase 2 — Silver (typed event tables via DLT)

Status: **shipped, running**
Branch: `databricks-migration`
Date opened: 2026-05-17

---

## Why this phase exists

Bronze (`bronze.ga4_events_raw`) is a faithful copy of GA4's raw export — 30+
columns including nested `event_params` (map), `device`, `geo`, `traffic_source`
structs, etc. Querying it directly is painful and aggregating it for the
dashboard repeats the same filter / unpack work for every consumer.

Silver flattens raw events into **9 typed, narrow, query-friendly tables**,
one per logical event domain (sessions, page_views, project_events, …). Every
downstream artifact (Gold aggregates, the dashboard, the recommender) reads
from Silver, never from Bronze.

The 9 tables mirror the existing `analytics-backend/sql/layer1_base/*.sql`
view set — we ported the business logic 1:1 from BigQuery to Databricks SQL
inside a Lakeflow Declarative Pipeline (DLT).

---

## Data flow

```
bronze.ga4_events_raw   (one wide raw table, ~6k rows over 60 days)
         |
         |  Lakeflow Declarative Pipeline (silver_pipeline)
         |   • single helper view `bronze_events_recent` applies the 90-day filter
         |   • 9 tables fan out in PARALLEL (no inter-table deps)
         |   • expectations enforced inline; metrics in DLT UI
         v
silver.sessions    silver.page_views      silver.project_events
silver.section_events   silver.skill_events    silver.conversion_events
silver.client_events    silver.recommendation_events   silver.certification_events
```

---

## Decisions

### 1. Lakeflow Declarative Pipelines (DLT), not plain Jobs
Reasons:
- Declarative — write `@dlt.table` once, DLT builds the DAG.
- **Parallel execution by default** for independent tables.
- Inline expectations (`@dlt.expect`, `@dlt.expect_or_drop`) with a built-in
  data-quality dashboard.
- Lineage graph in the UI: every table shows its source(s).
- Incremental refresh path open (just swap `dlt.read` → `dlt.read_stream` later).

### 2. Materialized views, not streaming tables (for now)
Data is small (~6k rows). Full refresh on every run is sub-second per table.
Streaming-table mode requires enabling Change Data Feed on Bronze; defer
that until row counts make incremental processing actually pay off.

### 3. SQL inside `spark.sql(...)`, not the PySpark DataFrame API
The source is SQL. Keeping the port as SQL minimizes drift and makes the
diff against `layer1_base/*.sql` reviewable. Helper PySpark functions can be
added later if logic shifts.

### 4. One pipeline file, not nine
Spreading 9 small table defs across 9 files would add overhead with no
benefit. `src/silver/silver_pipeline.py` holds them all — easy to read,
easy to grep, easy to extend.

### 5. Single 90-day window applied once
A `@dlt.view` named `bronze_events_recent` filters Bronze to the last 90 days
and every Silver table reads from that view. Single source of truth for the
look-back window.

### 6. Expectations: warn-only for per-event tables
The original BigQuery views never enforced "ID IS NOT NULL" — they just
selected the column. Hard-dropping in DLT would silently lose data
(e.g., `domain_interest` events legitimately have no `client_id`).

Final policy:
- `sessions.session_id IS NOT NULL` → **expect_or_drop** (matches original
  `WHERE session_id IS NOT NULL` in BQ SQL).
- Every other "valid_X" assertion → **expect** (warn, don't drop). Metric
  shows in DLT data-quality dashboard.

### 7. `event_params` as a MAP, not an array
Bronze landed `event_params` as `MAP<STRING, STRUCT<string_value, int_value,
float_value, double_value>>` because the Spark BigQuery connector converts
BQ's array-of-key-value-structs into a Spark map. Saves us `LATERAL VIEW
explode` and gives clean dict access: `event_params['ga_session_id'].int_value`.

### 8. Wired into the daily workflow as task #2
`bronze_ga4_daily_sync` is now a 2-task multi-task job: `sync_ga4_to_bronze`
→ `refresh_silver` (depends_on). Same for the manual backfill. If Bronze
fails or skips, Silver is skipped automatically.

---

## Silver tables — final state (this run)

| Table                  | Rows  | Source filter (`event_name IN ...`)                                                                                  | Type            |
|------------------------|------:|----------------------------------------------------------------------------------------------------------------------|-----------------|
| `sessions`             |   380 | All events — aggregated per `(user_pseudo_id, session_id)`                                                           | GROUP BY        |
| `page_views`           |   683 | `page_view`                                                                                                          | 1 row / event   |
| `project_events`       |   428 | 8 types — `project_view`, `project_click`, `project_expand`, `project_link_click`, `case_study_open`, …             | 1 row / event   |
| `section_events`       | 4,425 | 8 types — `section_view`, `section_engagement`, `section_exit`, `scroll`, `scroll_milestone`, `scroll_depth`, …     | 1 row / event   |
| `client_events`        |    97 | 10 types — `client_view`, `client_click`, `client_case_study_open`, `domain_interest`, `experience_level_interest`, … | 1 row / event   |
| `recommendation_events`|    22 | `recommendation_shown`, `recommendation_click`                                                                       | 1 row / event   |
| `conversion_events`    |     9 | 12 types — `cta_click`, `contact_form_submit`, `resume_download`, `exit_intent`, `publication_click`, …             | 1 row / event   |
| `skill_events`         |     0 | `skill_click`, `skill_hover`, `skill_category_view` — **no raw events yet**                                          | empty (valid)   |
| `certification_events` |     0 | `certification_click` — **no raw events yet**                                                                        | empty (valid)   |

Run time: **~13s** for the full 9-table refresh.

---

## Known issues found during this phase

### Session-row duplication
175 distinct `(user_pseudo_id, session_id)` pairs become 380 rows because
the original BQ SQL's GROUP BY includes device/geo dimensions that
occasionally vary within a session — e.g., GA4 emits the same session with
`os = 'macOS'` on one event and `os = 'iOS'` on another (Apple Continuity
quirk), or `device_language = 'en-US'` vs `'en-us'` (case mismatch).

**Decision:** ported faithfully; same behavior as the original BigQuery view.
A cleanup pass (collapse to one row per session via MAX of each dim) is a
candidate for a future "Silver-prime" pass or for Gold aggregation.

### Test/seed events with hardcoded user IDs
Some events have `user_pseudo_id` values like `biofi`, `retailstack`,
`patra` — these are dev/test events fired from multiple devices with the
same hardcoded ID. Distinct from real numeric GA4 IDs like `1338061142.…`.

**Decision:** keep them for now; filter out in Gold if they distort metrics.

### `client_id` missing on `domain_interest` / `experience_level_interest`
Some client-related events legitimately don't carry a `client_id`. The
original BQ SQL included them with NULL; our DLT initially had
`expect_or_drop` which silently dropped all 97 rows. Fixed by switching to
warn-only `expect`.

---

## DE principles applied this phase

| Principle                                  | How it shows up                                  |
|--------------------------------------------|--------------------------------------------------|
| Medallion — Silver                         | 9 typed tables in `silver` schema                |
| Lakeflow Declarative Pipelines (DLT)       | One `@dlt.table` per Silver table                |
| DLT Expectations                           | `@dlt.expect`, `@dlt.expect_or_drop`             |
| Schema enforcement                         | Built-in to Delta                                |
| Liquid Clustering                          | Inherited from Bronze partitioning              |
| Incremental processing (path open)         | `dlt.read` today, `dlt.read_stream` later        |
| Lineage                                    | Visible in the DLT UI graph                      |
| Unity Catalog governance                   | `portfolio_dev.silver.*` tables                  |
| Workflow dependency                        | Bronze → Silver via `depends_on`                 |
| Cost tagging                               | `project=portfolio, layer=bronze_silver`         |
| Idempotent / re-runnable                   | Full-refresh DLT tables, safe to replay          |

---

## How to operate

```bash
# Full daily workflow (Bronze sync + Silver refresh) — runs at 02:00 UTC daily,
# also runnable ad-hoc:
databricks bundle run bronze_ga4_daily_sync --target dev --profile abhinav-personal

# Silver pipeline alone (ad-hoc refresh):
databricks bundle run silver_pipeline --target dev --profile abhinav-personal

# Backfill Bronze + refresh Silver (one-shot historical reload):
databricks bundle run bronze_ga4_backfill --target dev --profile abhinav-personal
```

Inspect data:
```sql
SELECT * FROM portfolio_dev.silver.sessions LIMIT 10;
DESCRIBE EXTENDED portfolio_dev.silver.page_views;
```

DLT pipeline UI (lineage, data quality, run history):
- Workspace UI → Pipelines → `[dev] silver pipeline`

---

## Open items / explicitly deferred

- **Gold aggregates** — daily metrics, rankings, visitor insights (Phase 3).
- **Session-row deduplication** — collapse to one-per-session, either in a
  hardened Silver pass or in Gold MAX-aggregation.
- **Streaming refresh** — enable CDF on Bronze, switch DLT to streaming-table
  mode. Worth doing once daily Bronze volume grows beyond a few thousand rows.
- **Dashboard rewire** — Render/Supabase still serves the live dashboard.
  Phase 4 cuts that over to Databricks SQL.

---

## Next phase

Phase 3 — Gold. Daily aggregates (11 tables) + 7-day rolling rankings
(10 tables) derived from Silver. Mostly straightforward `GROUP BY` SQL,
also via DLT, with cross-table dependencies (e.g., `project_rankings`
reads `project_daily_stats`).
