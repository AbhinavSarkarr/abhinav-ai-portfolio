# Phase 4b — FastAPI rewired to Databricks SQL Warehouse

Status: **code ready, awaiting Render env-var update + Supabase decommission**
Branch: `databricks-migration`
Date opened: 2026-05-17

---

## Why this phase exists

After Phase 4a, the **5 preset date ranges** (yesterday, last_7_days, etc.)
serve from the Databricks-fed Gist. But the **Custom Range** option in
`Dashboard3.tsx` still POSTs to `/api/dashboard3?start_date=…&end_date=…`
on Render → which queried Supabase. That was the last live read of the
old Supabase data path.

Phase 4b cuts that last cord: the FastAPI on Render now queries
**Databricks SQL Warehouse** directly via `databricks-sql-connector`,
reading from `portfolio_dev.silver.sessions` and `portfolio_dev.gold.*`.

---

## What changed

| File | Change |
|---|---|
| `analytics-backend/functions/main.py` | Full rewrite. `psycopg2` → `databricks-sql-connector`. All 18 SQL queries ported (Postgres dialect → Spark SQL). Table names fully qualified (`{SILVER}.sessions`, `{GOLD}.daily_metrics`, …). Same endpoint shapes + response schema so frontend untouched. Version bumped 3.0.0 → 4.0.0. |
| `analytics-backend/functions/requirements.txt` | `psycopg2-binary` → `databricks-sql-connector==3.*` |
| `.github/workflows/keep-render-warm.yml` | **New.** Cron every 14 min → curl `/health`. Keeps Render's free-tier service from spinning down. |
| `analytics-backend/supabase/*` | (left in repo for git history reference; the producers no longer run since the GitHub Actions are disabled) |

### SQL dialect translations applied throughout

| Postgres | Databricks SQL | Where it showed up |
|---|---|---|
| `::numeric` cast on ROUND output | dropped — Spark `ROUND()` returns the right type | every metric query |
| `::int` cast on ROW_NUMBER | `CAST(x AS INT)` | rankings queries |
| `PERCENTILE_CONT(p) WITHIN GROUP (ORDER BY col)` | `percentile(col, p)` | project / domain / experience / tech rankings |
| `MODE() WITHIN GROUP (ORDER BY col)` | `mode(col)` | top_visitors |
| `COUNT(*) FILTER (WHERE x)` | `count_if(x)` | temporal / devices / geographic |
| `MAX(date) - MIN(date)` (interval) | `datediff(MAX(date), MIN(date))` (returns int days) | visitor_segments / top_visitors |
| `%s` parameter placeholders | `?` | every parametrized query |
| Unqualified table names (`sessions`, `daily_metrics`) | `{SILVER}.sessions`, `{GOLD}.daily_metrics`, … | every FROM/JOIN |

### Removed: legacy `traffic` query
The original had a `traffic` query reading from `traffic_daily_stats` —
its result was assembled into `data["traffic"]` but **never referenced**
in the response payload (`trafficSources` is sourced from
`traffic_sources_summary` instead). It also had a Spark-incompatible
`SUM(sessions) AS sessions` alias collision. Removed entirely.

### Added: `_to_python()` row normalizer
The Databricks SQL connector returns:
- `Decimal` for `ROUND()` outputs
- `numpy.ndarray` for `ARRAY<STRUCT<...>>` columns (e.g.
  `recommendation_performance.top_performing_recommendations` from
  `collect_list(struct(...))`)
- Plain Python primitives otherwise

FastAPI's `jsonable_encoder` chokes on those. The normalizer recursively
walks each row and converts `ndarray → list`, `Decimal → float`,
`datetime → ISO string`. Result: clean JSON the React frontend can
consume without changes.

### `/api/sync-status` is now a stub
The old endpoint returned the contents of the Supabase `sync_metadata`
table. That table doesn't exist in Databricks (the workflow's run history
in the Databricks UI is the authoritative freshness story). The endpoint
returns a stub payload so any older clients don't error.

---

## Keep-Render-warm workflow

`.github/workflows/keep-render-warm.yml` runs every 14 minutes
(`cron: '*/14 * * * *'`) and `curl`s `/health`. Render free-tier services
spin down after ~15 min of inactivity; this keeps it warm 24/7.

Math: Render free tier allows 750 service-hours/month. 24×30 = 720h — fits
with ~30h of headroom. If you add a second Render service, this assumption
breaks.

**Intentionally NOT pinged: the SQL Warehouse.** Hitting it every 14 min
would burn ~$250/month of Databricks Free Edition credit just to keep it
hot — and on Free Edition, exceeding monthly compute quota shuts down ALL
compute, including the daily Bronze/Silver/Gold pipeline. The accepted
trade-off: when a visitor picks Custom Range and the warehouse happens to
be cold, they wait ~5-15s on the first query. Subsequent queries in that
window are fast (warehouse stays warm ~10 min, plus result caching).

---

## Cold-start expectations (verified locally 2026-05-17)

| Scenario | Latency |
|---|---|
| `/health` | ~30 ms (no SQL involvement) |
| `/api/dashboard3` first call (cold warehouse, 18 parallel queries) | **~10 s** |
| `/api/dashboard3` same date range, cache hit | sub-second |
| `/api/dashboard3` different date range, warm warehouse | ~1-2 s |
| Same call but the 5 preset ranges (frontend reads Gist) | sub-100 ms (CDN) |

The 18 queries fan out in parallel via a `ThreadPoolExecutor(max_workers=10)`.
First query pays the warehouse warm-up; the other 17 ride free behind it.

Local test result against the live `dbc-7de4dd77-18aa` workspace:
- `start_date=2026-05-10, end_date=2026-05-16`
- 47 sessions, 51 unique visitors, 10 project rankings, 15 top visitors
- Matches the corresponding `last_7_days` slice in the Gist exactly
- Response: 10.16s

---

## ⚠ Manual steps required before this is live

### 1. Update Render env vars

Open https://dashboard.render.com → portfolio-analytics-api → Environment.

**Add:**
```
DATABRICKS_SERVER_HOSTNAME=dbc-7de4dd77-18aa.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/13c9f508d69108bf
DATABRICKS_TOKEN=<the PAT — store in Render's encrypted env var UI>
CATALOG=portfolio_dev
SILVER_SCHEMA=silver
GOLD_SCHEMA=gold
```

**Delete:**
```
SUPABASE_HOST
SUPABASE_PORT
SUPABASE_DATABASE
SUPABASE_USER
SUPABASE_PASSWORD
SUPABASE_URL
GOOGLE_APPLICATION_CREDENTIALS
```

### 2. Push this branch
Render watches the repo. The push triggers an automatic deploy that
installs `databricks-sql-connector` and starts the new FastAPI.

### 3. Verify

```bash
curl https://portfolio-analytics-api.onrender.com/health
# → {"status":"healthy", ...}

curl "https://portfolio-analytics-api.onrender.com/api/dashboard3?start_date=2026-05-10&end_date=2026-05-16" | jq .source
# → "databricks"
```

Then open https://abhinavbuilds.in/dashboard → flip to Custom Range →
pick May 10 to May 16 → confirm the panels render with real data.

### 4. Decommission Supabase

Once Custom Range is verified working from Databricks:

- Open the Supabase dashboard (https://supabase.com/dashboard) → project
  `pabymjbidxkatgcsqrnd` → **Settings → General → Delete project**.
- That deletes ~$25/month of recurring spend.

### 5. Rotate the Databricks PAT
The token was pasted in chat history during setup. Rotate it from the
Databricks UI: https://dbc-7de4dd77-18aa.cloud.databricks.com/settings/user/developer/access-tokens
Update Render with the new value.

---

## DE principles applied this phase

| Principle | How it shows up |
|---|---|
| Direct lakehouse reads | FastAPI queries Databricks SQL Warehouse, no caching DB in between |
| Schema fidelity | Response shape unchanged; frontend not touched |
| Secrets management | Databricks PAT in Render env vars only; never in repo |
| Operational simplicity | One fewer DB (Supabase gone), one fewer cron (sync-analytics GH Action) |
| Cost discipline | Don't ping the warehouse; rely on result caching + the Gist for 99% of paths |
| Audit | `source: "databricks"` in every response; old `source: "supabase"` would surface if some clinger lookup happens |

---

## Open items / deferred

- **Render env var update + push** (manual steps above).
- **Supabase delete** (manual, after verification).
- **Phase 5 — ML / Feature Store**, when ready.
- **Connection-pool optimization** — `databricks-sql-connector` doesn't
  pool by default; we open a connection per query. Total cost: ~100-300ms
  per query for connection setup. Adding a pool (e.g., `sqlglot` connection
  manager) would shave ~3-5s off cold requests. Worth doing if latency
  becomes a complaint; ignored for now.
