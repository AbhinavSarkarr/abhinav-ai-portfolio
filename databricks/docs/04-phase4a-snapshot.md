# Phase 4a — Dashboard snapshot serving (Databricks → Gist)

Status: **shipped, running**
Branch: `databricks-migration`
Date opened: 2026-05-17

---

## Why this phase exists

After Phase 3, all 21 Gold tables exist in Databricks but the live dashboard
at `https://<your-portfolio>/dashboard` is still being served by the old
chain:

```
BigQuery materialized → Supabase (daily 14:30 UTC) → update_dashboard_gist.py
                                                       → GitHub Gist → React frontend
```

The frontend already reads from that Gist (`useDashboardData.ts` fetches the
raw URL with React-Query caching). So the **minimum-disruption** way to make
the migration user-visible is to **keep the Gist URL exactly as-is** and just
swap the producer.

Phase 4a does that: a new Databricks task `publish_snapshot` runs after
`refresh_gold` and PATCHes the same Gist with a JSON payload that has
**byte-identical schema** to the old Supabase-sourced one.

The React app sees no change. It just starts displaying Databricks-sourced
data.

---

## Data flow now (post-Phase-4a)

```
GA4 → BigQuery (60-day retention)
        │
        v
[Daily 02:00 UTC, Databricks Workflow]
sync_ga4_to_bronze  ──► refresh_silver  ──► refresh_gold  ──► publish_snapshot
                                                                    │
                                                                    │ PATCH github.com/gists/{id}
                                                                    v
                                                              GitHub Gist
                                                  (dashboard-analytics.json)
                                                                    │
                                                                    │ raw.githubusercontent.com/...
                                                                    v
                                                              React `useDashboardData.ts`
                                                                    │
                                                                    v
                                                              Dashboard3 panels
```

The whole chain ran end-to-end in **6:57** (sync + 3 pipelines + Gist PATCH).

---

## Decisions

### 1. Reuse the existing Gist, do not move to S3/CloudFront
Zero migration cost; the frontend URL stays valid; GitHub Gist is fast,
free, and already CDN-cached at `raw.githubusercontent.com`. Swapping
hosts later is a 10-line frontend change if we ever want to.

### 2. Byte-identical JSON schema
Top-level keys, section names, casing (`projectRankings`, `topVisitors`,
`temporal.hourlyDistribution`, …) match the existing
`update_dashboard_gist.py` output exactly. The React frontend doesn't
need a single change to start showing Databricks data.

### 3. Five pre-computed date ranges per snapshot
- `yesterday`
- `last_7_days`
- `last_14_days`
- `last_30_days`
- `all_time`

Each range carries the full 16-section dashboard payload (~50–200 KB total
when serialized). Frontend picks the range based on the user's selection
and renders client-side.

### 4. Custom date ranges (outside the 5 pre-computed) — deferred to Phase 4b
For now the frontend's default-and-preset views are fully served by the
Gist. Custom-range support is a Phase 4b decision: either client-side
filter from `last_30_days` data, or hit Databricks SQL live.

### 5. SQL queries written against Spark, run inside the notebook
Inside the Databricks notebook we use `spark.sql(...)` against the same
catalog the pipelines write to. No SQL Warehouse needed — the job runs
on serverless and reads Delta directly via Spark.

### 6. Secret management
GitHub PAT (`gist` scope) stored in Databricks Secret Scope `portfolio`,
key `github_gist_token`. Notebook reads via `dbutils.secrets.get(...)`.
Never appears in code, repo, or logs.

---

## What was built

| File | Role |
|---|---|
| `databricks/src/serving/publish_snapshot.py` | The notebook — queries Gold (and a few Silver fields), composes the JSON, PATCHes the Gist |
| `databricks/resources/jobs.yml` (changes) | Added `publish_snapshot` task to both daily and backfill jobs with `depends_on: refresh_gold` |
| `databricks/databricks.yml` (changes) | New variables `dashboard_gist_id` + `gist_token_key` |

Workflow shape is now:

```
sync_ga4_to_bronze → refresh_silver → refresh_gold → publish_snapshot
```

If any task fails, downstream tasks skip (per `depends_on`).

---

## Verification — first end-to-end run (2026-05-17)

Run URL: visible in the Databricks Workflows UI.

```json
Task publish_snapshot output:
{
  "updated_at": "2026-05-17T15:50:34.319329Z",
  "data_start_date": "2026-03-18",
  "data_end_date":   "2026-05-16",
  "ranges": ["yesterday", "last_7_days", "last_14_days", "last_30_days", "all_time"],
  "gist_url": "https://gist.github.com/AbhinavSarkarr/dedbbf6ebcb32542e7b724b86f2b214f"
}
```

Spot-check of the published Gist (`last_7_days` slice):

| Section | Rows / values |
|---|---|
| `overview.totalSessions` | 47 |
| `overview.uniqueVisitors` | 51 |
| `projectRankings` | 10 projects |
| `topVisitors` | 15 visitors |
| `geographic` | 14 country/city rows |
| `temporal.hourlyDistribution` | 17 buckets |
| `all_time.dailyMetrics` | 41 daily rows |

All sections populate, schema validates, frontend should consume without
changes.

---

## ⚠ Important post-deploy step: disable the old GitHub Actions

The repo still contains two scheduled Actions from the BQ era:

| Workflow | What it does | Action needed |
|---|---|---|
| `.github/workflows/bigquery-materialize.yml` | 08:30 UTC daily — runs the BQ Layer-2/3 materialization | **Disable** (Gold lives in Databricks now) |
| `.github/workflows/sync-analytics.yml` | 14:30 UTC daily — BigQuery → Supabase sync + `update_dashboard_gist.py` | **Disable** (will overwrite our Databricks-produced Gist with stale Supabase data otherwise) |

If both remain enabled:
- Databricks publishes to the Gist at ~02:00 UTC
- The GitHub Action overwrites it at 14:30 UTC with Supabase-sourced JSON
- The dashboard ends up showing whichever ran last

**Recommendation:** disable both workflows in the GitHub UI (Settings → Actions → Workflows → disable) once Phase 4a is verified for a couple of days. The actual workflow files can stay in the repo for reference; just turn off the schedule trigger.

---

## DE principles applied this phase

| Principle                                  | How it shows up                                       |
|--------------------------------------------|-------------------------------------------------------|
| Workflow dependency                        | publish_snapshot `depends_on` refresh_gold            |
| Idempotency                                | Re-running the job overwrites the same Gist; no dup state |
| Secrets management                         | PAT in Databricks Secret Scope, never in code         |
| Schema fidelity / contract preservation    | Byte-identical to old producer; consumer untouched    |
| Cost tagging                               | Task inherits the job's tags                          |
| Audit / observability                      | Job-run history + notebook output JSON                |
| Unity Catalog reads                        | Spark SQL against `portfolio_dev.gold.*` and `.silver.*` |

---

## Open items / deferred

- **Phase 4b — live custom-range queries.** Wire FastAPI's `/api/dashboard3?start=...&end=...` to a Databricks SQL Warehouse so range pickers beyond the 5 presets stay fast. Or: handle them client-side from `last_30_days`. Either is a Phase 4b decision.
- **Decommission Supabase + the two GitHub Actions.** After a verification window, drop the Supabase instance and its $25/month bill.
- **Token rotation.** The PAT used here was pasted into chat history during setup. Rotate it from https://github.com/settings/tokens when convenient.
- **Frontend Gist URL** is unchanged (`dedbbf6ebcb32542e7b724b86f2b214f`). If you ever move the snapshot off GitHub, update `useDashboardData.ts` accordingly.

---

## How to operate

```bash
# Full daily chain (scheduled at 02:00 UTC, runnable ad-hoc):
databricks bundle run bronze_ga4_daily_sync --target dev --profile abhinav-personal

# Just the snapshot task (against existing Gold data):
databricks bundle run --job-task publish_snapshot bronze_ga4_daily_sync --target dev --profile abhinav-personal
# (or via the UI — open the job, click Run task on publish_snapshot)

# Sanity-check the published Gist:
curl -s https://gist.githubusercontent.com/AbhinavSarkarr/dedbbf6ebcb32542e7b724b86f2b214f/raw/dashboard-analytics.json | jq '.metadata'
```

---

## Next phase

Phase 4b — **live custom-range support and Supabase decommission**. Once
we're confident the snapshot path is reliable, cut the FastAPI service
over from Supabase to Databricks SQL Warehouse for the rare cases where
visitors pick a custom range outside the 5 presets, then delete the
Supabase project and its sync infrastructure.

Or Phase 5 — **ML / Feature Store**, if Phase 4b can wait.
