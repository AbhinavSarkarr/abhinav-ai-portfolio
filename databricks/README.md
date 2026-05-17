# Portfolio Analytics — Databricks Migration

Databricks Asset Bundle that owns the data-engineering side of the portfolio:
ingests GA4 events from BigQuery, then (in later phases) processes them through
Silver / Gold layers and serves them back to the portfolio dashboard.

This folder is **fully self-contained**. `./deploy.sh <profile>` is enough to
bring the entire portfolio analytics pipeline live in any Databricks workspace.

---

## Layout

```
databricks/
├── databricks.yml              # Bundle root: name, variables, targets (dev/prod)
├── deploy.sh                   # One-shot deploy to any workspace
├── resources/
│   ├── catalogs.yml            # UC schemas managed by the bundle
│   └── jobs.yml                # Workflows (daily sync + manual backfill)
├── src/
│   └── bronze/
│       ├── sync_ga4_events.py      # Daily incremental sync (BQ -> Bronze)
│       └── backfill_ga4_events.py  # One-shot historical backfill
└── docs/
    └── 01-phase1-bronze-ingestion.md   # Current phase write-up
```

## Prerequisites

1. Databricks CLI v0.220+ installed and authenticated:
   ```bash
   databricks auth login --host https://<your-workspace>.cloud.databricks.com \
                         --profile <profile_name>
   ```
2. A GCP service account JSON with these roles on `portfolio-483605`:
   - `roles/bigquery.dataViewer` (read GA4 export tables)
   - `roles/bigquery.jobUser` (run read queries)

## Deploying

```bash
cd databricks/
./deploy.sh <profile_name>            # deploys to 'dev' target
./deploy.sh <profile_name> prod       # deploys to 'prod' target
```

`deploy.sh` will:
1. Validate the CLI profile.
2. Create the Unity Catalog catalog (`portfolio_dev` / `portfolio_prod`) if needed.
3. Create the secret scope (`portfolio`) and prompt for the GCP JSON if not yet uploaded.
4. Run `databricks bundle validate` + `bundle deploy`.

## First-time backfill

After the first deploy, run the backfill once to ingest everything BigQuery
still has (it expires daily on the GA4 side):

```bash
databricks bundle run bronze_ga4_backfill --profile <profile_name> --target dev
```

Then unpause the daily sync job from the Workflows UI.

## Bundle targets

| Target | Catalog          | Schedule mode | Default? |
|--------|------------------|---------------|----------|
| `dev`  | `portfolio_dev`  | development   | yes      |
| `prod` | `portfolio_prod` | production    | no       |

Switch the destination workspace by editing `workspace.host` for the target in
`databricks.yml` — everything else is parameterized.

## Variables

All in `databricks.yml`. Override at deploy time with `--var key=value`:

| Variable           | Default                  | Notes                                       |
|--------------------|--------------------------|---------------------------------------------|
| `catalog_name`     | per-target               | Unity Catalog catalog                       |
| `bronze_schema`    | `bronze`                 | Schema for raw landing tables               |
| `ga4_bq_project`   | `portfolio-483605`       | GCP project of the GA4 export               |
| `ga4_bq_dataset`   | `analytics_518701756`    | GA4 BigQuery dataset                        |
| `gcp_secret_scope` | `portfolio`              | Databricks secret scope                     |
| `gcp_secret_key`   | `gcp_sa_json`            | Key for the GCP SA JSON inside the scope    |
| `sql_warehouse_id` | starter warehouse id     | Free Edition: reuse the existing warehouse  |

## Free Edition notes

This workspace runs on Databricks Free Edition. Implications:

- The default `Serverless Starter Warehouse` cannot be deleted. We reuse it.
- All compute is serverless; no classic clusters.
- Some platform features (Lakehouse Monitoring, custom clusters, etc.) are unavailable.

## Roadmap

| Phase | Scope                                                  | Status      |
|-------|--------------------------------------------------------|-------------|
| 1     | Bronze ingestion — GA4 BigQuery → Delta (this folder)  | In progress |
| 2     | Silver — typed event tables (sessions, page views, …)  | Pending     |
| 3     | Gold — aggregates, rankings, visitor insights          | Pending     |
| 4     | Serving — Databricks SQL Warehouse + dashboard rewire  | Pending     |
| 5     | ML — Feature Store + recommender (MLflow)              | Pending     |
