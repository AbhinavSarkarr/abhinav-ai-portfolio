#!/usr/bin/env bash
# Portfolio Analytics — one-shot Databricks bundle deploy.
#
# Usage:
#   ./deploy.sh <profile> [target]
#     profile : Databricks CLI profile name (from ~/.databrickscfg)
#     target  : Bundle target — dev (default) or prod
#
# Examples:
#   ./deploy.sh abhinav-personal
#   ./deploy.sh abhinav-personal prod
#
# What it does:
#   1. Verifies the CLI profile is valid.
#   2. Ensures the target Unity Catalog catalog exists (CREATE IF NOT EXISTS).
#   3. Ensures the secret scope + GCP service account secret exist; prompts if missing.
#   4. Runs `databricks bundle validate` then `databricks bundle deploy`.
#
# After a successful deploy, trigger the one-time backfill once:
#   databricks bundle run bronze_ga4_backfill --profile <profile> --target <target>

set -euo pipefail

# Prefer the modern databricks CLI binary (/usr/local/bin) over a possibly
# stale legacy v0.18.x one earlier in $PATH. The legacy binary also prints a
# multi-line "newer version detected" banner that breaks downstream parsing.
export PATH="/usr/local/bin:${PATH}"

# ----- args ------------------------------------------------------------------

PROFILE="${1:-}"
TARGET="${2:-dev}"

if [[ -z "${PROFILE}" ]]; then
  echo "Usage: $0 <profile> [target]"
  exit 1
fi

cd "$(dirname "$0")"

# ----- config (must match defaults in databricks.yml) ------------------------

CATALOG="portfolio_${TARGET}"
SECRET_SCOPE="portfolio"
SECRET_KEY="gcp_sa_json"
# SQL warehouse used only to bootstrap the catalog (Free Edition: catalogs
# must be created via the UI/SQL path because the REST API requires an
# explicit storage_root). Update if the workspace's starter warehouse differs.
BOOTSTRAP_WAREHOUSE_ID="${BOOTSTRAP_WAREHOUSE_ID:-13c9f508d69108bf}"

# ----- helpers ---------------------------------------------------------------

log()  { printf "\033[1;34m[deploy]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]  \033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m[fail]  \033[0m %s\n" "$*"; exit 1; }

dbx() {
  databricks "$@" --profile "${PROFILE}"
}

# ----- 1. profile sanity -----------------------------------------------------

log "Verifying profile '${PROFILE}'..."
dbx auth describe >/dev/null 2>&1 || die "Profile '${PROFILE}' is not valid. Run: databricks auth login --profile ${PROFILE}"

log "Target           : ${TARGET}"
log "Catalog          : ${CATALOG}"
log "Secret scope/key : ${SECRET_SCOPE}/${SECRET_KEY}"

# ----- 2. ensure catalog -----------------------------------------------------

log "Ensuring catalog '${CATALOG}' exists..."
if ! dbx catalogs get "${CATALOG}" >/dev/null 2>&1; then
  log "Creating catalog '${CATALOG}' via SQL warehouse ${BOOTSTRAP_WAREHOUSE_ID}..."
  dbx api post /api/2.0/sql/statements/ --json "{
    \"warehouse_id\": \"${BOOTSTRAP_WAREHOUSE_ID}\",
    \"statement\": \"CREATE CATALOG IF NOT EXISTS ${CATALOG} COMMENT 'Portfolio analytics (${TARGET})'\",
    \"wait_timeout\": \"30s\"
  }" >/dev/null
fi

# ----- 3. ensure secret scope ------------------------------------------------

log "Ensuring secret scope '${SECRET_SCOPE}' exists..."
if ! dbx secrets list-scopes 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "${SECRET_SCOPE}"; then
  log "Creating secret scope '${SECRET_SCOPE}'..."
  dbx secrets create-scope "${SECRET_SCOPE}" >/dev/null
fi

# ----- 4. ensure GCP service account secret ----------------------------------

if ! dbx secrets list-secrets "${SECRET_SCOPE}" 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "${SECRET_KEY}"; then
  warn "GCP service account secret missing: ${SECRET_SCOPE}/${SECRET_KEY}"
  echo
  echo "  Provide a GCP service account JSON with 'BigQuery Data Viewer' + 'BigQuery Job User'"
  echo "  on project portfolio-483605."
  echo
  read -rp "  Path to the JSON key file: " SA_PATH
  [[ ! -f "${SA_PATH}" ]] && die "File not found: ${SA_PATH}"
  log "Uploading secret..."
  dbx secrets put-secret "${SECRET_SCOPE}" "${SECRET_KEY}" --string-value "$(cat "${SA_PATH}")"
fi

# ----- 5. validate + deploy --------------------------------------------------

log "Validating bundle..."
dbx bundle validate --target "${TARGET}"

log "Deploying bundle to target '${TARGET}'..."
dbx bundle deploy --target "${TARGET}"

# ----- 6. next steps ---------------------------------------------------------

cat <<EOF

[deploy] Done.

Next:
  - Run the one-time backfill:
      databricks bundle run bronze_ga4_backfill --profile ${PROFILE} --target ${TARGET}

  - Inspect the result:
      databricks sql query --profile ${PROFILE} \\
        --warehouse-id <wh_id> \\
        --query "SELECT _event_date, COUNT(*) FROM ${CATALOG}.bronze.ga4_events_raw GROUP BY 1 ORDER BY 1"

  - When happy, unpause the daily sync:
      open the job '[${TARGET}] bronze · ga4 daily sync' in the UI -> resume schedule.

EOF
