# Databricks notebook source
# MAGIC %md
# MAGIC # Bronze · GA4 daily sync
# MAGIC
# MAGIC Mirrors a single day's `events_YYYYMMDD` table from BigQuery into the Bronze
# MAGIC Delta table. Idempotent: rerunning the same `event_date` overwrites only that
# MAGIC partition.

# COMMAND ----------

import base64
import json
from datetime import date, timedelta, datetime

from pyspark.sql import functions as F

# COMMAND ----------

dbutils.widgets.text("catalog", "portfolio_dev")
dbutils.widgets.text("schema", "bronze")
dbutils.widgets.text("gcp_project", "portfolio-483605")
dbutils.widgets.text("gcp_dataset", "analytics_518701756")
dbutils.widgets.text("gcp_secret_scope", "portfolio")
dbutils.widgets.text("gcp_secret_key", "gcp_sa_json")
dbutils.widgets.text("event_date", "")  # "" = yesterday UTC; else "YYYY-MM-DD"

catalog = dbutils.widgets.get("catalog")
schema = dbutils.widgets.get("schema")
gcp_project = dbutils.widgets.get("gcp_project")
gcp_dataset = dbutils.widgets.get("gcp_dataset")
secret_scope = dbutils.widgets.get("gcp_secret_scope")
secret_key = dbutils.widgets.get("gcp_secret_key")
event_date_arg = dbutils.widgets.get("event_date").strip()

target_table = f"{catalog}.{schema}.ga4_events_raw"

if event_date_arg:
    event_date = datetime.strptime(event_date_arg, "%Y-%m-%d").date()
else:
    event_date = date.today() - timedelta(days=1)

date_suffix = event_date.strftime("%Y%m%d")
source_table = f"{gcp_project}.{gcp_dataset}.events_{date_suffix}"

print(f"Source : bigquery://{source_table}")
print(f"Target : {target_table}  (partition event_date = {event_date})")

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
# MAGIC ## 2. Read source table from BigQuery
# MAGIC If the day's table doesn't exist (no traffic, or GA4 export not yet done), exit cleanly.

# COMMAND ----------

try:
    src_df = (
        spark.read.format("bigquery")
        .option("table", source_table)
        .option("credentials", credentials_b64)
        .option("parentProject", gcp_project)
        .load()
    )
    # Force evaluation here so a "table not found" error surfaces inside
    # this try-block, not 50 lines down at the write call.
    row_count = src_df.count()
except Exception as e:
    msg = str(e).lower()
    if "not found" in msg or "404" in msg or "does not exist" in msg:
        dbutils.notebook.exit(f"Source table {source_table} not yet available; exiting cleanly.")
    raise

print(f"Source rows: {row_count:,}")
if row_count == 0:
    dbutils.notebook.exit(f"Source {source_table} is empty; nothing to write.")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Add ingestion metadata + normalize partition column

# COMMAND ----------

# Place metadata columns FIRST so Delta's default stats indexer
# (first 32 cols) covers `_event_date` — required for Liquid Clustering.
bronze_df = src_df.select(
    F.lit(event_date.isoformat()).cast("date").alias("_event_date"),
    F.current_timestamp().alias("_ingested_at"),
    F.lit(source_table).alias("_source_table"),
    *src_df.columns,
)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Write to Bronze
# MAGIC
# MAGIC - First-run: creates the table with Liquid Clustering on `_event_date`.
# MAGIC - Re-run for the same date: dynamic partition overwrite replaces just that
# MAGIC   day, leaving every other partition untouched (idempotent).

# COMMAND ----------

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {catalog}.{schema}")

table_exists = spark.catalog.tableExists(target_table)

# Liquid Clustering is incompatible with partitionOverwriteMode=dynamic;
# use `replaceWhere` for per-day idempotency on subsequent writes.
writer = (
    bronze_df.write.format("delta")
    .mode("overwrite")
    .option("mergeSchema", "true")
)
if not table_exists:
    writer = writer.clusterBy("_event_date")
else:
    writer = writer.option(
        "replaceWhere", f"_event_date = DATE'{event_date.isoformat()}'"
    )

writer.saveAsTable(target_table)

# COMMAND ----------

written = spark.table(target_table).where(F.col("_event_date") == event_date).count()
print(f"Bronze rows written for {event_date}: {written:,}")

dbutils.notebook.exit(
    json.dumps({"event_date": event_date.isoformat(), "rows": written, "source": source_table})
)
