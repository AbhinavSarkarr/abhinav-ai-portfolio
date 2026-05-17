"""
Analytics API — FastAPI backend for the Portfolio Analytics Dashboard.

Phase 4b: now queries Databricks SQL Warehouse (Unity Catalog `portfolio_dev`)
directly, replacing the previous Supabase/Postgres backend. The Bronze →
Silver → Gold DLT pipelines write the underlying tables daily.

Tables referenced
─────────────────
  Silver:  portfolio_dev.silver.sessions
  Gold:    portfolio_dev.gold.{
             daily_metrics, traffic_daily_stats, conversion_funnel,
             project_daily_stats, section_daily_stats, skill_daily_stats,
             domain_daily_stats, experience_daily_stats,
             visitor_insights, recommendation_performance
           }

Environment variables (set in Render dashboard, NOT committed)
──────────────────────────────────────────────────────────────
  DATABRICKS_SERVER_HOSTNAME  e.g. dbc-7de4dd77-18aa.cloud.databricks.com
  DATABRICKS_HTTP_PATH        e.g. /sql/1.0/warehouses/13c9f508d69108bf
  DATABRICKS_TOKEN            Personal access token (or service-principal token)
  CATALOG                     default: portfolio_dev
  SILVER_SCHEMA               default: silver
  GOLD_SCHEMA                 default: gold
"""

import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

from databricks import sql
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).parent / ".env")

# ---------------------------------------------------------------------------
# Databricks SQL Warehouse connection config
# ---------------------------------------------------------------------------

DBSQL_CONFIG = {
    "server_hostname": os.getenv("DATABRICKS_SERVER_HOSTNAME"),
    "http_path":       os.getenv("DATABRICKS_HTTP_PATH"),
    "access_token":    os.getenv("DATABRICKS_TOKEN"),
}

CATALOG       = os.getenv("CATALOG",       "portfolio_dev")
SILVER_SCHEMA = os.getenv("SILVER_SCHEMA", "silver")
GOLD_SCHEMA   = os.getenv("GOLD_SCHEMA",   "gold")

SILVER = f"{CATALOG}.{SILVER_SCHEMA}"
GOLD   = f"{CATALOG}.{GOLD_SCHEMA}"


def get_dbsql_connection():
    """Open a fresh Databricks SQL Warehouse connection.
    The connector is not designed for connection pooling across threads;
    per-query connections are the supported pattern. Connection setup is
    ~100-300ms (HTTP handshake), negligible vs the parallel-query speedup."""
    missing = [k for k, v in DBSQL_CONFIG.items() if not v]
    if missing:
        raise RuntimeError(
            f"Missing Databricks env vars: {', '.join(missing)}. "
            "Set DATABRICKS_SERVER_HOSTNAME, DATABRICKS_HTTP_PATH, DATABRICKS_TOKEN."
        )
    return sql.connect(**DBSQL_CONFIG)


def _to_python(v):
    """Recursively convert Databricks SQL connector return types into
    plain JSON-serializable Python objects.

    The databricks-sql-connector returns:
      - Python primitives for scalar columns
      - `decimal.Decimal` for ROUND() results
      - `numpy.ndarray` for ARRAY<...> columns (e.g.
        `recommendation_performance.top_performing_recommendations`,
        whose elements are already plain `dict`)
      - `datetime` for TIMESTAMP columns

    FastAPI's `jsonable_encoder` doesn't natively handle ndarray /
    Decimal, hence this helper.
    """
    if v is None or isinstance(v, (str, int, float, bool)):
        return v
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    # numpy arrays + numpy scalar types — .tolist() returns plain Python.
    if hasattr(v, "tolist") and not isinstance(v, (list, tuple, dict, str)):
        return _to_python(v.tolist())
    if isinstance(v, dict):
        return {k: _to_python(vv) for k, vv in v.items()}
    if isinstance(v, (list, tuple)):
        return [_to_python(x) for x in v]
    # Decimal — duck-typed (has `as_tuple` method).
    if hasattr(v, "as_tuple"):
        return float(v)
    return v


def run_dbsql_query(query: str, params: tuple | list | None = None) -> list[dict]:
    """Run a query, return list of plain JSON-serializable dicts."""
    with get_dbsql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params or [])
            cols = [c[0] for c in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            return [{cols[i]: _to_python(row[i]) for i in range(len(cols))} for row in rows]


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Portfolio Analytics API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 18 queries fan out in parallel. 10 concurrent connections is comfortable
# on a 2X-Small Databricks Serverless Warehouse.
dbsql_executor = ThreadPoolExecutor(max_workers=10)


def parse_date(d: Optional[str]) -> Optional[date]:
    if not d:
        return None
    return datetime.strptime(d, "%Y-%m-%d").date()


def get_date_filter(start_date: Optional[str], end_date: Optional[str]) -> tuple[date, date]:
    """Default to last-7-days when not specified."""
    end = parse_date(end_date) or (date.today() - timedelta(days=1))
    start = parse_date(start_date) or (end - timedelta(days=6))
    return start, end


# ---------------------------------------------------------------------------
# /api/dashboard3 — main endpoint
# ---------------------------------------------------------------------------


@app.get("/api/dashboard3")
async def get_dashboard3_data(
    start_date: Optional[str] = Query(None),
    end_date:   Optional[str] = Query(None),
):
    """Returns the full dashboard payload for a date range.

    Same response schema as the previous Supabase-backed version, so the
    React `useDashboardData.ts` consumes it unchanged. Custom date ranges
    that don't match the 5 pre-computed Gist snapshots route through here.
    """
    start, end = get_date_filter(start_date, end_date)
    s, e = start, end  # Databricks SQL connector accepts python date objects

    # SQL dialect notes (Postgres → Databricks SQL):
    #   ::numeric / ::int casts             → dropped (ROUND() works directly)
    #   PERCENTILE_CONT(p) WITHIN GROUP ...  → percentile(col, p)
    #   MODE() WITHIN GROUP (ORDER BY x)     → mode(x)
    #   COUNT(*) FILTER (WHERE x)            → count_if(x)
    #   MAX(date) - MIN(date) (interval)     → datediff(MAX(date), MIN(date))
    #   %s placeholders                      → ? placeholders
    queries = {
        # -------------------------------------------------------------------
        "overview": ("""
            SELECT
              COUNT(DISTINCT session_id)                                                  AS total_sessions,
              COUNT(DISTINCT user_pseudo_id)                                              AS unique_visitors,
              ROUND(AVG(session_duration_seconds), 0)                                     AS avg_session_duration,
              ROUND(AVG(page_views), 1)                                                   AS avg_pages_per_session,
              ROUND(COUNT(DISTINCT CASE WHEN is_bounce  THEN session_id END) * 100.0 /
                    NULLIF(COUNT(DISTINCT session_id), 0), 2)                             AS bounce_rate,
              ROUND(COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END) * 100.0 /
                    NULLIF(COUNT(DISTINCT session_id), 0), 2)                             AS engagement_rate,
              ROUND(AVG(engagement_score), 2)                                             AS avg_engagement_score
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ?
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "daily_metrics": ("""
            SELECT session_date AS date, total_sessions AS sessions, unique_visitors AS visitors,
                   engagement_rate, bounce_rate, avg_session_duration_sec AS avg_duration,
                   desktop_sessions, mobile_sessions, tablet_sessions
            FROM   {GOLD}.daily_metrics
            WHERE  session_date BETWEEN ? AND ?
            ORDER BY session_date
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        # NOTE: dropped the legacy `traffic` query from gold.traffic_daily_stats.
        # The original wasn't consumed by the response (overshadowed by
        # `traffic_sources_summary` which reads from Silver) and Spark
        # rejects `SUM(sessions) AS sessions` aliasing onto the source
        # column name. We keep one source of truth.
        # -------------------------------------------------------------------
        "conversion_summary": ("""
            SELECT
              SUM(total_cta_views)          AS cta_views,
              SUM(total_cta_clicks)         AS cta_clicks,
              SUM(contact_form_starts)      AS form_starts,
              SUM(contact_form_submissions) AS form_submissions,
              SUM(resume_downloads)         AS resume_downloads,
              SUM(social_clicks)            AS social_clicks,
              SUM(outbound_clicks)          AS outbound_clicks,
              SUM(publication_clicks)       AS publication_clicks,
              SUM(content_copies)           AS content_copies
            FROM  {GOLD}.conversion_funnel
            WHERE event_date BETWEEN ? AND ?
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "project_rankings": ("""
            WITH aggregated AS (
              SELECT
                project_id,
                MAX(project_title)        AS project_title,
                MAX(project_category)     AS project_category,
                SUM(COALESCE(views, 0))           AS total_views,
                SUM(COALESCE(unique_viewers, 0))  AS total_unique_viewers,
                SUM(COALESCE(clicks, 0))          AS total_clicks,
                SUM(COALESCE(expands, 0))         AS total_expands,
                SUM(COALESCE(link_clicks, 0))     AS total_link_clicks,
                SUM(COALESCE(github_clicks, 0))   AS total_github_clicks,
                SUM(COALESCE(demo_clicks, 0))     AS total_demo_clicks,
                (SUM(COALESCE(clicks, 0)) * 5 + SUM(COALESCE(expands, 0)) * 3 +
                 SUM(COALESCE(link_clicks, 0)) * 4 + SUM(COALESCE(views, 0)) * 1) AS engagement_score
              FROM  {GOLD}.project_daily_stats
              WHERE event_date BETWEEN ? AND ?
              GROUP BY project_id
            ),
            ranked AS (
              SELECT *,
                ROW_NUMBER() OVER (ORDER BY engagement_score DESC) AS overall_rank,
                CASE
                  WHEN engagement_score >= (SELECT percentile(engagement_score, 0.75) FROM aggregated) THEN 'top_performer'
                  WHEN engagement_score >= (SELECT percentile(engagement_score, 0.5)  FROM aggregated) THEN 'above_average'
                  ELSE 'below_average'
                END AS performance_tier,
                ROUND(PERCENT_RANK() OVER (ORDER BY engagement_score) * 100, 1) AS engagement_percentile
              FROM aggregated
            )
            SELECT project_id, project_title, project_category, total_views, total_unique_viewers,
                   total_clicks, total_expands, total_link_clicks, total_github_clicks, total_demo_clicks,
                   engagement_score,
                   CAST(overall_rank AS INT) AS overall_rank,
                   performance_tier,
                   CASE WHEN overall_rank <= 3 THEN 'featured' ELSE 'standard' END AS recommended_position,
                   engagement_percentile
            FROM   ranked
            ORDER  BY overall_rank
            LIMIT 10
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "section_rankings": ("""
            WITH aggregated AS (
              SELECT
                section_id,
                SUM(COALESCE(unique_views, 0))   AS total_unique_views,
                SUM(COALESCE(unique_exits, 0))   AS total_unique_exits,
                SUM(COALESCE(unique_viewers, 0)) AS total_unique_viewers,
                ROUND(AVG(unique_exit_rate), 2)  AS avg_exit_rate,
                SUM(COALESCE(total_views, 0))    AS total_views,
                SUM(COALESCE(total_exits, 0))    AS total_exits,
                ROUND(AVG(total_exit_rate), 2)   AS avg_total_exit_rate,
                ROUND(AVG(avg_revisits_per_session), 2) AS avg_revisits_per_session,
                SUM(COALESCE(engaged_sessions, 0))  AS total_engaged_views,
                ROUND(AVG(engagement_rate), 2)      AS avg_engagement_rate,
                ROUND(AVG(avg_time_spent_seconds), 2) AS avg_time_spent_seconds,
                ROUND(AVG(avg_scroll_depth_percent), 2) AS avg_scroll_depth_percent,
                MAX(max_scroll_milestone) AS max_scroll_milestone,
                (COALESCE(AVG(engagement_rate), 0) * 2 +
                 (100 - COALESCE(AVG(unique_exit_rate), 100)) +
                 LEAST(COALESCE(AVG(avg_time_spent_seconds), 0), 100) +
                 COALESCE(AVG(avg_scroll_depth_percent), 0)) AS health_score
              FROM  {GOLD}.section_daily_stats
              WHERE event_date BETWEEN ? AND ?
              GROUP BY section_id
            ),
            ranked AS (
              SELECT *,
                ROW_NUMBER() OVER (ORDER BY avg_engagement_rate DESC) AS engagement_rank,
                ROW_NUMBER() OVER (ORDER BY total_views          DESC) AS view_rank,
                ROW_NUMBER() OVER (ORDER BY avg_exit_rate         ASC ) AS retention_rank,
                CASE
                  WHEN health_score >= 300 THEN 'excellent'
                  WHEN health_score >= 150 THEN 'good'
                  WHEN health_score >= 50  THEN 'needs_attention'
                  ELSE 'critical'
                END AS health_tier,
                CASE
                  WHEN avg_exit_rate >= 90 THEN 'high_dropoff'
                  WHEN avg_exit_rate >= 70 THEN 'moderate_dropoff'
                  ELSE 'low_dropoff'
                END AS dropoff_indicator,
                CASE
                  WHEN avg_engagement_rate < 20 THEN 'improve_content'
                  WHEN avg_exit_rate > 85       THEN 'add_cta_or_navigation'
                  ELSE 'maintain'
                END AS optimization_hint
              FROM aggregated
            )
            SELECT section_id, total_unique_views, total_unique_exits, total_unique_viewers,
                   avg_exit_rate, total_views, total_exits, avg_total_exit_rate,
                   avg_revisits_per_session, total_engaged_views, avg_engagement_rate,
                   avg_time_spent_seconds, avg_scroll_depth_percent, max_scroll_milestone,
                   ROUND(health_score, 2) AS health_score,
                   CAST(engagement_rank AS INT) AS engagement_rank,
                   CAST(view_rank       AS INT) AS view_rank,
                   CAST(retention_rank  AS INT) AS retention_rank,
                   health_tier, dropoff_indicator, optimization_hint
            FROM   ranked
            ORDER  BY health_score DESC
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "visitor_segments": ("""
            WITH visitor_stats AS (
              SELECT
                user_pseudo_id,
                COUNT(DISTINCT session_id) AS total_sessions,
                SUM(page_views)            AS total_page_views,
                ROUND(AVG(session_duration_seconds), 2) AS avg_duration,
                ROUND(COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END) * 100.0 /
                      NULLIF(COUNT(DISTINCT session_id), 0), 2) AS engagement_rate,
                SUM(conversions_count)     AS total_conversions,
                datediff(MAX(session_date), MIN(session_date)) AS tenure_days,
                (COUNT(DISTINCT session_id) * 2 + SUM(page_views) + SUM(conversions_count) * 20) AS value_score
              FROM   {SILVER}.sessions
              WHERE  session_date BETWEEN ? AND ?
              GROUP  BY user_pseudo_id
            ),
            segmented AS (
              SELECT *,
                CASE
                  WHEN total_conversions > 0                            THEN 'converter'
                  WHEN total_sessions >= 3 AND engagement_rate >= 80    THEN 'engaged_explorer'
                  WHEN total_sessions >= 2                              THEN 'returning_visitor'
                  WHEN engagement_rate >= 50                            THEN 'engaged_new'
                  ELSE 'casual_browser'
                END AS visitor_segment
              FROM visitor_stats
            )
            SELECT visitor_segment, COUNT(*) AS count,
                   ROUND(AVG(value_score), 2)     AS avg_value_score,
                   ROUND(AVG(total_sessions), 2)   AS avg_sessions,
                   ROUND(AVG(engagement_rate), 2)  AS avg_engagement_rate
            FROM   segmented
            GROUP  BY visitor_segment
            ORDER  BY count DESC
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "top_visitors": ("""
            WITH visitor_stats AS (
              SELECT
                s.user_pseudo_id,
                COUNT(DISTINCT s.session_id) AS total_sessions,
                datediff(MAX(s.session_date), MIN(s.session_date)) AS visitor_tenure_days,
                SUM(s.page_views)            AS total_page_views,
                ROUND(AVG(s.session_duration_seconds), 2) AS avg_session_duration_sec,
                ROUND(COUNT(DISTINCT CASE WHEN s.is_engaged THEN s.session_id END) * 100.0 /
                      NULLIF(COUNT(DISTINCT s.session_id), 0), 2) AS engagement_rate,
                mode(s.device_category)      AS primary_device,
                mode(s.country)              AS primary_country,
                mode(s.traffic_source)       AS primary_traffic_source,
                SUM(s.projects_clicked_count) AS projects_viewed,
                COALESCE(MAX(vi.cta_clicks), 0)         AS cta_clicks,
                COALESCE(MAX(vi.form_submissions), 0)   AS form_submissions,
                COALESCE(MAX(vi.social_clicks), 0)      AS social_clicks,
                COALESCE(MAX(vi.resume_downloads), 0)   AS resume_downloads,
                (COUNT(DISTINCT s.session_id) * 2 + SUM(s.page_views) + SUM(s.conversions_count) * 20) AS visitor_value_score,
                CASE
                  WHEN COALESCE(MAX(vi.form_submissions), 0) > 0
                    OR COALESCE(MAX(vi.resume_downloads), 0) > 0 THEN 'converter'
                  WHEN COUNT(DISTINCT s.session_id) >= 3
                    AND COUNT(DISTINCT CASE WHEN s.is_engaged THEN s.session_id END) * 100.0 /
                        NULLIF(COUNT(DISTINCT s.session_id), 0) >= 80 THEN 'engaged_explorer'
                  WHEN COUNT(DISTINCT s.session_id) >= 2 THEN 'returning_visitor'
                  WHEN COUNT(DISTINCT CASE WHEN s.is_engaged THEN s.session_id END) * 100.0 /
                       NULLIF(COUNT(DISTINCT s.session_id), 0) >= 50 THEN 'engaged_new'
                  ELSE 'casual_browser'
                END AS visitor_segment,
                'general_visitor' AS interest_profile
              FROM   {SILVER}.sessions s
              LEFT JOIN {GOLD}.visitor_insights vi ON s.user_pseudo_id = vi.user_pseudo_id
              WHERE  s.session_date BETWEEN ? AND ?
              GROUP  BY s.user_pseudo_id
            )
            SELECT user_pseudo_id, total_sessions, visitor_tenure_days, total_page_views,
                   avg_session_duration_sec, engagement_rate, primary_device, primary_country,
                   primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
                   social_clicks, resume_downloads, visitor_value_score, visitor_segment, interest_profile
            FROM   visitor_stats
            ORDER  BY visitor_value_score DESC
            LIMIT 15
        """.format(SILVER=SILVER, GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "tech_demand": ("""
            WITH aggregated AS (
              SELECT
                skill_name,
                SUM(COALESCE(clicks, 0) + COALESCE(hovers, 0)) AS total_interactions,
                SUM(COALESCE(unique_users, 0))                 AS total_unique_users,
                SUM(COALESCE(weighted_interest_score, 0))      AS weighted_score
              FROM  {GOLD}.skill_daily_stats
              WHERE event_date BETWEEN ? AND ?
              GROUP BY skill_name
            ),
            ranked AS (
              SELECT *,
                ROW_NUMBER() OVER (ORDER BY weighted_score DESC) AS demand_rank,
                ROUND(PERCENT_RANK() OVER (ORDER BY weighted_score) * 100, 1) AS demand_percentile,
                CASE
                  WHEN weighted_score >= (SELECT percentile(weighted_score, 0.75) FROM aggregated) THEN 'high_demand'
                  WHEN weighted_score >= (SELECT percentile(weighted_score, 0.25) FROM aggregated) THEN 'moderate_demand'
                  ELSE 'low_demand'
                END AS demand_tier,
                CASE
                  WHEN weighted_score >= (SELECT percentile(weighted_score, 0.75) FROM aggregated) THEN 'master_this'
                  WHEN weighted_score >= (SELECT percentile(weighted_score, 0.5)  FROM aggregated) THEN 'strengthen'
                  ELSE 'maintain'
                END AS learning_priority
              FROM aggregated
              WHERE weighted_score > 0
            )
            SELECT skill_name, total_interactions, total_unique_users,
                   CAST(demand_rank AS INT) AS demand_rank,
                   demand_percentile, demand_tier, learning_priority
            FROM   ranked
            ORDER  BY demand_rank
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "domain_rankings": ("""
            WITH aggregated AS (
              SELECT
                domain,
                SUM(COALESCE(explicit_interest_signals, 0))    AS total_explicit_interest,
                SUM(COALESCE(implicit_interest_from_views, 0)) AS total_implicit_interest,
                SUM(COALESCE(total_domain_interactions, 0))    AS total_interactions,
                SUM(COALESCE(unique_interested_users, 0))      AS total_unique_users,
                SUM(COALESCE(domain_interest_score, 0))        AS total_interest_score
              FROM  {GOLD}.domain_daily_stats
              WHERE event_date BETWEEN ? AND ?
              GROUP BY domain
            ),
            ranked AS (
              SELECT *,
                ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS interest_rank,
                ROUND(PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100, 1) AS interest_percentile,
                CASE
                  WHEN total_interest_score >= (SELECT percentile(total_interest_score, 0.75) FROM aggregated) THEN 'high_demand'
                  WHEN total_interest_score >= (SELECT percentile(total_interest_score, 0.25) FROM aggregated) THEN 'moderate_demand'
                  ELSE 'low_demand'
                END AS demand_tier,
                CASE
                  WHEN total_interest_score >= (SELECT percentile(total_interest_score, 0.75) FROM aggregated) THEN 'primary_strength'
                  WHEN total_interest_score >= (SELECT percentile(total_interest_score, 0.5)  FROM aggregated) THEN 'secondary_strength'
                  ELSE 'explore_opportunities'
                END AS portfolio_recommendation
              FROM aggregated
              WHERE total_interactions > 0
            )
            SELECT domain, total_explicit_interest, total_implicit_interest, total_interactions,
                   total_unique_users, total_interest_score,
                   CAST(interest_rank AS INT) AS interest_rank,
                   interest_percentile, demand_tier, portfolio_recommendation
            FROM   ranked
            ORDER  BY interest_rank
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "experience_rankings": ("""
            WITH aggregated AS (
              SELECT
                experience_id,
                MAX(experience_title) AS experience_title,
                MAX(company)          AS company,
                SUM(COALESCE(total_interactions, 0))   AS total_interactions,
                SUM(COALESCE(unique_interested_users, 0)) AS total_unique_users,
                SUM(COALESCE(unique_sessions, 0))      AS total_sessions
              FROM  {GOLD}.experience_daily_stats
              WHERE event_date BETWEEN ? AND ?
              GROUP BY experience_id
            ),
            ranked AS (
              SELECT *,
                ROW_NUMBER() OVER (ORDER BY total_interactions DESC) AS interest_rank,
                ROUND(PERCENT_RANK() OVER (ORDER BY total_interactions) * 100, 1) AS interest_percentile,
                CASE
                  WHEN total_interactions >= (SELECT percentile(total_interactions, 0.75) FROM aggregated) THEN 'most_attractive_role'
                  WHEN total_interactions >= (SELECT percentile(total_interactions, 0.25) FROM aggregated) THEN 'moderately_attractive'
                  ELSE 'needs_highlighting'
                END AS role_attractiveness,
                CASE
                  WHEN total_interactions >= (SELECT percentile(total_interactions, 0.75) FROM aggregated) THEN 'lead_with_this'
                  WHEN total_interactions >= (SELECT percentile(total_interactions, 0.5)  FROM aggregated) THEN 'feature_prominently'
                  ELSE 'include_for_completeness'
                END AS positioning_suggestion
              FROM aggregated
              WHERE total_interactions > 0
            )
            SELECT experience_id, experience_title, company, total_interactions, total_unique_users,
                   total_sessions,
                   CAST(interest_rank AS INT) AS interest_rank,
                   interest_percentile, role_attractiveness, positioning_suggestion
            FROM   ranked
            ORDER  BY interest_rank
        """.format(GOLD=GOLD), [s, e]),

        # -------------------------------------------------------------------
        "recommendation_performance": (f"""
            SELECT * FROM {GOLD}.recommendation_performance LIMIT 1
        """, None),

        # -------------------------------------------------------------------
        "temporal_hourly": ("""
            SELECT hour_of_day AS hour, COUNT(*) AS sessions,
                   COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
                   ROUND(AVG(engagement_score), 2) AS avg_engagement,
                   ROUND(count_if(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ? AND hour_of_day IS NOT NULL
            GROUP  BY hour_of_day
            ORDER  BY hour_of_day
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "temporal_dow": ("""
            SELECT
              CASE session_day_of_week
                WHEN 1 THEN 'Sunday' WHEN 2 THEN 'Monday' WHEN 3 THEN 'Tuesday'
                WHEN 4 THEN 'Wednesday' WHEN 5 THEN 'Thursday' WHEN 6 THEN 'Friday'
                WHEN 7 THEN 'Saturday'
              END AS day_name,
              session_day_of_week AS day_number,
              COUNT(*) AS sessions,
              COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
              ROUND(AVG(engagement_score), 2) AS avg_engagement,
              ROUND(count_if(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ?
            GROUP  BY session_day_of_week
            ORDER  BY session_day_of_week
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "devices": ("""
            SELECT device_category, COUNT(*) AS sessions,
                   COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
                   ROUND(count_if(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
                   ROUND(AVG(session_duration_seconds), 0) AS avg_duration
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ?
            GROUP  BY device_category
            ORDER  BY sessions DESC
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "browsers": ("""
            SELECT COALESCE(browser, 'Unknown') AS browser, COUNT(*) AS sessions,
                   COUNT(DISTINCT user_pseudo_id) AS unique_visitors
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ?
            GROUP  BY browser
            ORDER  BY sessions DESC
            LIMIT 10
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "operating_systems": ("""
            SELECT COALESCE(os, 'Unknown') AS operating_system, COUNT(*) AS sessions,
                   COUNT(DISTINCT user_pseudo_id) AS unique_visitors
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ?
            GROUP  BY os
            ORDER  BY sessions DESC
            LIMIT 10
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "geographic": ("""
            SELECT country, city, COUNT(*) AS sessions,
                   COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
                   ROUND(count_if(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate
            FROM   {SILVER}.sessions
            WHERE  session_date BETWEEN ? AND ?
            GROUP  BY country, city
            ORDER  BY sessions DESC
            LIMIT 20
        """.format(SILVER=SILVER), [s, e]),

        # -------------------------------------------------------------------
        "traffic_sources_summary": ("""
            SELECT s.traffic_source, s.traffic_medium,
                   COUNT(DISTINCT s.session_id)    AS sessions,
                   COUNT(DISTINCT s.user_pseudo_id) AS unique_visitors,
                   ROUND(COUNT(DISTINCT CASE WHEN s.is_engaged THEN s.session_id END) * 100.0 /
                         NULLIF(COUNT(DISTINCT s.session_id), 0), 2) AS engagement_rate,
                   ROUND(COUNT(DISTINCT CASE WHEN s.is_bounce  THEN s.session_id END) * 100.0 /
                         NULLIF(COUNT(DISTINCT s.session_id), 0), 2) AS bounce_rate,
                   ROUND(AVG(s.session_duration_seconds), 0) AS avg_duration,
                   COUNT(DISTINCT CASE WHEN vi.form_submissions > 0 THEN s.user_pseudo_id END) AS conversions,
                   COUNT(DISTINCT CASE WHEN vi.resume_downloads > 0 THEN s.user_pseudo_id END) AS resume_downloads
            FROM   {SILVER}.sessions s
            LEFT JOIN {GOLD}.visitor_insights vi ON s.user_pseudo_id = vi.user_pseudo_id
            WHERE  s.session_date BETWEEN ? AND ?
            GROUP  BY s.traffic_source, s.traffic_medium
            ORDER  BY sessions DESC
            LIMIT 10
        """.format(SILVER=SILVER, GOLD=GOLD), [s, e]),
    }

    try:
        loop = asyncio.get_event_loop()

        async def run_query_async(name: str, query: str, params):
            result = await loop.run_in_executor(
                dbsql_executor, lambda: run_dbsql_query(query, params)
            )
            return (name, result)

        tasks = [run_query_async(name, q[0], q[1]) for name, q in queries.items()]
        results = await asyncio.gather(*tasks)
        data = {name: result for name, result in results}

        # Ensure all 7 days are present in temporal_dow, even with zero values.
        all_days = [(1, 'Sunday'), (2, 'Monday'), (3, 'Tuesday'), (4, 'Wednesday'),
                    (5, 'Thursday'), (6, 'Friday'), (7, 'Saturday')]
        dow_raw = {row['day_number']: row for row in data.get("temporal_dow", [])}
        data["temporal_dow"] = [
            dow_raw.get(num, {
                'day_name': name, 'day_number': num, 'sessions': 0,
                'unique_visitors': 0, 'avg_engagement': 0, 'engagement_rate': 0
            })
            for num, name in all_days
        ]

        overview = data["overview"][0] if data["overview"] else {}

        visitor_segments = {
            seg["visitor_segment"]: {
                "count": seg["count"],
                "avg_value_score":    float(seg["avg_value_score"] or 0),
                "avg_sessions":       float(seg["avg_sessions"] or 0),
                "avg_engagement_rate": float(seg["avg_engagement_rate"] or 0),
            }
            for seg in data.get("visitor_segments", [])
        }

        conv = data.get("conversion_summary", [{}])[0] if data.get("conversion_summary") else {}
        conversion_summary = {
            "cta_views":          int(conv.get("cta_views") or 0),
            "cta_clicks":         int(conv.get("cta_clicks") or 0),
            "form_starts":        int(conv.get("form_starts") or 0),
            "form_submissions":   int(conv.get("form_submissions") or 0),
            "resume_downloads":   int(conv.get("resume_downloads") or 0),
            "social_clicks":      int(conv.get("social_clicks") or 0),
            "outbound_clicks":    int(conv.get("outbound_clicks") or 0),
            "publication_clicks": int(conv.get("publication_clicks") or 0),
            "content_copies":     int(conv.get("content_copies") or 0),
        }
        total_conversions = conversion_summary["form_submissions"] + conversion_summary["resume_downloads"]

        return {
            "overview": {
                "totalSessions":      overview.get("total_sessions", 0),
                "uniqueVisitors":     overview.get("unique_visitors", 0),
                "avgSessionDuration": float(overview.get("avg_session_duration") or 0),
                "avgPagesPerSession": float(overview.get("avg_pages_per_session") or 0),
                "bounceRate":         float(overview.get("bounce_rate") or 0),
                "engagementRate":     float(overview.get("engagement_rate") or 0),
                "avgEngagementScore": float(overview.get("avg_engagement_score") or 0),
                "totalConversions":   total_conversions,
            },
            "dailyMetrics":             data["daily_metrics"],
            "trafficSources":           data["traffic_sources_summary"],
            "conversionSummary":        conversion_summary,
            "projectRankings":          data["project_rankings"],
            "sectionRankings":          data["section_rankings"],
            "visitorSegments":          visitor_segments,
            "topVisitors":              data["top_visitors"],
            "techDemand":               data["tech_demand"],
            "domainRankings":           data["domain_rankings"],
            "experienceRankings":       data["experience_rankings"],
            "recommendationPerformance": data["recommendation_performance"],
            "temporal": {
                "hourlyDistribution":  data["temporal_hourly"],
                "dayOfWeekDistribution": data["temporal_dow"],
            },
            "devices": {
                "categories":         data["devices"],
                "browsers":           data["browsers"],
                "operatingSystems":   data["operating_systems"],
            },
            "geographic":              data["geographic"],
            "dateRange":               {"start": str(start), "end": str(end)},
            "source":                  "databricks",
            "updated_at":              datetime.utcnow().isoformat() + "Z",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# /api/sync-status — legacy compatibility shim
# ---------------------------------------------------------------------------


@app.get("/api/sync-status")
async def get_sync_status():
    """Legacy endpoint: the old Supabase `sync_metadata` table is gone.
    Source-of-truth for Databricks-side freshness is the daily Workflow
    in `databricks/resources/jobs.yml`. We expose a stubbed response so
    older clients don't break."""
    return {
        "syncStatus": [{
            "table_name": "all_gold_tables",
            "last_synced_at": None,
            "rows_synced": None,
            "sync_duration_seconds": None,
            "status": "managed_by_databricks_workflow",
            "note": "Refresh cadence: daily 02:00 UTC via the bronze_ga4_daily_sync workflow.",
        }],
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }


# ---------------------------------------------------------------------------
# /health — pinged every 14 min by .github/workflows/keep-render-warm.yml
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check():
    """Lightweight check.

    We deliberately DO NOT hit the SQL Warehouse here — that would wake it
    from auto-stop every 14 minutes and burn Free Edition credits. The
    point of /health is to keep Render warm, not the warehouse.
    """
    return {
        "status": "healthy",
        "database": "databricks_sql_warehouse (not pinged from /health)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/")
async def root():
    return {
        "name":        "Portfolio Analytics API",
        "version":     "4.0.0",
        "description": "Queries Databricks SQL Warehouse (Unity Catalog `portfolio_dev`). Daily refresh at 02:00 UTC via the Databricks Workflow.",
        "database":    "Databricks SQL Warehouse (serverless)",
        "tables": [
            f"{SILVER}.sessions",
            f"{GOLD}.daily_metrics", f"{GOLD}.traffic_daily_stats", f"{GOLD}.conversion_funnel",
            f"{GOLD}.project_daily_stats", f"{GOLD}.section_daily_stats",
            f"{GOLD}.skill_daily_stats", f"{GOLD}.domain_daily_stats",
            f"{GOLD}.experience_daily_stats", f"{GOLD}.visitor_insights",
            f"{GOLD}.recommendation_performance",
        ],
        "endpoints": {
            "main":        "/api/dashboard3",
            "sync_status": "/api/sync-status",
            "health":      "/health",
        },
        "data_refresh": "Daily at 02:00 UTC via Databricks Workflow `bronze_ga4_daily_sync` (Bronze → Silver → Gold → Gist snapshot).",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
