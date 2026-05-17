# Databricks notebook source
# MAGIC %md
# MAGIC # Gold · Layer 2 — daily aggregates
# MAGIC
# MAGIC One row per `(date, dimension)`. Ports the 11 views in
# MAGIC `analytics-backend/sql/layer2_aggregated/`.
# MAGIC
# MAGIC All 11 tables read directly from **Silver** (one external read per
# MAGIC table) and run in parallel — no inter-table dependencies at this layer.
# MAGIC
# MAGIC ## BQ → Databricks notes
# MAGIC - `COUNTIF(x)` → `count_if(x)` (Databricks built-in)
# MAGIC - `STRING_AGG(DISTINCT x, ',')` → `concat_ws(',', collect_set(x))`
# MAGIC - `ARRAY_AGG(DISTINCT x IGNORE NULLS ORDER BY x LIMIT 10)`
# MAGIC   → `slice(array_sort(collect_set(x)), 1, 10)`
# MAGIC - Silver is in a different pipeline → `spark.read.table(...)` rather
# MAGIC   than `dlt.read(...)`.

# COMMAND ----------

import dlt

SILVER_CATALOG = spark.conf.get("silver_catalog")
SILVER_SCHEMA = spark.conf.get("silver_schema")


def _silver(table: str) -> str:
    """Fully-qualified Silver table name (cross-pipeline read)."""
    return f"{SILVER_CATALOG}.{SILVER_SCHEMA}.{table}"


# ----------------------------------------------------------------------
# gold.daily_metrics
# ----------------------------------------------------------------------


@dlt.table(name="daily_metrics", comment="Per-day site KPIs (sessions, visitors, engagement, bounce, device).")
@dlt.expect("non_null_date", "session_date IS NOT NULL")
def daily_metrics():
    return spark.sql(f"""
        SELECT
          session_date,

          COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)))            AS total_sessions,
          COUNT(DISTINCT user_pseudo_id)                                                      AS unique_visitors,
          SUM(page_views)                                                                     AS total_page_views,
          AVG(page_views)                                                                     AS avg_pages_per_session,

          COUNT(DISTINCT CASE WHEN is_engaged THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS engaged_sessions,
          ROUND(
            COUNT(DISTINCT CASE WHEN is_engaged THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) * 100.0 /
            NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))), 0),
            2
          ) AS engagement_rate,
          COUNT(DISTINCT CASE WHEN is_bounce THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS bounces,
          ROUND(
            COUNT(DISTINCT CASE WHEN is_bounce THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) * 100.0 /
            NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))), 0),
            2
          ) AS bounce_rate,
          AVG(session_duration_seconds)                                                       AS avg_session_duration_sec,
          AVG(max_engagement_time_msec / 1000.0)                                              AS avg_engagement_time_sec,

          COUNT(DISTINCT CASE WHEN device_category = 'desktop' THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS desktop_sessions,
          COUNT(DISTINCT CASE WHEN device_category = 'mobile'  THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS mobile_sessions,
          COUNT(DISTINCT CASE WHEN device_category = 'tablet'  THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS tablet_sessions,

          ROUND(AVG(session_hour), 1) AS avg_session_hour,

          ROUND(AVG(engagement_score), 1) AS avg_engagement_score,
          COUNT(DISTINCT CASE WHEN engagement_level = 'very_high' THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS very_high_engagement_sessions,
          COUNT(DISTINCT CASE WHEN engagement_level = 'high'      THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS high_engagement_sessions,
          COUNT(DISTINCT CASE WHEN engagement_level = 'medium'    THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS medium_engagement_sessions,
          COUNT(DISTINCT CASE WHEN engagement_level = 'low'       THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS low_engagement_sessions,

          COUNT(DISTINCT CASE WHEN is_returning THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS returning_visitor_sessions,
          ROUND(
            COUNT(DISTINCT CASE WHEN is_returning THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) * 100.0 /
            NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))), 0),
            2
          ) AS returning_visitor_rate,
          AVG(CASE WHEN is_returning THEN visit_count END) AS avg_visit_count_returning,

          COUNT(DISTINCT CASE WHEN color_scheme = 'dark'  THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS dark_mode_sessions,
          COUNT(DISTINCT CASE WHEN color_scheme = 'light' THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS light_mode_sessions,
          ROUND(
            COUNT(DISTINCT CASE WHEN color_scheme = 'dark' THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) * 100.0 /
            NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))), 0),
            2
          ) AS dark_mode_percentage,

          COUNT(DISTINCT CASE WHEN connection_type = '4g'   THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS sessions_4g,
          COUNT(DISTINCT CASE WHEN connection_type = 'wifi' THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS sessions_wifi,
          COUNT(DISTINCT CASE WHEN connection_type IN ('3g', '2g') THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING)) END) AS sessions_slow_connection

        FROM {_silver("sessions")}
        GROUP BY session_date
    """)


# ----------------------------------------------------------------------
# gold.project_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="project_daily_stats", comment="Per-project daily engagement metrics.")
@dlt.expect("non_null_keys", "event_date IS NOT NULL AND project_id IS NOT NULL")
def project_daily_stats():
    return spark.sql(f"""
        SELECT
          event_date,
          project_id,
          project_title,
          project_category,

          GREATEST(
            count_if(event_name = 'project_view'),
            count_if(event_name = 'project_click')
          ) AS views,
          COUNT(DISTINCT CASE WHEN event_name IN ('project_view', 'project_click') THEN user_pseudo_id END) AS unique_viewers,
          COUNT(DISTINCT CASE WHEN event_name IN ('project_view', 'project_click') THEN session_id END)    AS unique_sessions,

          count_if(event_name = 'project_click')                                        AS clicks,
          count_if(event_name IN ('project_expand', 'case_study_open'))                 AS expands,
          count_if(event_name = 'project_link_click')                                   AS link_clicks,
          count_if(event_name = 'case_study_engagement')                                AS case_study_engagements,

          AVG(view_duration_ms)    AS avg_view_duration_ms,
          AVG(time_on_page_sec)    AS avg_time_on_page_sec,

          ROUND(
            count_if(event_name IN ('project_click', 'project_expand', 'case_study_open', 'project_link_click')) * 100.0 /
            NULLIF(count_if(event_name = 'project_view'), 0),
            2
          ) AS click_through_rate,

          slice(array_sort(collect_set(technology)), 1, 10) AS technologies_clicked,

          count_if(link_type = 'github')   AS github_clicks,
          count_if(link_type = 'demo')     AS demo_clicks,
          count_if(link_type = 'external') AS external_clicks,

          AVG(display_position) AS avg_display_position,

          count_if(device_category = 'desktop') AS desktop_interactions,
          count_if(device_category = 'mobile')  AS mobile_interactions,

          count_if(is_first_view = 'true')                              AS first_time_views,
          ROUND(AVG(projects_viewed_before), 1)                         AS avg_projects_viewed_before,

          count_if(was_recommended = 'true')                            AS recommended_project_views,
          ROUND(count_if(was_recommended = 'true') * 100.0 /
                NULLIF(count_if(event_name = 'project_view'), 0), 2)    AS recommended_view_rate,

          ROUND(AVG(hover_duration_sec), 1)         AS avg_hover_duration_sec,
          count_if(projects_clicked_before = 0)     AS first_project_clicks,

          count_if(is_from_skill_click = 'true')    AS skill_driven_clicks,
          ROUND(count_if(is_from_skill_click = 'true') * 100.0 /
                NULLIF(count_if(event_name = 'project_click'), 0), 2)   AS skill_driven_click_rate,
          slice(array_sort(collect_set(source_skill)), 1, 10)           AS source_skills,

          count_if(is_deep_read = 'true')           AS deep_reads,
          ROUND(AVG(scroll_depth_percent), 1)       AS avg_case_study_scroll_depth,
          ROUND(AVG(completion_rate), 1)            AS avg_case_study_completion_rate,
          ROUND(AVG(sections_read_count), 1)        AS avg_sections_read

        FROM {_silver("project_events")}
        WHERE project_id IS NOT NULL
        GROUP BY event_date, project_id, project_title, project_category
    """)


# ----------------------------------------------------------------------
# gold.section_daily_stats  (most complex L2 — has re-duplication fix CTE chain)
# ----------------------------------------------------------------------


@dlt.table(name="section_daily_stats", comment="Per-section daily engagement (unique + total metrics, with re-dup fix).")
@dlt.expect("non_null_keys", "event_date IS NOT NULL AND section_id IS NOT NULL")
@dlt.expect("views_gte_exits", "total_views >= total_exits")
def section_daily_stats():
    return spark.sql(f"""
        WITH session_metrics AS (
          SELECT
            event_date, section_id, session_id, user_pseudo_id,
            count_if(event_name = 'section_view') AS view_count,
            count_if(event_name = 'section_exit') AS exit_count,
            MAX(CASE WHEN event_name = 'section_view' THEN 1 ELSE 0 END) AS had_view,
            MAX(CASE WHEN event_name = 'section_exit' THEN 1 ELSE 0 END) AS had_exit
          FROM {_silver("section_events")}
          WHERE section_id IS NOT NULL
          GROUP BY event_date, section_id, session_id, user_pseudo_id
        ),
        adjusted_metrics AS (
          SELECT
            event_date, section_id, session_id, user_pseudo_id,
            GREATEST(view_count, exit_count) AS adjusted_view_count,
            exit_count,
            GREATEST(had_view, had_exit)     AS adjusted_had_view,
            had_exit
          FROM session_metrics
        )
        SELECT
          e.event_date,
          e.section_id,

          SUM(a.adjusted_had_view)                          AS unique_views,
          SUM(a.had_exit)                                   AS unique_exits,
          COUNT(DISTINCT e.user_pseudo_id)                  AS unique_viewers,
          COUNT(DISTINCT e.session_id)                      AS unique_sessions,
          ROUND(SUM(a.had_exit) * 100.0 / NULLIF(SUM(a.adjusted_had_view), 0), 2) AS unique_exit_rate,

          SUM(a.adjusted_view_count)                        AS total_views,
          SUM(a.exit_count)                                 AS total_exits,
          ROUND(SUM(a.exit_count) * 100.0 / NULLIF(SUM(a.adjusted_view_count), 0), 2) AS total_exit_rate,

          ROUND(SUM(a.adjusted_view_count) * 1.0 / NULLIF(SUM(a.adjusted_had_view), 0), 2) AS avg_revisits_per_session,

          ROUND(SUM(CASE WHEN a.adjusted_view_count > a.exit_count THEN 0 ELSE 1 END) * 100.0 / COUNT(*), 2) AS pct_legacy_adjusted,

          COUNT(DISTINCT CASE WHEN e.event_name = 'section_engagement' THEN e.session_id END) AS engaged_sessions,
          ROUND(
            COUNT(DISTINCT CASE WHEN e.event_name = 'section_engagement' THEN e.session_id END) * 100.0 /
            NULLIF(COUNT(DISTINCT CASE WHEN e.event_name = 'section_view' THEN e.session_id END), 0),
            2
          ) AS engagement_rate,

          AVG(e.time_spent_seconds)               AS avg_time_spent_seconds,
          MAX(e.time_threshold_sec)               AS max_time_threshold_reached,
          AVG(e.scroll_depth_percent)             AS avg_scroll_depth_percent,
          MAX(e.scroll_milestone)                 AS max_scroll_milestone,

          count_if(e.device_category = 'desktop') AS desktop_views,
          count_if(e.device_category = 'mobile')  AS mobile_views,

          count_if(e.entry_direction = 'down')    AS entries_from_above,
          count_if(e.entry_direction = 'up')      AS entries_from_below,
          count_if(e.exit_direction  = 'down')    AS continued_to_next,
          count_if(e.exit_direction  = 'up')      AS went_back_up,
          ROUND(count_if(e.exit_direction = 'down') * 100.0 /
                NULLIF(count_if(e.event_name = 'section_exit'), 0), 2)        AS continue_rate,

          ROUND(AVG(e.section_position), 1)                                  AS avg_section_position,
          ROUND(AVG(e.scroll_velocity), 1)                                   AS avg_scroll_velocity,
          ROUND(AVG(e.time_to_reach_depth_sec), 1)                           AS avg_time_to_scroll_depth,
          count_if(e.is_bouncing = 'true')                                   AS bouncing_sessions,
          ROUND(count_if(e.is_bouncing = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate_from_section

        FROM {_silver("section_events")} e
        LEFT JOIN adjusted_metrics a
          ON  e.event_date     = a.event_date
          AND e.section_id     = a.section_id
          AND e.session_id     = a.session_id
          AND e.user_pseudo_id = a.user_pseudo_id
        WHERE e.section_id IS NOT NULL
        GROUP BY e.event_date, e.section_id
    """)


# ----------------------------------------------------------------------
# gold.skill_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="skill_daily_stats", comment="Per-skill daily engagement (clicks, hovers, weighted interest score).")
@dlt.expect("non_null_keys", "event_date IS NOT NULL AND skill_name IS NOT NULL")
def skill_daily_stats():
    return spark.sql(f"""
        SELECT
          event_date,
          skill_name,
          skill_category,

          count_if(event_name = 'skill_click')         AS clicks,
          count_if(event_name = 'skill_hover')         AS hovers,
          COUNT(DISTINCT user_pseudo_id)               AS unique_users,
          COUNT(DISTINCT session_id)                   AS unique_sessions,

          count_if(event_name = 'skill_category_view') AS category_views,

          (count_if(event_name = 'skill_click') * 3 +
           count_if(event_name = 'skill_hover') * 1)   AS weighted_interest_score,

          AVG(skill_position)                          AS avg_position,

          count_if(skill_level = 'advanced')           AS advanced_skill_clicks,
          count_if(skill_level = 'intermediate')       AS intermediate_skill_clicks,
          count_if(skill_level = 'beginner')           AS beginner_skill_clicks,

          ROUND(AVG(related_projects_count), 1)        AS avg_related_projects,

          ROUND(AVG(time_on_site_sec), 1)              AS avg_time_on_site_before_click,
          ROUND(AVG(projects_viewed_before), 1)        AS avg_projects_viewed_before_click,
          ROUND(AVG(sections_viewed), 1)               AS avg_sections_viewed_before_click,

          count_if(was_in_viewport = 'true')           AS clicks_while_in_viewport

        FROM {_silver("skill_events")}
        WHERE skill_name IS NOT NULL
        GROUP BY event_date, skill_name, skill_category
    """)


# ----------------------------------------------------------------------
# gold.traffic_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="traffic_daily_stats", comment="Per-day traffic-source/medium/campaign metrics.")
@dlt.expect("non_null_date", "event_date IS NOT NULL")
def traffic_daily_stats():
    return spark.sql(f"""
        SELECT
          session_date AS event_date,
          traffic_source,
          traffic_medium,
          campaign_name,

          COUNT(*)                         AS sessions,
          COUNT(DISTINCT user_pseudo_id)   AS unique_visitors,
          SUM(page_views)                  AS total_page_views,
          ROUND(AVG(page_views), 2)        AS avg_pages_per_session,
          ROUND(AVG(session_duration_seconds), 2) AS avg_session_duration_sec,
          ROUND(count_if(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
          ROUND(count_if(is_bounce)  * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,

          count_if(device_category = 'desktop') AS desktop_sessions,
          count_if(device_category = 'mobile')  AS mobile_sessions,

          ROUND(AVG(engagement_score), 1)                AS avg_engagement_score,
          count_if(engagement_level IN ('very_high', 'high')) AS high_engagement_sessions,
          ROUND(count_if(engagement_level IN ('very_high', 'high')) * 100.0 / NULLIF(COUNT(*), 0), 2) AS high_engagement_rate,

          count_if(is_returning)                         AS returning_visitors,
          ROUND(count_if(is_returning) * 100.0 / NULLIF(COUNT(*), 0), 2) AS returning_visitor_rate,

          ROUND(AVG(max_scroll_depth), 1)                AS avg_scroll_depth

        FROM {_silver("sessions")}
        GROUP BY session_date, traffic_source, traffic_medium, campaign_name
    """)


# ----------------------------------------------------------------------
# gold.conversion_funnel
# ----------------------------------------------------------------------


@dlt.table(name="conversion_funnel", comment="Per-day conversion funnel: CTA → form → submit, plus downloads, social, exits.")
@dlt.expect("non_null_date", "event_date IS NOT NULL")
@dlt.expect("submissions_le_starts", "contact_form_submissions <= contact_form_starts")
def conversion_funnel():
    return spark.sql(f"""
        WITH session_conversions AS (
          SELECT
            DATE(event_timestamp) AS event_date,
            user_pseudo_id,
            session_id,

            count_if(event_name = 'cta_view')                              AS cta_views,
            count_if(event_name = 'cta_click')                             AS cta_clicks,

            MAX(CASE WHEN event_name = 'contact_form_start'       THEN 1 ELSE 0 END) AS started_contact_form,
            MAX(CASE WHEN event_name = 'contact_form_field_focus' THEN 1 ELSE 0 END) AS focused_form_field,
            MAX(CASE WHEN event_name = 'contact_form_submit'      THEN 1 ELSE 0 END) AS submitted_contact_form,

            MAX(CASE WHEN event_name = 'social_click'    THEN 1 ELSE 0 END) AS clicked_social,
            concat_ws(',', collect_set(social_platform))                    AS social_platforms_clicked,

            MAX(CASE WHEN event_name = 'outbound_link'   THEN 1 ELSE 0 END) AS clicked_outbound,
            concat_ws(',', collect_set(link_domain))                        AS outbound_domains,

            MAX(CASE WHEN event_name = 'resume_download' THEN 1 ELSE 0 END) AS downloaded_resume,
            MAX(CASE WHEN event_name = 'file_download'   THEN 1 ELSE 0 END) AS downloaded_file,

            MAX(CASE WHEN event_name = 'publication_click' THEN 1 ELSE 0 END) AS clicked_publication,

            MAX(CASE WHEN event_name = 'content_copy'    THEN 1 ELSE 0 END) AS copied_content,

            MAX(CASE WHEN event_name = 'exit_intent'     THEN 1 ELSE 0 END) AS triggered_exit_intent,

            AVG(time_on_site_before_start)  AS avg_time_on_site_before_start,
            AVG(sections_viewed)            AS avg_sections_viewed,
            AVG(projects_viewed)            AS avg_projects_viewed,
            AVG(projects_clicked_before)    AS avg_projects_clicked_before,
            AVG(scroll_depth_at_start)      AS avg_scroll_depth_at_start,

            AVG(message_length)             AS avg_message_length,
            AVG(time_to_submit_sec)         AS avg_time_to_submit,

            MAX(CASE WHEN is_returning_visitor = 'true' THEN 1 ELSE 0 END) AS is_returning_visitor,

            concat_ws(',', collect_set(download_source)) AS download_sources,
            concat_ws(',', collect_set(exit_trigger))    AS exit_triggers,
            MAX(CASE WHEN was_idle = 'true' THEN 1 ELSE 0 END) AS was_idle_before_exit,
            MAX(conversions_count) AS max_conversions_in_session

          FROM {_silver("conversion_events")}
          GROUP BY DATE(event_timestamp), user_pseudo_id, session_id
        )

        SELECT
          event_date,

          COUNT(*)                        AS total_sessions,
          COUNT(DISTINCT user_pseudo_id)  AS unique_visitors,

          SUM(cta_views)                  AS total_cta_views,
          SUM(cta_clicks)                 AS total_cta_clicks,
          ROUND(SUM(cta_clicks) * 100.0 / NULLIF(SUM(cta_views), 0), 2) AS cta_click_rate,

          SUM(started_contact_form)       AS contact_form_starts,
          SUM(focused_form_field)         AS contact_form_field_focuses,
          SUM(submitted_contact_form)     AS contact_form_submissions,
          ROUND(SUM(submitted_contact_form) * 100.0 / NULLIF(SUM(started_contact_form), 0), 2) AS form_completion_rate,

          SUM(clicked_social)             AS social_clicks,
          ROUND(SUM(clicked_social) * 100.0 / NULLIF(COUNT(*), 0), 2) AS social_click_rate,

          SUM(clicked_outbound)           AS outbound_clicks,
          ROUND(SUM(clicked_outbound) * 100.0 / NULLIF(COUNT(*), 0), 2) AS outbound_click_rate,

          SUM(downloaded_resume)          AS resume_downloads,
          SUM(downloaded_file)            AS file_downloads,

          SUM(clicked_publication)        AS publication_clicks,
          SUM(copied_content)             AS content_copies,

          ROUND(SUM(triggered_exit_intent) * 100.0 / NULLIF(COUNT(*), 0), 2) AS exit_intent_rate,

          ROUND(
            (SUM(submitted_contact_form) * 10 +
             SUM(downloaded_resume) * 8 +
             SUM(clicked_social) * 3 +
             SUM(clicked_outbound) * 2 +
             SUM(copied_content) * 4) * 1.0 / NULLIF(COUNT(*), 0),
            3
          ) AS avg_conversion_score,

          ROUND(AVG(avg_time_on_site_before_start), 1) AS avg_time_to_conversion_start,
          ROUND(AVG(avg_sections_viewed), 1)           AS avg_sections_before_conversion,
          ROUND(AVG(avg_projects_viewed), 1)           AS avg_projects_before_conversion,
          ROUND(AVG(avg_projects_clicked_before), 1)   AS avg_projects_clicked_before_conversion,
          ROUND(AVG(avg_scroll_depth_at_start), 1)     AS avg_scroll_depth_at_conversion,

          ROUND(AVG(avg_message_length), 0)            AS avg_contact_message_length,
          ROUND(AVG(avg_time_to_submit), 1)            AS avg_form_completion_time_sec,

          SUM(is_returning_visitor)                    AS returning_visitor_conversions,
          ROUND(SUM(is_returning_visitor) * 100.0 / NULLIF(SUM(submitted_contact_form) + SUM(downloaded_resume), 0), 2) AS returning_visitor_conversion_share,

          SUM(was_idle_before_exit)                    AS idle_exits,
          ROUND(SUM(was_idle_before_exit) * 100.0 / NULLIF(SUM(triggered_exit_intent), 0), 2) AS idle_exit_rate

        FROM session_conversions
        GROUP BY event_date
    """)


# ----------------------------------------------------------------------
# gold.client_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="client_daily_stats", comment="Per-client daily engagement (views, clicks, case-study reads, tech).")
@dlt.expect("non_null_keys", "event_date IS NOT NULL AND client_id IS NOT NULL")
def client_daily_stats():
    return spark.sql(f"""
        SELECT
          event_date,
          client_id,
          client_name,
          domain,

          count_if(event_name = 'client_view')                  AS views,
          COUNT(DISTINCT user_pseudo_id)                        AS unique_viewers,
          COUNT(DISTINCT session_id)                            AS unique_sessions,

          count_if(event_name = 'client_click')                 AS clicks,
          count_if(event_name = 'client_case_study_open')       AS case_study_opens,
          count_if(event_name = 'client_case_study_engagement') AS case_study_engagements,

          AVG(CASE WHEN event_name = 'client_case_study_engagement' THEN time_spent_seconds END)   AS avg_case_study_time_sec,
          AVG(CASE WHEN event_name = 'client_case_study_engagement' THEN scroll_depth_percent END) AS avg_case_study_scroll_depth,

          count_if(event_name = 'problem_statement_read') AS problem_reads,
          count_if(event_name = 'solution_read')          AS solution_reads,
          AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_read_time_sec,
          AVG(CASE WHEN event_name = 'solution_read'          THEN read_time_seconds END) AS avg_solution_read_time_sec,

          count_if(event_name = 'contribution_view')            AS contribution_views,
          slice(array_sort(collect_set(contribution_index)), 1, 10) AS contributions_viewed,

          count_if(event_name = 'client_tech_stack_click')      AS tech_stack_clicks,
          slice(array_sort(collect_set(technology)), 1, 10)     AS technologies_clicked,

          ROUND(
            count_if(event_name = 'client_case_study_open') * 100.0 /
            NULLIF(count_if(event_name = 'client_view'), 0),
            2
          ) AS case_study_open_rate,

          count_if(device_category = 'desktop') AS desktop_views,
          count_if(device_category = 'mobile')  AS mobile_views,

          count_if(is_first_view = 'true')                   AS first_time_views,
          ROUND(AVG(clients_viewed_before), 1)               AS avg_clients_viewed_before,

          count_if(is_deep_read = 'true')                    AS deep_reads,
          ROUND(count_if(is_deep_read = 'true') * 100.0 /
                NULLIF(count_if(event_name = 'client_case_study_engagement'), 0), 2) AS deep_read_rate,
          ROUND(AVG(completion_rate), 1)                     AS avg_completion_rate,

          count_if(was_recommended = 'true')                 AS recommended_client_views,

          ROUND(AVG(contributions_read_count), 1)            AS avg_contributions_read,
          ROUND(AVG(time_since_session_start), 1)            AS avg_time_into_session

        FROM {_silver("client_events")}
        WHERE client_id IS NOT NULL
        GROUP BY event_date, client_id, client_name, domain
    """)


# ----------------------------------------------------------------------
# gold.domain_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="domain_daily_stats", comment="Per-domain (industry) daily interest signals.")
@dlt.expect("non_null_keys", "event_date IS NOT NULL AND domain IS NOT NULL")
def domain_daily_stats():
    return spark.sql(f"""
        WITH domain_events AS (
          SELECT
            event_date, domain, user_pseudo_id, session_id,
            'domain_interest' AS event_type,
            device_category, country, traffic_source,
            is_first_view, is_deep_read, completion_rate, was_recommended, time_since_session_start
          FROM {_silver("client_events")}
          WHERE event_name = 'domain_interest' AND domain IS NOT NULL

          UNION ALL

          SELECT
            event_date, domain, user_pseudo_id, session_id,
            'client_view' AS event_type,
            device_category, country, traffic_source,
            is_first_view, is_deep_read, completion_rate, was_recommended, time_since_session_start
          FROM {_silver("client_events")}
          WHERE event_name IN ('client_view', 'client_case_study_open') AND domain IS NOT NULL
        )

        SELECT
          event_date,
          domain,

          count_if(event_type = 'domain_interest') AS explicit_interest_signals,
          count_if(event_type = 'client_view')     AS implicit_interest_from_views,
          COUNT(*)                                 AS total_domain_interactions,
          COUNT(DISTINCT user_pseudo_id)           AS unique_interested_users,
          COUNT(DISTINCT session_id)               AS unique_sessions,

          (count_if(event_type = 'domain_interest') * 3 +
           count_if(event_type = 'client_view')     * 1) AS domain_interest_score,

          count_if(device_category = 'desktop')    AS desktop_interactions,
          count_if(device_category = 'mobile')     AS mobile_interactions,

          count_if(is_first_view = 'true')         AS first_time_domain_views,
          ROUND(count_if(is_first_view = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS first_time_view_rate,

          count_if(is_deep_read = 'true')          AS deep_reads,
          ROUND(count_if(is_deep_read = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2)  AS deep_read_rate,
          ROUND(AVG(completion_rate), 1)           AS avg_completion_rate,

          count_if(was_recommended = 'true')       AS recommended_views,
          ROUND(count_if(was_recommended = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS recommendation_driven_rate,

          ROUND(AVG(time_since_session_start), 1)  AS avg_time_into_session

        FROM domain_events
        GROUP BY event_date, domain
    """)


# ----------------------------------------------------------------------
# gold.experience_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="experience_daily_stats", comment="Per-experience/role daily interest metrics.")
@dlt.expect("non_null_keys", "event_date IS NOT NULL AND experience_id IS NOT NULL")
def experience_daily_stats():
    return spark.sql(f"""
        SELECT
          event_date,
          experience_id,
          experience_title,
          company,

          COUNT(*)                       AS total_interactions,
          COUNT(DISTINCT user_pseudo_id) AS unique_interested_users,
          COUNT(DISTINCT session_id)     AS unique_sessions,

          count_if(device_category = 'desktop') AS desktop_views,
          count_if(device_category = 'mobile')  AS mobile_views,

          count_if(is_first_view = 'true')      AS first_time_views,
          count_if(is_deep_read = 'true')       AS deep_reads,
          ROUND(AVG(completion_rate), 1)        AS avg_completion_rate,
          ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session

        FROM {_silver("client_events")}
        WHERE event_name = 'experience_level_interest'
          AND experience_id IS NOT NULL
        GROUP BY event_date, experience_id, experience_title, company
    """)


# ----------------------------------------------------------------------
# gold.recommendation_daily_stats
# ----------------------------------------------------------------------


@dlt.table(name="recommendation_daily_stats", comment="Per-day recommendation engine performance: CTR by position, algorithm, fold.")
@dlt.expect("non_null_date", "event_date IS NOT NULL")
@dlt.expect("clicks_le_impressions", "total_clicks <= total_impressions")
def recommendation_daily_stats():
    return spark.sql(f"""
        SELECT
          event_date,

          count_if(event_name = 'recommendation_shown') AS total_impressions,
          count_if(event_name = 'recommendation_click') AS total_clicks,
          COUNT(DISTINCT user_pseudo_id)                AS unique_users_shown_recs,
          COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN user_pseudo_id END) AS unique_users_clicked,

          ROUND(
            count_if(event_name = 'recommendation_click') * 100.0 /
            NULLIF(count_if(event_name = 'recommendation_shown'), 0), 2
          ) AS overall_ctr,

          ROUND(count_if(event_name = 'recommendation_click' AND position = 1) * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND position = 1), 0), 2) AS position_1_ctr,
          ROUND(count_if(event_name = 'recommendation_click' AND position = 2) * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND position = 2), 0), 2) AS position_2_ctr,
          ROUND(count_if(event_name = 'recommendation_click' AND position = 3) * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND position = 3), 0), 2) AS position_3_ctr,

          count_if(device_category = 'desktop' AND event_name = 'recommendation_click') AS desktop_clicks,
          count_if(device_category = 'mobile'  AND event_name = 'recommendation_click') AS mobile_clicks,

          ROUND(count_if(event_name = 'recommendation_click' AND recommendation_algorithm = 'category_match') * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND recommendation_algorithm = 'category_match'), 0), 2) AS category_match_ctr,
          ROUND(count_if(event_name = 'recommendation_click' AND recommendation_algorithm = 'tech_stack') * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND recommendation_algorithm = 'tech_stack'), 0), 2) AS tech_stack_ctr,
          ROUND(count_if(event_name = 'recommendation_click' AND recommendation_algorithm = 'popularity') * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND recommendation_algorithm = 'popularity'), 0), 2) AS popularity_ctr,

          ROUND(count_if(event_name = 'recommendation_click' AND is_above_fold = 'true') * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND is_above_fold = 'true'), 0), 2) AS above_fold_ctr,
          ROUND(count_if(event_name = 'recommendation_click' AND is_above_fold = 'false') * 100.0 /
                NULLIF(count_if(event_name = 'recommendation_shown' AND is_above_fold = 'false'), 0), 2) AS below_fold_ctr,

          ROUND(AVG(CASE WHEN event_name = 'recommendation_click' THEN time_since_shown_sec END), 1) AS avg_time_to_click_sec,

          ROUND(AVG(projects_viewed_before), 1) AS avg_projects_viewed_before_rec,
          count_if(user_viewed_similar = 'true' AND event_name = 'recommendation_click') AS clicks_after_viewing_similar

        FROM {_silver("recommendation_events")}
        GROUP BY event_date
    """)


# ----------------------------------------------------------------------
# gold.content_reading_stats
# ----------------------------------------------------------------------


@dlt.table(name="content_reading_stats", comment="Per-day reading patterns: problem-statement vs solution depth.")
@dlt.expect("non_null_date", "event_date IS NOT NULL")
def content_reading_stats():
    return spark.sql(f"""
        WITH reading_events AS (
          SELECT
            event_date, user_pseudo_id, session_id,
            client_id, client_name, domain,
            event_name, read_time_seconds,
            is_first_view, is_deep_read, completion_rate, was_recommended,
            time_since_session_start, device_category
          FROM {_silver("client_events")}
          WHERE event_name IN ('problem_statement_read', 'solution_read')
        )

        SELECT
          event_date,

          count_if(event_name = 'problem_statement_read') AS problem_reads,
          count_if(event_name = 'solution_read')          AS solution_reads,

          COUNT(DISTINCT CASE WHEN event_name = 'problem_statement_read'
                              THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING), '-', client_id) END) AS sessions_read_problem,
          COUNT(DISTINCT CASE WHEN event_name = 'solution_read'
                              THEN CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING), '-', client_id) END) AS sessions_read_solution,

          AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_read_time_sec,
          AVG(CASE WHEN event_name = 'solution_read'          THEN read_time_seconds END) AS avg_solution_read_time_sec,

          ROUND(
            AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) /
            NULLIF(AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END), 0),
            2
          ) AS problem_to_solution_time_ratio,

          count_if(is_first_view = 'true') AS first_time_readers,
          ROUND(count_if(is_first_view = 'true') * 100.0 /
                NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))), 0), 2) AS first_time_reader_rate,

          count_if(is_deep_read = 'true')  AS deep_read_events,
          ROUND(AVG(completion_rate), 1)   AS avg_content_completion_rate,

          count_if(was_recommended = 'true') AS reads_from_recommendations,
          ROUND(
            AVG(CASE WHEN was_recommended = 'true' THEN read_time_seconds END) /
            NULLIF(AVG(CASE WHEN was_recommended = 'false' OR was_recommended IS NULL THEN read_time_seconds END), 0),
            2
          ) AS recommended_vs_organic_read_time_ratio,

          ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session_at_read,

          ROUND(AVG(CASE WHEN device_category = 'desktop' THEN read_time_seconds END), 1) AS avg_desktop_read_time,
          ROUND(AVG(CASE WHEN device_category = 'mobile'  THEN read_time_seconds END), 1) AS avg_mobile_read_time

        FROM reading_events
        GROUP BY event_date
    """)
