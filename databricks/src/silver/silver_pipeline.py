# Databricks notebook source
# MAGIC %md
# MAGIC # Silver — Lakeflow Declarative Pipeline
# MAGIC
# MAGIC Typed, flattened event tables derived from Bronze (`bronze.ga4_events_raw`).
# MAGIC
# MAGIC Phase 2 scope: `sessions`, `page_views`. The remaining 7 tables will be
# MAGIC added in the same file once the pattern is validated.
# MAGIC
# MAGIC ## How this runs
# MAGIC - Pipeline declared in `databricks/resources/pipelines.yml`.
# MAGIC - All tables read from the same source; DLT executes them **in parallel**
# MAGIC   because none depend on each other.
# MAGIC - Each `@dlt.table` is a materialized view, refreshed on every pipeline run.
# MAGIC - Expectations are enforced inline; rows failing them are dropped (and
# MAGIC   counted in the DLT data-quality dashboard).
# MAGIC
# MAGIC ## Source configuration
# MAGIC The fully-qualified Bronze table name is injected via pipeline
# MAGIC `configuration` so dev and prod point at the right catalog.
# MAGIC
# MAGIC ## A note on `event_params`
# MAGIC In BigQuery, `event_params` is `ARRAY<STRUCT<key, value>>`. The Spark
# MAGIC BigQuery connector lands it as `MAP<STRING, STRUCT<string_value,
# MAGIC int_value, float_value, double_value>>`, so we read params with simple
# MAGIC dict-style access: `event_params['ga_session_id'].int_value`.
# MAGIC Same applies to `user_properties`.

# COMMAND ----------

import dlt
from pyspark.sql import functions as F

# `spark.conf.get` reads pipeline-level configuration set in pipelines.yml.
BRONZE_TABLE = spark.conf.get("bronze_table_fqn")

# Look-back window — matches the original BigQuery views (90 days).
LOOKBACK_DAYS = 90

# ----------------------------------------------------------------------
# Helper view: bronze, time-filtered to the lookback window.
# Used as the input for every Silver table so the date filter / source
# table coordinates live in exactly one place.
# ----------------------------------------------------------------------


@dlt.view(
    comment="Bronze GA4 events trimmed to the Silver lookback window."
)
def bronze_events_recent():
    return spark.sql(
        f"""
        SELECT *
        FROM   {BRONZE_TABLE}
        WHERE  _event_date >= date_sub(current_date(), {LOOKBACK_DAYS})
        """
    )


# ----------------------------------------------------------------------
# silver.sessions  —  one row per (user_pseudo_id, session_id)
# Port of analytics-backend/sql/layer1_base/01_v_sessions.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="sessions",
    comment="Session-level facts: engagement, device, geo, traffic, derived flags.",
)
@dlt.expect_or_drop("valid_session_id", "session_id IS NOT NULL")
@dlt.expect("non_negative_duration", "session_duration_seconds >= 0")
def sessions():
    return spark.sql(
        """
        WITH session_data AS (
          SELECT
            user_pseudo_id,
            event_params['ga_session_id'].int_value AS session_id,
            MIN(timestamp_micros(event_timestamp)) AS session_start,
            MAX(timestamp_micros(event_timestamp)) AS session_end,

            -- Device (GA4 built-in)
            device.category              AS device_category,
            device.operating_system      AS os,
            device.web_info.browser      AS ga4_browser,
            device.is_limited_ad_tracking AS limited_ad_tracking,
            device.mobile_brand_name     AS mobile_brand,
            device.mobile_model_name     AS mobile_model,
            device.language              AS device_language,

            -- Custom browser/OS from session_start event (fallback for GA4)
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['browser'].string_value END) AS custom_browser,
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['operating_system'].string_value END) AS custom_os,

            -- Geo (GA4 built-in)
            geo.country   AS country,
            geo.region    AS region,
            geo.city      AS city,
            geo.continent AS continent,

            -- Traffic (GA4 built-in)
            traffic_source.source AS source,
            traffic_source.medium AS traffic_medium,
            traffic_source.name   AS campaign_name,

            -- Event counts
            COUNT(*) AS total_events,
            count_if(event_name = 'page_view') AS page_views,
            count_if(event_name = 'scroll')    AS scroll_events,
            count_if(event_name = 'click')     AS click_events,

            -- GA4 engagement signals
            MAX(event_params['engaged_session_event'].int_value) AS engaged_session,
            MAX(event_params['engagement_time_msec'].int_value)  AS max_engagement_time_msec,

            -- First / last page
            MIN(CASE WHEN event_name = 'page_view'
                THEN event_params['page_location'].string_value END) AS landing_page,
            MAX(CASE WHEN event_name = 'page_view'
                THEN event_params['page_location'].string_value END) AS exit_page,

            -- Returning-visitor data (emitted on session_start)
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['visit_count'].int_value END) AS visit_count,
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['days_since_last_visit'].int_value END) AS days_since_last_visit,
            MAX(CASE WHEN event_name = 'session_start'
                THEN try_cast(event_params['is_returning'].string_value AS BOOLEAN) END) AS is_returning,

            -- Engagement summary (emitted on session_end)
            MAX(CASE WHEN event_name = 'session_end'
                THEN event_params['engagement_score'].int_value END) AS engagement_score,
            MAX(CASE WHEN event_name = 'session_end'
                THEN event_params['engagement_level'].string_value END) AS engagement_level,
            MAX(CASE WHEN event_name = 'session_end'
                THEN event_params['max_scroll_depth'].int_value END) AS max_scroll_depth,
            MAX(CASE WHEN event_name = 'session_end'
                THEN event_params['sections_viewed_count'].int_value END) AS sections_viewed_count,
            MAX(CASE WHEN event_name = 'session_end'
                THEN event_params['projects_clicked_count'].int_value END) AS projects_clicked_count,
            MAX(CASE WHEN event_name = 'session_end'
                THEN event_params['conversions_count'].int_value END) AS conversions_count,

            -- Time context (session_start)
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['day_of_week'].string_value END) AS day_of_week_name,
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['hour_of_day'].int_value END) AS hour_of_day,
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['local_timezone'].string_value END) AS local_timezone,

            -- User preferences (session_start)
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['color_scheme'].string_value END) AS color_scheme,
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['language'].string_value END) AS user_language,
            MAX(CASE WHEN event_name = 'session_start'
                THEN event_params['connection_type'].string_value END) AS connection_type

          FROM LIVE.bronze_events_recent
          GROUP BY
            user_pseudo_id,
            event_params['ga_session_id'].int_value,
            device.category,
            device.operating_system,
            device.web_info.browser,
            device.is_limited_ad_tracking,
            device.mobile_brand_name,
            device.mobile_model_name,
            device.language,
            geo.country, geo.region, geo.city, geo.continent,
            traffic_source.source, traffic_source.medium, traffic_source.name
        )

        SELECT
          user_pseudo_id,
          session_id,
          session_start,
          session_end,

          device_category,
          COALESCE(NULLIF(custom_os, ''), os)                                    AS os,
          COALESCE(NULLIF(ga4_browser, ''), NULLIF(custom_browser, ''), 'Unknown') AS browser,
          limited_ad_tracking,
          mobile_brand,
          mobile_model,
          device_language,

          country, region, city, continent,

          source AS traffic_source,
          traffic_medium,
          campaign_name,

          total_events,
          page_views,
          scroll_events,
          click_events,

          engaged_session,
          max_engagement_time_msec,

          landing_page,
          exit_page,

          COALESCE(visit_count, 1)            AS visit_count,
          COALESCE(days_since_last_visit, 0)  AS days_since_last_visit,
          COALESCE(is_returning, FALSE)       AS is_returning,

          COALESCE(engagement_score, 0)         AS engagement_score,
          COALESCE(engagement_level, 'unknown') AS engagement_level,
          COALESCE(max_scroll_depth, 0)         AS max_scroll_depth,
          COALESCE(sections_viewed_count, 0)    AS sections_viewed_count,
          COALESCE(projects_clicked_count, 0)   AS projects_clicked_count,
          COALESCE(conversions_count, 0)        AS conversions_count,

          day_of_week_name,
          hour_of_day,
          local_timezone,

          color_scheme,
          user_language,
          connection_type,

          BIGINT(session_end) - BIGINT(session_start)        AS session_duration_seconds,
          DATE(session_start)                                AS session_date,
          EXTRACT(HOUR      FROM session_start)              AS session_hour,
          EXTRACT(DAYOFWEEK FROM session_start)              AS session_day_of_week,

          CASE WHEN page_views = 1 THEN TRUE ELSE FALSE END  AS is_bounce,

          CASE
            WHEN engaged_session = 1
              OR (BIGINT(session_end) - BIGINT(session_start)) > 10
            THEN TRUE ELSE FALSE
          END AS is_engaged,

          CASE
            WHEN COALESCE(engagement_score, 0) >= 75 THEN 'very_high'
            WHEN COALESCE(engagement_score, 0) >= 50 THEN 'high'
            WHEN COALESCE(engagement_score, 0) >= 25 THEN 'medium'
            ELSE 'low'
          END AS engagement_tier,

          CASE
            WHEN COALESCE(visit_count, 1) = 1                THEN 'new'
            WHEN COALESCE(visit_count, 1) BETWEEN 2 AND 3    THEN 'returning'
            ELSE 'loyal'
          END AS visitor_type,

          CASE WHEN COALESCE(conversions_count, 0) > 0 THEN TRUE ELSE FALSE END AS has_conversion

        FROM session_data
        WHERE session_id IS NOT NULL
        """
    )


# ----------------------------------------------------------------------
# silver.page_views  —  one row per page_view event
# Port of analytics-backend/sql/layer1_base/02_v_page_views.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="page_views",
    comment="Page view events with navigation/engagement context.",
)
@dlt.expect("valid_page_url", "page_url IS NOT NULL")
@dlt.expect("not_undefined_url", "page_url NOT LIKE '%undefined%'")
def page_views():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,

          event_params['page_location'].string_value AS page_url,
          event_params['page_title'].string_value    AS page_title,
          event_params['page_referrer'].string_value AS page_referrer,

          regexp_extract(
            event_params['page_location'].string_value,
            '#([a-zA-Z0-9_-]+)',
            1
          ) AS section_hash,

          event_params['previous_page'].string_value AS previous_page,
          event_params['page_type'].string_value     AS page_type,

          event_params['page_number'].int_value              AS page_number,
          event_params['time_on_previous_page'].int_value    AS time_on_previous_page_sec,
          event_params['time_since_session_start'].int_value AS time_since_session_start_sec,

          event_params['engagement_time_msec'].int_value AS engagement_time_msec,
          event_params['entrances'].int_value             AS is_entrance,

          device.category         AS device_category,
          device.web_info.browser AS browser,
          device.operating_system AS os,

          geo.country AS country,
          geo.city    AS city,

          traffic_source.source AS traffic_source,
          traffic_source.medium AS traffic_medium

        FROM LIVE.bronze_events_recent
        WHERE event_name = 'page_view'
        """
    )


# ----------------------------------------------------------------------
# silver.project_events  —  one row per project-related event
# Port of analytics-backend/sql/layer1_base/03_v_project_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="project_events",
    comment="Project interactions: views, clicks, expands, case-study opens, tech interest.",
)
@dlt.expect("valid_project_id", "project_id IS NOT NULL")
def project_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['project_id'].string_value     AS project_id,
          event_params['project_title'].string_value  AS project_title,
          event_params['category'].string_value       AS project_category,

          event_params['action'].string_value          AS action_type,
          event_params['technology'].string_value      AS technology,
          event_params['display_position'].int_value   AS display_position,
          event_params['view_duration'].int_value      AS view_duration_ms,
          event_params['time_on_page'].int_value       AS time_on_page_sec,

          event_params['is_first_view'].string_value          AS is_first_view,
          event_params['projects_viewed_before'].int_value    AS projects_viewed_before,
          event_params['was_recommended'].string_value        AS was_recommended,

          event_params['hover_duration_seconds'].int_value    AS hover_duration_sec,
          event_params['projects_clicked_before'].int_value   AS projects_clicked_before,

          event_params['is_from_skill_click'].string_value AS is_from_skill_click,
          event_params['source_skill'].string_value        AS source_skill,

          event_params['scroll_depth_percent'].int_value AS scroll_depth_percent,
          event_params['sections_read_count'].int_value  AS sections_read_count,
          event_params['completion_rate'].int_value      AS completion_rate,
          event_params['is_deep_read'].string_value      AS is_deep_read,

          event_params['link_type'].string_value AS link_type,
          event_params['link_url'].string_value  AS link_url,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country,
          geo.city    AS city,

          traffic_source.source AS traffic_source,
          traffic_source.medium AS traffic_medium

        FROM LIVE.bronze_events_recent
        WHERE event_name IN (
          'project_view', 'project_click', 'project_expand', 'project_link_click',
          'case_study_open', 'case_study_engagement',
          'technology_interest', 'project_category_interest'
        )
        """
    )


# ----------------------------------------------------------------------
# silver.section_events  —  one row per section/scroll/navigation event
# Port of analytics-backend/sql/layer1_base/04_v_section_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="section_events",
    comment="Section visibility, scroll, and navigation events (raw, not deduplicated).",
)
@dlt.expect("valid_section_id", "section_id IS NOT NULL")
def section_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['section_id'].string_value   AS section_id,
          event_params['section_name'].string_value AS section_name,

          event_params['time_spent_seconds'].int_value   AS time_spent_seconds,
          event_params['scroll_depth_percent'].int_value AS scroll_depth_percent,
          event_params['value'].int_value                 AS engagement_value,
          event_params['scroll_milestone'].int_value      AS scroll_milestone,
          event_params['time_threshold'].int_value        AS time_threshold_sec,

          event_params['entry_direction'].string_value AS entry_direction,
          event_params['previous_section'].string_value AS previous_section,
          event_params['section_position'].int_value    AS section_position,
          event_params['exit_direction'].string_value   AS exit_direction,

          event_params['scroll_velocity'].int_value         AS scroll_velocity,
          event_params['time_to_reach_depth'].int_value     AS time_to_reach_depth_sec,
          event_params['is_bouncing'].string_value          AS is_bouncing,

          event_params['from_section'].string_value      AS from_section,
          event_params['to_section'].string_value        AS to_section,
          event_params['navigation_method'].string_value AS navigation_method,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country

        FROM LIVE.bronze_events_recent
        WHERE event_name IN (
          'section_view', 'section_engagement', 'section_exit',
          'scroll', 'scroll_milestone', 'scroll_depth',
          'time_threshold', 'navigation'
        )
        """
    )


# ----------------------------------------------------------------------
# silver.skill_events  —  one row per skill interaction
# Port of analytics-backend/sql/layer1_base/05_v_skill_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="skill_events",
    comment="Skill clicks, hovers, and category views.",
)
@dlt.expect("valid_skill_name", "skill_name IS NOT NULL")
def skill_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['skill_name'].string_value     AS skill_name,
          event_params['skill_category'].string_value AS skill_category,

          event_params['context'].string_value      AS interaction_context,
          event_params['skill_position'].int_value  AS skill_position,

          event_params['skill_level'].string_value             AS skill_level,
          event_params['related_projects_count'].int_value     AS related_projects_count,
          event_params['time_on_site'].int_value               AS time_on_site_sec,
          event_params['projects_viewed_before'].int_value     AS projects_viewed_before,
          event_params['sections_viewed'].int_value            AS sections_viewed,
          event_params['was_in_viewport'].string_value         AS was_in_viewport,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country,
          geo.city    AS city,

          traffic_source.source AS traffic_source

        FROM LIVE.bronze_events_recent
        WHERE event_name IN ('skill_click', 'skill_category_view', 'skill_hover')
        """
    )


# ----------------------------------------------------------------------
# silver.conversion_events  —  one row per CTA/form/download/social/exit event
# Port of analytics-backend/sql/layer1_base/06_v_conversion_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="conversion_events",
    comment="CTA, contact form, downloads, social, outbound links, exit intent, content copy.",
)
def conversion_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['cta_name'].string_value     AS cta_name,
          event_params['cta_location'].string_value AS cta_location,
          event_params['cta_text'].string_value     AS cta_text,

          event_params['form_name'].string_value          AS form_name,
          event_params['form_step'].string_value          AS form_step,
          event_params['form_field'].string_value         AS form_field,
          event_params['submission_status'].string_value  AS submission_status,

          event_params['link_url'].string_value    AS link_url,
          event_params['link_text'].string_value   AS link_text,
          event_params['link_domain'].string_value AS link_domain,

          event_params['file_name'].string_value AS file_name,
          event_params['file_type'].string_value AS file_type,

          event_params['social_platform'].string_value AS social_platform,

          event_params['last_section'].string_value AS exit_last_section,
          event_params['time_on_page'].int_value     AS exit_time_on_page,
          event_params['scroll_depth'].int_value     AS exit_scroll_depth,

          event_params['content_type'].string_value    AS copied_content_type,
          event_params['content_snippet'].string_value AS copied_content,

          event_params['publication_title'].string_value AS publication_title,

          event_params['time_on_site_before_start'].int_value AS time_on_site_before_start,
          event_params['sections_viewed'].int_value            AS sections_viewed,
          event_params['projects_viewed'].int_value            AS projects_viewed,
          event_params['projects_clicked_before'].int_value    AS projects_clicked_before,
          event_params['scroll_depth_at_start'].int_value      AS scroll_depth_at_start,

          event_params['message_length'].int_value          AS message_length,
          event_params['time_to_submit'].int_value          AS time_to_submit_sec,
          event_params['is_returning_visitor'].string_value AS is_returning_visitor,

          event_params['download_source'].string_value AS download_source,

          event_params['exit_trigger'].string_value     AS exit_trigger,
          event_params['was_idle'].string_value         AS was_idle,
          event_params['conversions_count'].int_value   AS conversions_count,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country,
          geo.city    AS city,

          traffic_source.source AS traffic_source,
          traffic_source.medium AS traffic_medium

        FROM LIVE.bronze_events_recent
        WHERE event_name IN (
          'cta_click', 'cta_view',
          'contact_form_start', 'contact_form_field_focus', 'contact_form_submit',
          'outbound_link', 'social_click',
          'resume_download', 'file_download',
          'exit_intent', 'content_copy', 'publication_click'
        )
        """
    )


# ----------------------------------------------------------------------
# silver.client_events  —  one row per client/experience interaction
# Port of analytics-backend/sql/layer1_base/07_v_client_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="client_events",
    comment="Client work and experience interactions: views, case study reads, domain interest.",
)
@dlt.expect("valid_client_id", "client_id IS NOT NULL")
def client_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['client_id'].string_value   AS client_id,
          event_params['client_name'].string_value AS client_name,
          event_params['domain'].string_value      AS domain,

          event_params['experience_id'].string_value    AS experience_id,
          event_params['experience_title'].string_value AS experience_title,
          event_params['company'].string_value          AS company,

          event_params['time_spent_seconds'].int_value   AS time_spent_seconds,
          event_params['scroll_depth_percent'].int_value AS scroll_depth_percent,
          event_params['read_time_seconds'].int_value    AS read_time_seconds,

          event_params['contribution_index'].int_value AS contribution_index,

          event_params['technology'].string_value AS technology,

          event_params['is_first_view'].string_value           AS is_first_view,
          event_params['clients_viewed_before'].int_value      AS clients_viewed_before,
          event_params['is_deep_read'].string_value            AS is_deep_read,
          event_params['completion_rate'].int_value            AS completion_rate,
          event_params['was_recommended'].string_value         AS was_recommended,
          event_params['contributions_read_count'].int_value   AS contributions_read_count,
          event_params['time_since_session_start'].int_value   AS time_since_session_start,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country,
          geo.city    AS city,

          traffic_source.source AS traffic_source,
          traffic_source.medium AS traffic_medium

        FROM LIVE.bronze_events_recent
        WHERE event_name IN (
          'client_view', 'client_click',
          'client_case_study_open', 'client_case_study_engagement',
          'domain_interest', 'client_tech_stack_click',
          'experience_level_interest',
          'contribution_view', 'problem_statement_read', 'solution_read'
        )
        """
    )


# ----------------------------------------------------------------------
# silver.recommendation_events  —  one row per recommendation shown/clicked
# Port of analytics-backend/sql/layer1_base/08_v_recommendation_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="recommendation_events",
    comment="Recommendation impressions and clicks with algorithm/context metadata.",
)
@dlt.expect("valid_recommended_project_id", "recommended_project_id IS NOT NULL")
def recommendation_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['recommended_project_id'].string_value    AS recommended_project_id,
          event_params['recommended_project_title'].string_value AS recommended_project_title,
          event_params['source_project_id'].string_value         AS source_project_id,
          event_params['position'].int_value                     AS position,

          event_params['recommendation_algorithm'].string_value   AS recommendation_algorithm,
          event_params['context_category'].string_value           AS context_category,
          event_params['user_viewed_similar'].string_value        AS user_viewed_similar,
          event_params['total_recommendations_shown'].int_value   AS total_recommendations_shown,

          event_params['time_since_shown'].int_value           AS time_since_shown_sec,
          event_params['was_above_fold'].string_value          AS was_above_fold,
          event_params['is_above_fold'].string_value           AS is_above_fold,
          event_params['projects_viewed_before'].int_value     AS projects_viewed_before,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country,

          traffic_source.source AS traffic_source

        FROM LIVE.bronze_events_recent
        WHERE event_name IN ('recommendation_shown', 'recommendation_click')
        """
    )


# ----------------------------------------------------------------------
# silver.certification_events  —  one row per certification click
# Port of analytics-backend/sql/layer1_base/09_v_certification_events.sql
# ----------------------------------------------------------------------


@dlt.table(
    name="certification_events",
    comment="Certification link clicks with issuer / year / category metadata.",
)
@dlt.expect("valid_cert_title", "cert_title IS NOT NULL")
def certification_events():
    return spark.sql(
        """
        SELECT
          _event_date                            AS event_date,
          timestamp_micros(event_timestamp)      AS event_timestamp,
          user_pseudo_id,
          event_params['ga_session_id'].int_value AS session_id,
          event_name,

          event_params['cert_title'].string_value  AS cert_title,
          event_params['cert_issuer'].string_value AS cert_issuer,

          event_params['cert_year'].int_value          AS cert_year,
          event_params['is_expired'].string_value      AS is_expired,
          event_params['cert_category'].string_value   AS cert_category,
          event_params['time_on_site'].int_value       AS time_on_site_sec,
          event_params['current_section'].string_value AS current_section,

          device.category AS device_category,
          device.browser  AS browser,

          geo.country AS country,

          traffic_source.source AS traffic_source

        FROM LIVE.bronze_events_recent
        WHERE event_name = 'certification_click'
        """
    )
