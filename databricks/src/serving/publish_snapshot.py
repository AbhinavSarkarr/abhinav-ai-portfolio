# Databricks notebook source
# MAGIC %md
# MAGIC # Serving · publish_snapshot
# MAGIC
# MAGIC Composes the dashboard JSON payload from Gold tables and PATCHes it
# MAGIC to the existing GitHub Gist that the portfolio's React dashboard
# MAGIC reads from. Runs once daily after `refresh_gold`.
# MAGIC
# MAGIC The JSON schema **must match** the original
# MAGIC `analytics-backend/supabase/update_dashboard_gist.py` output, because
# MAGIC `src/hooks/useDashboardData.ts` already consumes it. We're just
# MAGIC swapping the producer — Databricks Gold replaces Supabase.
# MAGIC
# MAGIC Top-level structure:
# MAGIC ```
# MAGIC {
# MAGIC   "metadata": { "updated_at", "data_start_date", "data_end_date" },
# MAGIC   "yesterday":     { <full dashboard payload> },
# MAGIC   "last_7_days":   { <full dashboard payload> },
# MAGIC   "last_14_days":  { <full dashboard payload> },
# MAGIC   "last_30_days":  { <full dashboard payload> },
# MAGIC   "all_time":      { <full dashboard payload> }
# MAGIC }
# MAGIC ```
# MAGIC Each per-range payload contains ~16 sections (overview, dailyMetrics,
# MAGIC trafficSources, conversionSummary, projectRankings, sectionRankings,
# MAGIC visitorSegments, topVisitors, techDemand, domainRankings,
# MAGIC experienceRankings, recommendationPerformance, temporal, devices,
# MAGIC geographic, dateRange).

# COMMAND ----------

import json
from datetime import date, datetime, timedelta

import requests

# Job parameters (set in jobs.yml base_parameters; widgets give us local-override
# capability when running ad-hoc).
dbutils.widgets.text("catalog", "portfolio_dev")
dbutils.widgets.text("silver_schema", "silver")
dbutils.widgets.text("gold_schema", "gold")
dbutils.widgets.text("gist_id", "dedbbf6ebcb32542e7b724b86f2b214f")
dbutils.widgets.text("secret_scope", "portfolio")
dbutils.widgets.text("gist_token_key", "github_gist_token")

CATALOG = dbutils.widgets.get("catalog")
SILVER = f"{CATALOG}.{dbutils.widgets.get('silver_schema')}"
GOLD = f"{CATALOG}.{dbutils.widgets.get('gold_schema')}"
GIST_ID = dbutils.widgets.get("gist_id")
SECRET_SCOPE = dbutils.widgets.get("secret_scope")
GIST_TOKEN_KEY = dbutils.widgets.get("gist_token_key")

GIST_TOKEN = dbutils.secrets.get(scope=SECRET_SCOPE, key=GIST_TOKEN_KEY)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Helpers

# COMMAND ----------


def _rows(df) -> list[dict]:
    """Spark DataFrame → list of plain dicts, with date/decimal coerced for JSON."""
    out = []
    for r in df.collect():
        d = r.asDict(recursive=True)
        for k, v in d.items():
            if isinstance(v, (datetime, date)):
                d[k] = v.isoformat()
            elif hasattr(v, "as_tuple"):  # decimal.Decimal
                d[k] = float(v)
        out.append(d)
    return out


def _one(df) -> dict:
    rs = _rows(df)
    return rs[0] if rs else {}


def _json_default(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if hasattr(obj, "as_tuple"):  # Decimal
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


# COMMAND ----------

# MAGIC %md
# MAGIC ## Per-range dashboard payload

# COMMAND ----------


def fetch_dashboard_data(start_date: date, end_date: date) -> dict:
    """Produce the full dashboard payload for a date range. Mirrors the
    schema of the original update_dashboard_gist.py output exactly."""

    start_s = start_date.isoformat()
    end_s = end_date.isoformat()

    # --- overview ---------------------------------------------------------
    overview = _one(spark.sql(f"""
        SELECT
          COUNT(DISTINCT session_id)                                          AS total_sessions,
          COUNT(DISTINCT user_pseudo_id)                                      AS unique_visitors,
          ROUND(AVG(session_duration_seconds), 0)                             AS avg_session_duration,
          ROUND(AVG(page_views), 1)                                           AS avg_pages_per_session,
          ROUND(COUNT(DISTINCT CASE WHEN is_bounce  THEN session_id END) * 100.0 /
                NULLIF(COUNT(DISTINCT session_id), 0), 2)                     AS bounce_rate,
          ROUND(COUNT(DISTINCT CASE WHEN is_engaged THEN session_id END) * 100.0 /
                NULLIF(COUNT(DISTINCT session_id), 0), 2)                     AS engagement_rate,
          ROUND(AVG(engagement_score), 2)                                     AS avg_engagement_score
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
    """))

    # --- daily metrics (used in line chart) ------------------------------
    daily_metrics_rows = _rows(spark.sql(f"""
        SELECT session_date            AS date,
               total_sessions          AS sessions,
               unique_visitors         AS visitors,
               engagement_rate,
               bounce_rate,
               avg_session_duration_sec AS avg_duration,
               desktop_sessions,
               mobile_sessions,
               tablet_sessions
        FROM   {GOLD}.daily_metrics
        WHERE  session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        ORDER BY session_date
    """))

    # --- traffic sources --------------------------------------------------
    traffic_sources = _rows(spark.sql(f"""
        SELECT
          s.traffic_source,
          s.traffic_medium,
          COUNT(DISTINCT s.session_id)        AS sessions,
          COUNT(DISTINCT s.user_pseudo_id)    AS unique_visitors,
          ROUND(COUNT(DISTINCT CASE WHEN s.is_engaged THEN s.session_id END) * 100.0 /
                NULLIF(COUNT(DISTINCT s.session_id), 0), 2) AS engagement_rate,
          ROUND(COUNT(DISTINCT CASE WHEN s.is_bounce  THEN s.session_id END) * 100.0 /
                NULLIF(COUNT(DISTINCT s.session_id), 0), 2) AS bounce_rate,
          ROUND(AVG(s.session_duration_seconds), 0) AS avg_duration,
          COUNT(DISTINCT CASE WHEN vi.form_submissions > 0 THEN s.user_pseudo_id END) AS conversions,
          COUNT(DISTINCT CASE WHEN vi.resume_downloads > 0 THEN s.user_pseudo_id END) AS resume_downloads
        FROM {SILVER}.sessions s
        LEFT JOIN {GOLD}.visitor_insights vi ON s.user_pseudo_id = vi.user_pseudo_id
        WHERE s.session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        GROUP BY s.traffic_source, s.traffic_medium
        ORDER BY sessions DESC
        LIMIT 10
    """))

    # --- conversion summary ----------------------------------------------
    conv_row = _one(spark.sql(f"""
        SELECT
          COALESCE(SUM(total_cta_views), 0)            AS cta_views,
          COALESCE(SUM(total_cta_clicks), 0)           AS cta_clicks,
          COALESCE(SUM(contact_form_starts), 0)        AS form_starts,
          COALESCE(SUM(contact_form_submissions), 0)   AS form_submissions,
          COALESCE(SUM(resume_downloads), 0)           AS resume_downloads,
          COALESCE(SUM(social_clicks), 0)              AS social_clicks,
          COALESCE(SUM(outbound_clicks), 0)            AS outbound_clicks,
          COALESCE(SUM(publication_clicks), 0)         AS publication_clicks,
          COALESCE(SUM(content_copies), 0)             AS content_copies
        FROM {GOLD}.conversion_funnel
        WHERE event_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
    """))

    # --- project rankings (per-range, re-aggregated) ---------------------
    project_rankings = _rows(spark.sql(f"""
        WITH aggregated AS (
          SELECT
            project_id,
            MAX(project_title)                  AS project_title,
            MAX(project_category)               AS project_category,
            SUM(COALESCE(views, 0))             AS total_views,
            SUM(COALESCE(unique_viewers, 0))    AS total_unique_viewers,
            SUM(COALESCE(clicks, 0))            AS total_clicks,
            SUM(COALESCE(expands, 0))           AS total_expands,
            SUM(COALESCE(link_clicks, 0))       AS total_link_clicks,
            SUM(COALESCE(github_clicks, 0))     AS total_github_clicks,
            SUM(COALESCE(demo_clicks, 0))       AS total_demo_clicks,
            (SUM(COALESCE(clicks, 0)) * 5 + SUM(COALESCE(expands, 0)) * 3 +
             SUM(COALESCE(link_clicks, 0)) * 4 + SUM(COALESCE(views, 0)) * 1) AS engagement_score
          FROM {GOLD}.project_daily_stats
          WHERE event_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY project_id
        ),
        ranked AS (
          SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY engagement_score DESC) AS overall_rank,
            CASE
              WHEN engagement_score >= (SELECT percentile(engagement_score, 0.75) FROM aggregated) THEN 'top_performer'
              WHEN engagement_score >= (SELECT percentile(engagement_score, 0.50) FROM aggregated) THEN 'above_average'
              ELSE 'below_average'
            END AS performance_tier,
            ROUND(PERCENT_RANK() OVER (ORDER BY engagement_score) * 100, 1) AS engagement_percentile
          FROM aggregated
        )
        SELECT
          project_id, project_title, project_category,
          total_views, total_unique_viewers, total_clicks, total_expands,
          total_link_clicks, total_github_clicks, total_demo_clicks,
          engagement_score,
          CAST(overall_rank AS INT) AS overall_rank,
          performance_tier,
          CASE WHEN overall_rank <= 3 THEN 'featured' ELSE 'standard' END AS recommended_position,
          engagement_percentile
        FROM ranked
        ORDER BY overall_rank
        LIMIT 10
    """))

    # --- section rankings (per-range, re-aggregated) ---------------------
    section_rankings = _rows(spark.sql(f"""
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
            SUM(COALESCE(engaged_sessions, 0)) AS total_engaged_sessions,
            ROUND(AVG(engagement_rate), 2)     AS avg_engagement_rate,
            ROUND(AVG(avg_time_spent_seconds), 2) AS avg_time_spent_seconds,
            ROUND(AVG(avg_scroll_depth_percent), 2) AS avg_scroll_depth_percent,
            MAX(max_scroll_milestone)        AS max_scroll_milestone
          FROM {GOLD}.section_daily_stats
          WHERE event_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY section_id
        ),
        scored AS (
          SELECT
            *,
            ROUND(
              (1 - COALESCE(avg_exit_rate, 0) / 100.0) * 30 +
              LEAST(COALESCE(avg_time_spent_seconds, 0) / 10.0, 1) * 25 +
              COALESCE(avg_engagement_rate, 0) / 100.0 * 25 +
              COALESCE(avg_scroll_depth_percent, 0) / 100.0 * 20,
              2
            ) AS health_score
          FROM aggregated
        ),
        ranked AS (
          SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY avg_engagement_rate DESC NULLS LAST) AS engagement_rank,
            ROW_NUMBER() OVER (ORDER BY total_views DESC)                     AS view_rank,
            ROW_NUMBER() OVER (ORDER BY avg_exit_rate ASC NULLS LAST)         AS retention_rank,
            CASE
              WHEN health_score >= 60 THEN 'healthy'
              WHEN health_score >= 40 THEN 'needs_attention'
              ELSE 'critical'
            END AS health_tier,
            CASE WHEN avg_exit_rate > 50 THEN 'high_dropoff' ELSE 'normal' END AS dropoff_indicator,
            CASE
              WHEN avg_exit_rate > 70                THEN 'add_cta_or_navigation'
              WHEN avg_time_spent_seconds < 3        THEN 'improve_content'
              WHEN avg_scroll_depth_percent < 50     THEN 'optimize_layout'
              ELSE 'maintain'
            END AS optimization_hint
          FROM scored
        )
        SELECT
          section_id, total_unique_views, total_unique_exits, total_unique_viewers,
          avg_exit_rate, total_views, total_exits, avg_total_exit_rate,
          avg_revisits_per_session, total_engaged_sessions, avg_engagement_rate,
          avg_time_spent_seconds, avg_scroll_depth_percent, max_scroll_milestone,
          health_score,
          CAST(engagement_rank AS INT) AS engagement_rank,
          CAST(view_rank       AS INT) AS view_rank,
          CAST(retention_rank  AS INT) AS retention_rank,
          health_tier, dropoff_indicator, optimization_hint
        FROM ranked
        ORDER BY health_score DESC
    """))

    # --- visitor segments (per-range) -----------------------------------
    visitor_segments_raw = _rows(spark.sql(f"""
        WITH visitor_stats AS (
          SELECT
            user_pseudo_id,
            COUNT(DISTINCT session_id) AS total_sessions,
            SUM(page_views)            AS total_page_views,
            AVG(session_duration_seconds) AS avg_duration,
            AVG(engagement_score)       AS avg_engagement,
            SUM(conversions_count)      AS total_conversions,
            MAX(device_category)        AS primary_device
          FROM {SILVER}.sessions
          WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY user_pseudo_id
        ),
        segmented AS (
          SELECT
            *,
            CASE
              WHEN total_conversions > 0                              THEN 'converter'
              WHEN total_sessions >= 3 AND avg_engagement > 50        THEN 'power_user'
              WHEN total_sessions >= 2                                THEN 'returning'
              WHEN avg_engagement > 30                                THEN 'engaged_new'
              ELSE 'casual'
            END AS visitor_segment
          FROM visitor_stats
        )
        SELECT
          visitor_segment,
          COUNT(*) AS count,
          ROUND(AVG(avg_engagement), 2) AS avg_value_score,
          ROUND(AVG(total_sessions), 2) AS avg_sessions,
          ROUND(AVG(avg_engagement), 2) AS avg_engagement_rate
        FROM segmented
        GROUP BY visitor_segment
        ORDER BY count DESC
    """))
    visitor_segments = {
        seg["visitor_segment"]: {
            "count": seg["count"],
            "avg_value_score": float(seg.get("avg_value_score") or 0),
            "avg_sessions": float(seg.get("avg_sessions") or 0),
            "avg_engagement_rate": float(seg.get("avg_engagement_rate") or 0),
        }
        for seg in visitor_segments_raw
    }

    # --- top visitors (per-range) ----------------------------------------
    top_visitors = _rows(spark.sql(f"""
        WITH visitor_stats AS (
          SELECT
            s.user_pseudo_id,
            COUNT(DISTINCT s.session_id) AS total_sessions,
            MIN(s.session_date)          AS first_visit,
            MAX(s.session_date)          AS last_visit,
            DATEDIFF(MAX(s.session_date), MIN(s.session_date)) AS visitor_tenure_days,
            SUM(s.page_views)            AS total_page_views,
            ROUND(AVG(s.session_duration_seconds), 0) AS avg_session_duration_sec,
            ROUND(COUNT(DISTINCT CASE WHEN s.is_engaged THEN s.session_id END) * 100.0 /
                  NULLIF(COUNT(DISTINCT s.session_id), 0), 2) AS engagement_rate,
            mode(s.device_category)      AS primary_device,
            mode(s.country)              AS primary_country,
            mode(s.traffic_source)       AS primary_traffic_source,
            SUM(s.projects_clicked_count) AS projects_viewed,
            SUM(s.conversions_count)     AS cta_clicks,
            COALESCE(MAX(vi.form_submissions), 0) AS form_submissions,
            COALESCE(MAX(vi.social_clicks), 0)    AS social_clicks,
            COALESCE(MAX(vi.resume_downloads), 0) AS resume_downloads,
            (COUNT(DISTINCT s.session_id) * 10 + SUM(s.page_views) * 2 +
             SUM(s.conversions_count) * 20 + ROUND(AVG(s.engagement_score), 0)) AS visitor_value_score
          FROM {SILVER}.sessions s
          LEFT JOIN {GOLD}.visitor_insights vi ON s.user_pseudo_id = vi.user_pseudo_id
          WHERE s.session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY s.user_pseudo_id
        ),
        segmented AS (
          SELECT
            *,
            CASE
              WHEN form_submissions > 0 OR resume_downloads > 0 THEN 'converter'
              WHEN total_sessions >= 3 THEN 'power_user'
              WHEN total_sessions >= 2 THEN 'returning'
              ELSE 'new'
            END AS visitor_segment,
            'general_visitor' AS interest_profile
          FROM visitor_stats
        )
        SELECT
          user_pseudo_id, total_sessions, visitor_tenure_days, total_page_views,
          avg_session_duration_sec, engagement_rate, primary_device, primary_country,
          primary_traffic_source, projects_viewed, cta_clicks, form_submissions,
          social_clicks, resume_downloads, visitor_value_score,
          visitor_segment, interest_profile
        FROM segmented
        ORDER BY visitor_value_score DESC
        LIMIT 15
    """))

    # --- tech demand (per-range, re-aggregated from skill daily stats) ---
    tech_demand = _rows(spark.sql(f"""
        WITH aggregated AS (
          SELECT
            skill_name,
            SUM(COALESCE(clicks, 0) + COALESCE(hovers, 0))  AS total_interactions,
            SUM(COALESCE(unique_users, 0))                  AS total_unique_users,
            SUM(COALESCE(weighted_interest_score, 0))       AS interest_score
          FROM {GOLD}.skill_daily_stats
          WHERE event_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY skill_name
        ),
        ranked AS (
          SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY interest_score DESC)            AS demand_rank,
            ROUND(PERCENT_RANK() OVER (ORDER BY interest_score) * 100, 1) AS demand_percentile,
            CASE
              WHEN ROW_NUMBER() OVER (ORDER BY interest_score DESC) <= 5  THEN 'high_demand'
              WHEN ROW_NUMBER() OVER (ORDER BY interest_score DESC) <= 15 THEN 'moderate_demand'
              ELSE 'niche'
            END AS demand_tier,
            CASE
              WHEN ROW_NUMBER() OVER (ORDER BY interest_score DESC) <= 5  THEN 'maintain_expertise'
              WHEN ROW_NUMBER() OVER (ORDER BY interest_score DESC) <= 10 THEN 'showcase_more'
              ELSE 'consider_highlighting'
            END AS learning_priority
          FROM aggregated
        )
        SELECT skill_name, total_interactions, total_unique_users,
               CAST(demand_rank AS INT) AS demand_rank,
               demand_percentile, demand_tier, learning_priority
        FROM ranked
        ORDER BY demand_rank
    """))

    # --- domain rankings (per-range) ------------------------------------
    domain_rankings = _rows(spark.sql(f"""
        WITH aggregated AS (
          SELECT
            domain,
            SUM(COALESCE(explicit_interest_signals, 0))    AS total_explicit_interest,
            SUM(COALESCE(implicit_interest_from_views, 0)) AS total_implicit_interest,
            SUM(COALESCE(total_domain_interactions, 0))    AS total_interactions,
            SUM(COALESCE(unique_interested_users, 0))      AS total_unique_users,
            SUM(COALESCE(domain_interest_score, 0))        AS total_interest_score
          FROM {GOLD}.domain_daily_stats
          WHERE event_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY domain
        ),
        ranked AS (
          SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY total_interest_score DESC)            AS interest_rank,
            ROUND(PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100, 1) AS interest_percentile,
            CASE
              WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 3 THEN 'high_demand'
              WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 7 THEN 'moderate_demand'
              ELSE 'niche'
            END AS demand_tier,
            CASE
              WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 3 THEN 'feature_prominently'
              ELSE 'maintain_presence'
            END AS portfolio_recommendation
          FROM aggregated
        )
        SELECT domain, total_explicit_interest, total_implicit_interest, total_interactions,
               total_unique_users, total_interest_score,
               CAST(interest_rank AS INT) AS interest_rank,
               interest_percentile, demand_tier, portfolio_recommendation
        FROM ranked
        ORDER BY interest_rank
    """))

    # --- experience rankings (per-range) --------------------------------
    experience_rankings = _rows(spark.sql(f"""
        WITH aggregated AS (
          SELECT
            experience_id,
            MAX(experience_title)                  AS experience_title,
            MAX(company)                           AS company,
            SUM(COALESCE(total_interactions, 0))   AS total_interactions,
            SUM(COALESCE(unique_interested_users, 0)) AS total_unique_users,
            SUM(COALESCE(unique_sessions, 0))      AS total_sessions
          FROM {GOLD}.experience_daily_stats
          WHERE event_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          GROUP BY experience_id
        ),
        ranked AS (
          SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY total_interactions DESC)            AS interest_rank,
            ROUND(PERCENT_RANK() OVER (ORDER BY total_interactions) * 100, 1) AS interest_percentile,
            CASE
              WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 2 THEN 'highly_attractive'
              ELSE 'moderately_attractive'
            END AS role_attractiveness,
            CASE
              WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 2 THEN 'feature_at_top'
              ELSE 'maintain_position'
            END AS positioning_suggestion
          FROM aggregated
        )
        SELECT experience_id, experience_title, company, total_interactions, total_unique_users,
               total_sessions,
               CAST(interest_rank AS INT) AS interest_rank,
               interest_percentile, role_attractiveness, positioning_suggestion
        FROM ranked
        ORDER BY interest_rank
    """))

    # --- recommendation performance (single row scalar) ------------------
    recommendation_performance = _rows(spark.sql(f"""
        SELECT * FROM {GOLD}.recommendation_performance LIMIT 1
    """))

    # --- temporal: hourly --------------------------------------------------
    hourly_distribution = _rows(spark.sql(f"""
        SELECT
          hour_of_day AS hour,
          COUNT(*) AS sessions,
          COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
          ROUND(AVG(engagement_score), 2) AS avg_engagement,
          ROUND(COUNT(CASE WHEN is_engaged THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
          AND hour_of_day IS NOT NULL
        GROUP BY hour_of_day
        ORDER BY hour_of_day
    """))

    # --- temporal: day of week (always-7-row output) ---------------------
    dow_raw = _rows(spark.sql(f"""
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
          ROUND(COUNT(CASE WHEN is_engaged THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        GROUP BY session_day_of_week
    """))
    dow_by_num = {r["day_number"]: r for r in dow_raw}
    all_days = [(1, "Sunday"), (2, "Monday"), (3, "Tuesday"), (4, "Wednesday"),
                (5, "Thursday"), (6, "Friday"), (7, "Saturday")]
    day_of_week_distribution = [
        dow_by_num.get(num, {
            "day_name": name, "day_number": num,
            "sessions": 0, "unique_visitors": 0,
            "avg_engagement": 0, "engagement_rate": 0,
        })
        for num, name in all_days
    ]

    # --- devices ----------------------------------------------------------
    device_categories = _rows(spark.sql(f"""
        SELECT device_category,
               COUNT(*) AS sessions,
               COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
               ROUND(COUNT(CASE WHEN is_engaged THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
               ROUND(AVG(session_duration_seconds), 0) AS avg_duration
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        GROUP BY device_category
        ORDER BY sessions DESC
    """))

    browsers = _rows(spark.sql(f"""
        SELECT COALESCE(browser, 'Unknown') AS browser,
               COUNT(*) AS sessions,
               COUNT(DISTINCT user_pseudo_id) AS unique_visitors
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        GROUP BY browser
        ORDER BY sessions DESC
        LIMIT 10
    """))

    operating_systems = _rows(spark.sql(f"""
        SELECT COALESCE(os, 'Unknown') AS operating_system,
               COUNT(*) AS sessions,
               COUNT(DISTINCT user_pseudo_id) AS unique_visitors
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        GROUP BY os
        ORDER BY sessions DESC
        LIMIT 10
    """))

    # --- geographic -------------------------------------------------------
    geographic = _rows(spark.sql(f"""
        SELECT country, city,
               COUNT(*) AS sessions,
               COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
               ROUND(COUNT(CASE WHEN is_engaged THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate
        FROM {SILVER}.sessions
        WHERE session_date BETWEEN DATE '{start_s}' AND DATE '{end_s}'
        GROUP BY country, city
        ORDER BY sessions DESC
        LIMIT 20
    """))

    # --- assemble conversion summary + total conversions -----------------
    conversion_summary = {
        "cta_views":           int(conv_row.get("cta_views") or 0),
        "cta_clicks":          int(conv_row.get("cta_clicks") or 0),
        "form_starts":         int(conv_row.get("form_starts") or 0),
        "form_submissions":    int(conv_row.get("form_submissions") or 0),
        "resume_downloads":    int(conv_row.get("resume_downloads") or 0),
        "social_clicks":       int(conv_row.get("social_clicks") or 0),
        "outbound_clicks":     int(conv_row.get("outbound_clicks") or 0),
        "publication_clicks":  int(conv_row.get("publication_clicks") or 0),
        "content_copies":      int(conv_row.get("content_copies") or 0),
    }
    total_conversions = conversion_summary["form_submissions"] + conversion_summary["resume_downloads"]

    return {
        "overview": {
            "totalSessions":       int(overview.get("total_sessions") or 0),
            "uniqueVisitors":      int(overview.get("unique_visitors") or 0),
            "avgSessionDuration":  float(overview.get("avg_session_duration") or 0),
            "avgPagesPerSession":  float(overview.get("avg_pages_per_session") or 0),
            "bounceRate":          float(overview.get("bounce_rate") or 0),
            "engagementRate":      float(overview.get("engagement_rate") or 0),
            "avgEngagementScore":  float(overview.get("avg_engagement_score") or 0),
            "totalConversions":    total_conversions,
        },
        "dailyMetrics":             daily_metrics_rows,
        "trafficSources":           traffic_sources,
        "conversionSummary":        conversion_summary,
        "projectRankings":          project_rankings,
        "sectionRankings":          section_rankings,
        "visitorSegments":          visitor_segments,
        "topVisitors":              top_visitors,
        "techDemand":               tech_demand,
        "domainRankings":           domain_rankings,
        "experienceRankings":       experience_rankings,
        "recommendationPerformance": recommendation_performance,
        "temporal": {
            "hourlyDistribution":   hourly_distribution,
            "dayOfWeekDistribution": day_of_week_distribution,
        },
        "devices": {
            "categories":           device_categories,
            "browsers":             browsers,
            "operatingSystems":     operating_systems,
        },
        "geographic":               geographic,
        "dateRange":                {"start": str(start_date), "end": str(end_date)},
    }


# COMMAND ----------

# MAGIC %md
# MAGIC ## Discover the data window, build 5 ranges, compose the payload

# COMMAND ----------

data_range = _one(spark.sql(f"""
    SELECT MIN(session_date) AS min_date, MAX(session_date) AS max_date
    FROM {SILVER}.sessions
"""))

if data_range.get("min_date") and data_range.get("max_date"):
    data_start = date.fromisoformat(data_range["min_date"])
    data_end = date.fromisoformat(data_range["max_date"])
else:
    today = date.today()
    data_start = today - timedelta(days=30)
    data_end = today - timedelta(days=1)

today = date.today()
yesterday = today - timedelta(days=1)

date_ranges = {
    "yesterday":     (yesterday, yesterday),
    "last_7_days":   (yesterday - timedelta(days=6),  yesterday),
    "last_14_days":  (yesterday - timedelta(days=13), yesterday),
    "last_30_days":  (yesterday - timedelta(days=29), yesterday),
    "all_time":      (data_start, data_end),
}

print(f"Data window: {data_start} → {data_end}")
print("Building payloads for ranges:", list(date_ranges.keys()))

gist_content = {
    "metadata": {
        "updated_at":      datetime.utcnow().isoformat() + "Z",
        "data_start_date": str(data_start),
        "data_end_date":   str(data_end),
    }
}

for range_name, (start, end) in date_ranges.items():
    print(f"  Fetching '{range_name}': {start} → {end} ...")
    try:
        gist_content[range_name] = fetch_dashboard_data(start, end)
    except Exception as e:
        print(f"  ERROR for {range_name}: {e}")
        gist_content[range_name] = {"error": str(e)}

# COMMAND ----------

# MAGIC %md
# MAGIC ## PATCH the Gist

# COMMAND ----------

url = f"https://api.github.com/gists/{GIST_ID}"
headers = {
    "Authorization": f"token {GIST_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}
payload = {
    "files": {
        "dashboard-analytics.json": {
            "content": json.dumps(gist_content, indent=2, default=_json_default)
        }
    }
}

response = requests.patch(url, headers=headers, json=payload, timeout=30)
if response.status_code == 200:
    print("Gist updated successfully")
    print(f"  → {response.json().get('html_url')}")
else:
    raise RuntimeError(f"Gist update failed: HTTP {response.status_code}\n{response.text[:500]}")

dbutils.notebook.exit(json.dumps({
    "updated_at": gist_content["metadata"]["updated_at"],
    "data_start_date": gist_content["metadata"]["data_start_date"],
    "data_end_date":   gist_content["metadata"]["data_end_date"],
    "ranges":          list(date_ranges.keys()),
    "gist_url":        response.json().get('html_url'),
}))
