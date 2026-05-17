# Databricks Migration — DE Standards Reference

Reference list of industry-standard data engineering practices/concepts considered for the portfolio's Databricks migration.

- `[KEEP]` = will apply in this migration
- `[SKIP]` = considered but overkill for portfolio scale
- Free to add, remove, re-classify, or annotate while studying.

---

## 1. Architecture & Modeling

- [KEEP] Medallion Architecture (Bronze / Silver / Gold)
- [KEEP] Lakehouse Architecture
- [KEEP] Dimensional Modeling (Kimball — facts & dimensions)
- [KEEP] Star schema
- [KEEP] Slowly Changing Dimensions — SCD Type 2
- [KEEP] CDC (Change Data Capture) — concept
- [SKIP] Data Mesh (domain-oriented ownership)
- [SKIP] Data Vault 2.0 (Hubs / Links / Satellites)
- [SKIP] One Big Table (OBT) / Wide-table modeling
- [SKIP] Snowflake schema
- [SKIP] Event Sourcing

## 2. Storage & Format

- [KEEP] Delta Lake (ACID on the lakehouse)
- [KEEP] Parquet (columnar storage)
- [KEEP] Liquid Clustering
- [KEEP] OPTIMIZE / VACUUM / Auto-Compaction
- [KEEP] Time Travel
- [KEEP] Schema Evolution
- [KEEP] Deletion Vectors
- [SKIP] Z-Ordering (Liquid Clustering supersedes)
- [SKIP] Explicit Partitioning (data too small)

## 3. Governance & Catalog

- [KEEP] Unity Catalog (catalog → schema → table hierarchy)
- [KEEP] Data Lineage
- [KEEP] Audit Logging (via system tables)
- [KEEP] Basic RBAC (service principal for jobs)
- [SKIP] Data Contracts
- [SKIP] Row-level / Column-level Security
- [SKIP] ABAC (Attribute-Based Access Control)
- [SKIP] PII Tagging & Masking
- [SKIP] Data Classification framework

## 4. Ingestion & Processing

- [KEEP] ELT over ETL
- [KEEP] Auto Loader (incremental file ingestion)
- [KEEP] Delta Live Tables (DLT) / Lakeflow Declarative Pipelines
- [KEEP] Idempotent / Exactly-Once processing
- [KEEP] MERGE / UPSERT patterns
- [KEEP] Incremental processing with watermarks
- [SKIP] Structured Streaming (batch is sufficient)
- [SKIP] External CDC ingestion (e.g., Debezium)

## 5. Data Quality

- [KEEP] DLT Expectations
- [KEEP] Schema Enforcement
- [KEEP] Quarantine pattern (bad records isolated)
- [KEEP] Freshness checks / SLAs (lightweight)
- [SKIP] Great Expectations
- [SKIP] Soda
- [SKIP] Heavy reconciliation framework (row-count check is enough)

## 6. Orchestration & DevOps

- [KEEP] Databricks Workflows / Jobs
- [KEEP] Databricks Asset Bundles (DAB — IaC for Databricks)
- [KEEP] CI/CD for data pipelines (GitHub Actions)
- [KEEP] Environment separation (dev / prod catalogs)
- [KEEP] Git folders / Repos
- [KEEP] Secrets management (Databricks Secret Scopes)
- [SKIP] Terraform Databricks provider (DAB covers it)
- [SKIP] Separate staging environment

## 7. Observability

- [KEEP] System Tables (query history, billing, lineage)
- [KEEP] Cost attribution & tagging
- [SKIP] Lakehouse Monitoring (paid; overkill for ~1GB)
- [SKIP] Formal SLA / SLO / SLI documentation
- [SKIP] Heavy query profiling / Spark UI deep-dives (on-demand only)

## 8. Performance & Cost

- [KEEP] Photon engine
- [KEEP] Serverless SQL Warehouse (auto-stop, scale-to-zero)
- [KEEP] Cluster right-sizing & autoscaling
- [KEEP] Result caching / disk caching
- [SKIP] Manual broadcast join / AQE tuning (auto-applied)
- [SKIP] Manual predicate pushdown tuning (auto-applied)

## 9. Semantic / Serving Layer

- [KEEP] Databricks SQL Warehouse (replaces Supabase as query layer)
- [KEEP] Materialized Views & Streaming Tables (Gold layer serving)
- [KEEP] Databricks Apps (could host the FastAPI dashboard backend)
- [KEEP] Genie Spaces (natural-language Q&A on portfolio analytics)
- [SKIP] Lakebase (OLTP/Postgres) — SQL Warehouse + caching is enough
- [SKIP] Online Tables / Feature Serving — only if shipping real-time ML

## 10. ML / AI

- [KEEP] Feature Store (formalize the existing `ml_training_data`)
- [KEEP] MLflow (tracking + model registry)
- [KEEP] Model Serving (endpoint for recommender, called from frontend)
- [KEEP] AI/BI Dashboards (optionally replace Dashboard3)

---

## Notes

- This file is a study reference, not a contract. Re-classify items as the migration scope evolves.
- Cross-reference: data flow audit lives in conversation context; produce a target-architecture diagram before implementation.
