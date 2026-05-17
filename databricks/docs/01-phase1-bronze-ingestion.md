# Phase 1 — Bronze Ingestion (GA4 → Databricks)

Status: **scaffolded, not yet deployed**  
Branch: `databricks-migration`  
Date opened: 2026-05-17

---

## Why this phase exists

GA4 free tier writes daily `events_YYYYMMDD` tables into BigQuery, but the
BigQuery dataset has a **60-day default table expiration** baked in. Verified
on 2026-05-17:

- Oldest live raw table: `events_20260318` — expires **2026-05-18** (tomorrow).
- Historical loss already taken: GA4 export began 2026-01-07, so ~70 days of
  raw events (Jan 7 → Mar 17) are gone.
- The "materialized" tables documented in `analytics-backend/sql/` were never
  fully deployed — only `analytics_materialized.sessions` exists in BigQuery
  (and it also carries the same 60-day clock).

Persisting the raw GA4 events into a store we control is therefore the **first
thing** the migration must address. Everything downstream (Silver / Gold / ML /
serving) builds on top of this Bronze landing zone.

---

## Current data flow being captured

```
Browser (gtag events)
   v
Google Analytics 4
   v
BigQuery (analytics_518701756.events_YYYYMMDD)        <-- 60-day clock
   v   <-- THIS PHASE
Databricks Bronze (portfolio_dev.bronze.ga4_events_raw)   <-- no expiry
```

Everything past Bronze is out of scope for Phase 1.

---

## Decisions

### 1. Connector: native Spark BigQuery connector
Built into Databricks Runtime. No Fivetran / dlt / Airbyte / custom REST.

### 2. Landing pattern: full daily mirror, not federation
Considered Lakehouse Federation (query BQ live without copying); rejected
because BQ still expires the source, defeating the purpose. We **physically
copy** events into Delta on Databricks.

### 3. Compute: serverless jobs
Databricks Free Edition has no classic clusters. Serverless jobs are also the
modern best practice, so we adopt it permanently rather than as a workaround.

### 4. Schedule: daily cron at 02:00 UTC
GA4 free-tier export runs once per day and usually completes by ~16:00 UTC of
the next day. 02:00 UTC the following morning is the safest fixed time that
also keeps the freshness lag below 36 hours. (Streaming export is GA4 360
only, so a faster cadence is moot.) The schedule ships **paused** so the first
run is manual.

### 5. Storage layout
- Catalog : `portfolio_dev` (target=dev) / `portfolio_prod` (target=prod)
- Schema  : `bronze`
- Table   : `ga4_events_raw`
- Format  : Delta, **Liquid Clustering on `_event_date`** (no explicit
  partitioning — data is too small).

### 6. Write semantics: append-only, idempotent via partition overwrite
Each daily run does `mode("overwrite") + partitionOverwriteMode=dynamic`
scoped to one `_event_date` value. Re-running for any past date safely
replaces just that day. Bronze itself is logically append-only — never
UPDATE/DELETE individual rows.

### 7. Schema evolution: enabled
`mergeSchema = true` on write. GA4 adds custom event params over time; we
don't want sync failures when that happens.

### 8. Ingestion metadata columns
Three system columns added on every row:
- `_event_date` (date) — partition / clustering key
- `_ingested_at` (timestamp) — when this row landed in Bronze
- `_source_table` (string) — provenance back to the BQ source table

### 9. Secrets: GCP service account via Databricks Secret Scope
- Scope : `portfolio`
- Key   : `gcp_sa_json` (the entire JSON, stored as a string secret)
- Required GCP roles on `portfolio-483605`:
  `roles/bigquery.dataViewer` + `roles/bigquery.jobUser`

### 10. Two jobs, not one
- `bronze_ga4_daily_sync` — scheduled, processes one day at a time.
- `bronze_ga4_backfill`   — manual, walks every still-alive BQ table once at
  cutover. Separating these keeps the daily path simple and predictable.

### 11. Deployment: Databricks Asset Bundles (DAB) + `deploy.sh`
Single command (`./deploy.sh <profile>`) brings the whole pipeline live in any
workspace. The bundle owns catalogs, schemas, jobs, and code paths. Secrets
are bootstrapped interactively the first time.

---

## DE principles applied this phase

| Principle                            | How it shows up                                   |
|--------------------------------------|---------------------------------------------------|
| Medallion — Bronze                   | `bronze.ga4_events_raw` is the unmodified mirror  |
| Delta Lake                           | Table format; ACID + time travel + schema evol.   |
| Unity Catalog                        | `portfolio_dev` / `portfolio_prod` catalogs       |
| Append-only / immutability           | Bronze never mutated                              |
| Idempotent processing                | Dynamic partition overwrite on `_event_date`      |
| Incremental processing               | Daily run pulls one day's table only              |
| Liquid Clustering                    | On `_event_date`                                  |
| Schema evolution                     | `mergeSchema=true`                                |
| Secret management                    | Databricks Secret Scope (`portfolio/gcp_sa_json`) |
| Workflows + DAB                      | Job defined as code, deployable to any workspace  |
| Cost tagging                         | `project=portfolio, layer=bronze, owner=abhinav`  |
| Environment separation               | `dev` / `prod` targets in `databricks.yml`        |

---

## Open items / explicitly deferred

- **Silver / Gold rebuild** — kept in `analytics-backend/sql/`; rewriting to
  DLT pipelines is Phase 2/3.
- **Supabase backfill** — pulling whatever older aggregates Supabase still
  holds into Databricks (covered in Phase 2 cutover).
- **Dashboard rewire** — frontend still hits Render → Supabase. Phase 4.
- **Voice agent transcripts** — not yet persisted anywhere; out of scope here.
- **Contact form submissions** — stays in Netlify Forms for now.

---

## Next phase

Phase 2 — Silver. Define typed event tables from `bronze.ga4_events_raw`
(sessions, page_views, project_events, conversion_events, …) using DLT.
