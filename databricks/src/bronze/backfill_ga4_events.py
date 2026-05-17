# Databricks notebook source
# MAGIC %md
# MAGIC # Bronze · GA4 backfill (one-shot)
# MAGIC
# MAGIC Iterates `events_YYYYMMDD` tables across a date range and lands each one
# MAGIC in Bronze. Missing days (table not yet created or already expired in BQ)
# MAGIC are skipped silently.
# MAGIC
# MAGIC No `google-cloud-bigquery` dependency — purely the Spark BigQuery
# MAGIC connector that ships with the Databricks runtime.
# MAGIC
# MAGIC Idempotent: each day overwrites its own partition.

# COMMAND ----------

import base64
import json
from datetime import date, datetime, timedelta

from pyspark.sql import functions as F

# COMMAND ----------

dbutils.widgets.text("catalog", "portfolio_dev")
dbutils.widgets.text("schema", "bronze")
dbutils.widgets.text("gcp_project", "portfolio-483605")
dbutils.widgets.text("gcp_dataset", "analytics_518701756")
dbutils.widgets.text("gcp_secret_scope", "portfolio")
dbutils.widgets.text("gcp_secret_key", "gcp_sa_json")
dbutils.widgets.text("start_date", "")  # "" = today - 65 days
dbutils.widgets.text("end_date", "")    # "" = today UTC

catalog = dbutils.widgets.get("catalog")
schema = dbutils.widgets.get("schema")
gcp_project = dbutils.widgets.get("gcp_project")
gcp_dataset = dbutils.widgets.get("gcp_dataset")
secret_scope = dbutils.widgets.get("gcp_secret_scope")
secret_key = dbutils.widgets.get("gcp_secret_key")
start_arg = dbutils.widgets.get("start_date").strip()
end_arg = dbutils.widgets.get("end_date").strip()

target_table = f"{catalog}.{schema}.ga4_events_raw"

# GA4 free tier retention is ~60 days. 65 gives us a safe upper bound
# without scanning forever.
start_date = (
    datetime.strptime(start_arg, "%Y-%m-%d").date()
    if start_arg
    else date.today() - timedelta(days=65)
)
end_date = (
    datetime.strptime(end_arg, "%Y-%m-%d").date()
    if end_arg
    else date.today()
)

print(f"Source range : {start_date} .. {end_date}")
print(f"Target table : {target_table}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Auth — base64 the GCP SA JSON so it ships with every executor task
# MAGIC
# MAGIC `credentialsFile` would only work on the driver node; serverless executors
# MAGIC don't share its local FS. The `credentials` option carries the secret in
# MAGIC the task payload itself.

# COMMAND ----------

sa_json = dbutils.secrets.get(scope=secret_scope, key=secret_key)
credentials_b64 = base64.b64encode(sa_json.encode("utf-8")).decode("utf-8")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Walk the date range, attempt to read each day, skip if missing

# COMMAND ----------

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {catalog}.{schema}")
first_write = not spark.catalog.tableExists(target_table)

results = []
skipped = []
d = start_date
while d <= end_date:
    table_id = f"events_{d.strftime('%Y%m%d')}"
    src = f"{gcp_project}.{gcp_dataset}.{table_id}"

    try:
        raw = (
            spark.read.format("bigquery")
            .option("table", src)
            .option("credentials", credentials_b64)
            .option("parentProject", gcp_project)
            .load()
        )

        # Place metadata columns FIRST so Delta's default stats indexer
        # (first 32 cols) covers `_event_date` — required for Liquid Clustering.
        df = raw.select(
            F.lit(d.isoformat()).cast("date").alias("_event_date"),
            F.current_timestamp().alias("_ingested_at"),
            F.lit(src).alias("_source_table"),
            *raw.columns,
        )

        # Liquid Clustering is incompatible with partitionOverwriteMode=dynamic;
        # use `replaceWhere` for per-day idempotency on subsequent writes.
        writer = (
            df.write.format("delta")
            .mode("overwrite")
            .option("mergeSchema", "true")
        )
        if first_write:
            writer = writer.clusterBy("_event_date")
        else:
            writer = writer.option(
                "replaceWhere", f"_event_date = DATE'{d.isoformat()}'"
            )

        writer.saveAsTable(target_table)
        first_write = False  # only flip after a successful write

        rows = spark.table(target_table).where(F.col("_event_date") == d).count()
        print(f"-> {d.isoformat()}  wrote {rows:,} rows")
        results.append({"event_date": d.isoformat(), "rows": rows})

    except Exception as e:
        # The BQ connector evaluates lazily, so "table not found" surfaces
        # inside the write call. Wrapping the whole block lets us skip cleanly.
        msg = str(e).lower()
        if "not found" in msg or "404" in msg or "does not exist" in msg:
            print(f"-> {d.isoformat()}  (missing, skip)")
            skipped.append(d.isoformat())
        else:
            raise

    d += timedelta(days=1)

# COMMAND ----------

total = sum(r["rows"] for r in results)
print(f"\nBackfill complete.")
print(f"  loaded : {len(results)} day(s), {total:,} rows total")
print(f"  skipped: {len(skipped)} day(s) (table missing in BQ)")

dbutils.notebook.exit(
    json.dumps(
        {
            "loaded_days": len(results),
            "loaded_rows": total,
            "skipped_days": len(skipped),
            "detail": results,
        }
    )
)
