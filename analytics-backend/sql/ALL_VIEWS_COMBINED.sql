-- ============================================================================
-- PORTFOLIO ANALYTICS - ALL VIEWS COMBINED
-- Run this entire file in BigQuery to create all views
-- Project: portfolio-483605
-- Dataset: analytics_518701756 (raw) -> analytics_processed (views)
-- ============================================================================

-- ============================================================================
-- STEP 0: CREATE PROCESSED DATASET
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS `portfolio-483605.analytics_processed`
OPTIONS (
  description = 'Processed analytics data from GA4 export',
  location = 'US'
);

-- ============================================================================
-- LAYER 1: BASE VIEWS (Extract & Clean Raw GA4 Data)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 Sessions View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_sessions` AS
WITH session_data AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    MIN(TIMESTAMP_MICROS(event_timestamp)) AS session_start,
    MAX(TIMESTAMP_MICROS(event_timestamp)) AS session_end,
    device.category AS device_category,
    device.operating_system AS os,
    device.browser AS browser,
    device.language AS device_language,
    geo.country AS country,
    geo.region AS region,
    geo.city AS city,
    geo.continent AS continent,
    traffic_source.source AS src,
    traffic_source.medium AS medium,
    traffic_source.name AS campaign_name,
    COUNT(*) AS total_events,
    COUNTIF(event_name = 'page_view') AS page_views,
    COUNTIF(event_name = 'scroll') AS scroll_events,
    COUNTIF(event_name = 'click') AS click_events,
    MAX((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engaged_session_event')) AS engaged_session,
    MAX((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) AS max_engagement_time_msec,
    MIN(CASE WHEN event_name = 'page_view'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')
        END) AS landing_page,
    MAX(CASE WHEN event_name = 'page_view'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')
        END) AS exit_page
  FROM `portfolio-483605.analytics_518701756.events_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
  GROUP BY 1, 2, device.category, device.operating_system, device.browser,
           device.language, geo.country, geo.region, geo.city, geo.continent,
           traffic_source.source, traffic_source.medium, traffic_source.name
)
SELECT
  user_pseudo_id,
  session_id,
  session_start,
  session_end,
  device_category,
  os,
  browser,
  device_language,
  country,
  region,
  city,
  continent,
  src AS traffic_source,
  medium AS traffic_medium,
  campaign_name,
  total_events,
  page_views,
  scroll_events,
  click_events,
  engaged_session,
  max_engagement_time_msec,
  landing_page,
  exit_page,
  TIMESTAMP_DIFF(session_end, session_start, SECOND) AS session_duration_seconds,
  DATE(session_start) AS session_date,
  EXTRACT(HOUR FROM session_start) AS session_hour,
  EXTRACT(DAYOFWEEK FROM session_start) AS session_day_of_week,
  CASE WHEN page_views = 1 THEN TRUE ELSE FALSE END AS is_bounce,
  CASE WHEN engaged_session = 1 OR TIMESTAMP_DIFF(session_end, session_start, SECOND) > 10 THEN TRUE ELSE FALSE END AS is_engaged
FROM session_data
WHERE session_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 1.2 Page Views View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_page_views` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
  REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'#([a-zA-Z0-9_-]+)') AS section_hash,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec') AS engagement_time_msec,
  device.category AS device_category,
  device.browser AS browser,
  device.operating_system AS os,
  geo.country AS country,
  geo.city AS city,
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name = 'page_view'
  AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.3 Project Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'project_id') AS project_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'project_title') AS project_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'category') AS project_category,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'action') AS action_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'technology') AS technology,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'display_position') AS display_position,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_spent_seconds') AS time_spent_seconds,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_type') AS link_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
  device.category AS device_category,
  device.browser AS browser,
  geo.country AS country,
  geo.city AS city,
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN ('project_view', 'project_click', 'project_expand', 'project_link_click',
                     'case_study_open', 'case_study_engagement', 'technology_interest', 'project_category_interest')
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.4 Section Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'section_id') AS section_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'section_name') AS section_name,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_spent_seconds') AS time_spent_seconds,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth_percent') AS scroll_depth_percent,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS engagement_value,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_milestone') AS scroll_milestone,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'from_section') AS from_section,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'to_section') AS to_section,
  device.category AS device_category,
  device.browser AS browser,
  geo.country AS country
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN ('section_view', 'section_engagement', 'section_exit', 'scroll', 'scroll_depth', 'navigation')
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.5 Skill Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'skill_name') AS skill_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'skill_category') AS skill_category,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'context') AS interaction_context,
  device.category AS device_category,
  device.browser AS browser,
  geo.country AS country,
  geo.city AS city,
  traffic_source.source AS traffic_source
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN ('skill_click', 'skill_category_view', 'skill_hover')
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.6 Conversion Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_conversion_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_name') AS cta_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_location') AS cta_location,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'form_name') AS form_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'submission_status') AS submission_status,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_text') AS link_text,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'platform') AS social_platform,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'last_section') AS exit_last_section,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_page_seconds') AS exit_time_on_page,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'content_type') AS copied_content_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'pub_title') AS publication_title,
  device.category AS device_category,
  device.browser AS browser,
  geo.country AS country,
  geo.city AS city,
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN ('cta_click', 'cta_view', 'contact_form_start', 'contact_form_submit', 'conversion',
                     'outbound_link', 'social_click', 'resume_download', 'exit_intent', 'content_copy', 'publication_click')
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.7 Client Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_client_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'client_id') AS client_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'client_name') AS client_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'domain') AS domain,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experience_id') AS experience_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experience_title') AS experience_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'company') AS company,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_spent_seconds') AS time_spent_seconds,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth_percent') AS scroll_depth_percent,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'read_time_seconds') AS read_time_seconds,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'contribution_index') AS contribution_index,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'technology') AS technology,
  device.category AS device_category,
  device.browser AS browser,
  geo.country AS country,
  geo.city AS city,
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN ('client_view', 'client_click', 'client_case_study_open', 'client_case_study_engagement',
                     'domain_interest', 'client_tech_stack_click', 'experience_level_interest',
                     'contribution_view', 'problem_statement_read', 'solution_read')
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.8 Recommendation Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendation_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'recommended_project_id') AS recommended_project_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'recommended_project_title') AS recommended_project_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'source_project_id') AS source_project_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'position') AS position,
  device.category AS device_category,
  geo.country AS country,
  traffic_source.source AS traffic_source
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN ('recommendation_shown', 'recommendation_click')
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));

-- ----------------------------------------------------------------------------
-- 1.9 Certification Events View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_certification_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cert_title') AS cert_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cert_issuer') AS cert_issuer,
  device.category AS device_category,
  geo.country AS country,
  traffic_source.source AS traffic_source
FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name = 'certification_click'
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));


-- ============================================================================
-- LAYER 2: AGGREGATED VIEWS (Daily Metrics)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Daily Metrics View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_daily_metrics` AS
SELECT
  session_date,
  COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))) AS total_sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  SUM(page_views) AS total_page_views,
  AVG(page_views) AS avg_pages_per_session,
  COUNTIF(is_engaged) AS engaged_sessions,
  ROUND(COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
  COUNTIF(is_bounce) AS bounces,
  ROUND(COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,
  AVG(session_duration_seconds) AS avg_session_duration_sec,
  COUNTIF(device_category = 'desktop') AS desktop_sessions,
  COUNTIF(device_category = 'mobile') AS mobile_sessions,
  COUNTIF(device_category = 'tablet') AS tablet_sessions
FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY session_date
ORDER BY session_date DESC;

-- ----------------------------------------------------------------------------
-- 2.2 Project Daily Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_daily_stats` AS
SELECT
  event_date,
  project_id,
  project_title,
  project_category,
  COUNTIF(event_name = 'project_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions,
  COUNTIF(event_name = 'project_click') AS clicks,
  COUNTIF(event_name IN ('project_expand', 'case_study_open')) AS expands,
  COUNTIF(event_name = 'project_link_click') AS link_clicks,
  COUNTIF(event_name = 'case_study_engagement') AS case_study_engagements,
  AVG(time_spent_seconds) AS avg_time_spent_seconds,
  ROUND(
    COUNTIF(event_name IN ('project_click', 'project_expand', 'case_study_open', 'project_link_click')) * 100.0 /
    NULLIF(COUNTIF(event_name = 'project_view'), 0), 2
  ) AS click_through_rate,
  COUNTIF(link_type = 'github') AS github_clicks,
  COUNTIF(link_type = 'demo') AS demo_clicks,
  AVG(display_position) AS avg_display_position,
  COUNTIF(device_category = 'desktop') AS desktop_interactions,
  COUNTIF(device_category = 'mobile') AS mobile_interactions
FROM `portfolio-483605.analytics_processed.v_project_events`
WHERE project_id IS NOT NULL
GROUP BY event_date, project_id, project_title, project_category
ORDER BY event_date DESC, views DESC;

-- ----------------------------------------------------------------------------
-- 2.3 Section Daily Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_daily_stats` AS
SELECT
  event_date,
  section_id,
  COUNTIF(event_name = 'section_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions,
  COUNTIF(event_name = 'section_engagement') AS engaged_views,
  ROUND(
    COUNTIF(event_name = 'section_engagement') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0), 2
  ) AS engagement_rate,
  AVG(time_spent_seconds) AS avg_time_spent_seconds,
  AVG(scroll_depth_percent) AS avg_scroll_depth_percent,
  MAX(scroll_milestone) AS max_scroll_milestone,
  COUNTIF(event_name = 'section_exit') AS exits,
  ROUND(
    COUNTIF(event_name = 'section_exit') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0), 2
  ) AS exit_rate,
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views
FROM `portfolio-483605.analytics_processed.v_section_events`
WHERE section_id IS NOT NULL
GROUP BY event_date, section_id
ORDER BY event_date DESC, views DESC;

-- ----------------------------------------------------------------------------
-- 2.4 Skill Daily Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_daily_stats` AS
SELECT
  event_date,
  skill_name,
  skill_category,
  COUNTIF(event_name = 'skill_click') AS clicks,
  COUNT(DISTINCT user_pseudo_id) AS unique_users,
  COUNT(DISTINCT session_id) AS unique_sessions,
  (COUNTIF(event_name = 'skill_click') * 3) AS weighted_interest_score,
  COUNTIF(device_category = 'desktop') AS desktop_clicks,
  COUNTIF(device_category = 'mobile') AS mobile_clicks
FROM `portfolio-483605.analytics_processed.v_skill_events`
WHERE skill_name IS NOT NULL
GROUP BY event_date, skill_name, skill_category
ORDER BY event_date DESC, clicks DESC;

-- ----------------------------------------------------------------------------
-- 2.5 Client Daily Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_client_daily_stats` AS
SELECT
  event_date,
  client_id,
  client_name,
  domain,
  COUNTIF(event_name = 'client_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNTIF(event_name = 'client_click') AS clicks,
  COUNTIF(event_name = 'client_case_study_open') AS case_study_opens,
  COUNTIF(event_name = 'client_case_study_engagement') AS case_study_engagements,
  AVG(CASE WHEN event_name = 'client_case_study_engagement' THEN time_spent_seconds END) AS avg_case_study_time_sec,
  AVG(CASE WHEN event_name = 'client_case_study_engagement' THEN scroll_depth_percent END) AS avg_case_study_scroll_depth,
  COUNTIF(event_name = 'domain_interest') AS domain_interest_signals,
  COUNTIF(event_name = 'experience_level_interest') AS experience_interest_signals,
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views
FROM `portfolio-483605.analytics_processed.v_client_events`
WHERE client_id IS NOT NULL OR domain IS NOT NULL
GROUP BY event_date, client_id, client_name, domain
ORDER BY event_date DESC, views DESC;

-- ----------------------------------------------------------------------------
-- 2.6 Domain Daily Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_domain_daily_stats` AS
SELECT
  event_date,
  domain,
  COUNTIF(event_name = 'domain_interest') AS explicit_interest_signals,
  COUNTIF(event_name IN ('client_view', 'client_case_study_open')) AS implicit_interest_from_views,
  COUNT(*) AS total_domain_interactions,
  COUNT(DISTINCT user_pseudo_id) AS unique_interested_users,
  (COUNTIF(event_name = 'domain_interest') * 3 + COUNTIF(event_name IN ('client_view', 'client_case_study_open'))) AS domain_interest_score
FROM `portfolio-483605.analytics_processed.v_client_events`
WHERE domain IS NOT NULL
GROUP BY event_date, domain
ORDER BY event_date DESC, total_domain_interactions DESC;

-- ----------------------------------------------------------------------------
-- 2.7 Traffic Daily Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_traffic_daily_stats` AS
SELECT
  session_date AS event_date,
  traffic_source,
  traffic_medium,
  campaign_name,
  COUNT(*) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  SUM(page_views) AS total_page_views,
  ROUND(AVG(page_views), 2) AS avg_pages_per_session,
  ROUND(AVG(session_duration_seconds), 2) AS avg_session_duration_sec,
  ROUND(COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
  ROUND(COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,
  COUNTIF(device_category = 'desktop') AS desktop_sessions,
  COUNTIF(device_category = 'mobile') AS mobile_sessions
FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY event_date, traffic_source, traffic_medium, campaign_name
ORDER BY event_date DESC, sessions DESC;

-- ----------------------------------------------------------------------------
-- 2.8 Conversion Funnel View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_conversion_funnel` AS
SELECT
  event_date,
  COUNT(DISTINCT CONCAT(user_pseudo_id, '-', CAST(session_id AS STRING))) AS total_sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  COUNTIF(event_name = 'cta_view') AS total_cta_views,
  COUNTIF(event_name = 'cta_click') AS total_cta_clicks,
  COUNTIF(event_name = 'contact_form_start') AS contact_form_starts,
  COUNTIF(event_name = 'contact_form_submit') AS contact_form_submissions,
  COUNTIF(event_name = 'social_click') AS social_clicks,
  COUNTIF(event_name = 'resume_download') AS resume_downloads,
  COUNTIF(event_name = 'outbound_link') AS outbound_clicks,
  COUNTIF(event_name = 'publication_click') AS publication_clicks,
  COUNTIF(event_name = 'exit_intent') AS exit_intents
FROM `portfolio-483605.analytics_processed.v_conversion_events`
GROUP BY event_date
ORDER BY event_date DESC;


-- ============================================================================
-- LAYER 3: RANKINGS & INSIGHTS (7-Day Rolling)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 Project Rankings View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_rankings` AS
WITH project_7day AS (
  SELECT
    project_id,
    project_title,
    project_category,
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(clicks) AS total_clicks,
    SUM(expands) AS total_expands,
    SUM(link_clicks) AS total_link_clicks,
    AVG(avg_time_spent_seconds) AS avg_time_spent_seconds,
    AVG(click_through_rate) AS avg_ctr,
    SUM(github_clicks) AS total_github_clicks,
    SUM(demo_clicks) AS total_demo_clicks
  FROM `portfolio-483605.analytics_processed.v_project_daily_stats`
  WHERE event_date >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY project_id, project_title, project_category
),
scored AS (
  SELECT *,
    ((total_views * 1.0) + (total_unique_viewers * 2.0) + (total_clicks * 3.0) +
     (total_expands * 5.0) + (total_link_clicks * 7.0) + (total_github_clicks * 6.0) +
     (total_demo_clicks * 8.0) + (COALESCE(avg_time_spent_seconds, 0) * 0.5) +
     (COALESCE(avg_ctr, 0) * 2.0)) AS raw_engagement_score
  FROM project_7day
)
SELECT
  project_id, project_title, project_category,
  total_views, total_unique_viewers, total_clicks, total_expands, total_link_clicks,
  total_github_clicks, total_demo_clicks,
  ROUND(avg_time_spent_seconds, 2) AS avg_time_spent_seconds,
  ROUND(avg_ctr, 2) AS avg_ctr_percent,
  ROUND(raw_engagement_score, 2) AS engagement_score,
  ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY project_category ORDER BY raw_engagement_score DESC) AS category_rank,
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 3 THEN 'featured'
    WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 6 THEN 'primary'
    ELSE 'secondary'
  END AS recommended_position,
  CURRENT_TIMESTAMP() AS ranked_at
FROM scored
ORDER BY overall_rank;

-- ----------------------------------------------------------------------------
-- 3.2 Skill Rankings View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_rankings` AS
WITH skill_7day AS (
  SELECT
    skill_name,
    skill_category,
    SUM(clicks) AS total_clicks,
    SUM(unique_users) AS total_unique_users,
    SUM(weighted_interest_score) AS total_interest_score
  FROM `portfolio-483605.analytics_processed.v_skill_daily_stats`
  WHERE event_date >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY skill_name, skill_category
)
SELECT
  skill_name, skill_category,
  total_clicks, total_unique_users, total_interest_score,
  ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY skill_category ORDER BY total_interest_score DESC) AS category_rank,
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 15 THEN 'moderate_demand'
    ELSE 'niche_interest'
  END AS demand_tier,
  CURRENT_TIMESTAMP() AS ranked_at
FROM skill_7day
ORDER BY overall_rank;

-- ----------------------------------------------------------------------------
-- 3.3 Section Rankings View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_rankings` AS
WITH section_7day AS (
  SELECT
    section_id,
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(engaged_views) AS total_engaged_views,
    AVG(engagement_rate) AS avg_engagement_rate,
    AVG(avg_time_spent_seconds) AS avg_time_spent_seconds,
    AVG(avg_scroll_depth_percent) AS avg_scroll_depth_percent,
    SUM(exits) AS total_exits,
    AVG(exit_rate) AS avg_exit_rate
  FROM `portfolio-483605.analytics_processed.v_section_daily_stats`
  WHERE event_date >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY section_id
),
scored AS (
  SELECT *,
    ((COALESCE(avg_engagement_rate, 0) * 2) + (COALESCE(avg_scroll_depth_percent, 0) * 0.5) + ((100 - COALESCE(avg_exit_rate, 0)) * 0.3)) AS health_score
  FROM section_7day
)
SELECT
  section_id,
  total_views, total_unique_viewers, total_engaged_views,
  ROUND(avg_engagement_rate, 2) AS avg_engagement_rate,
  ROUND(avg_time_spent_seconds, 2) AS avg_time_spent_seconds,
  ROUND(avg_scroll_depth_percent, 2) AS avg_scroll_depth_percent,
  total_exits,
  ROUND(avg_exit_rate, 2) AS avg_exit_rate,
  ROUND(health_score, 2) AS health_score,
  ROW_NUMBER() OVER (ORDER BY health_score DESC) AS engagement_rank,
  CASE
    WHEN health_score >= 80 THEN 'excellent'
    WHEN health_score >= 60 THEN 'good'
    WHEN health_score >= 40 THEN 'needs_attention'
    ELSE 'critical'
  END AS health_tier,
  CASE
    WHEN avg_exit_rate > 50 THEN 'high_dropoff'
    WHEN avg_exit_rate > 30 THEN 'moderate_dropoff'
    ELSE 'low_dropoff'
  END AS dropoff_indicator,
  CURRENT_TIMESTAMP() AS ranked_at
FROM scored
ORDER BY engagement_rank;

-- ----------------------------------------------------------------------------
-- 3.4 Domain Rankings View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_domain_rankings` AS
WITH domain_7day AS (
  SELECT
    domain,
    SUM(explicit_interest_signals) AS total_explicit_interest,
    SUM(implicit_interest_from_views) AS total_implicit_interest,
    SUM(total_domain_interactions) AS total_interactions,
    SUM(unique_interested_users) AS total_unique_users,
    SUM(domain_interest_score) AS total_interest_score
  FROM `portfolio-483605.analytics_processed.v_domain_daily_stats`
  WHERE event_date >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY domain
)
SELECT
  domain,
  total_explicit_interest, total_implicit_interest, total_interactions,
  total_unique_users, total_interest_score,
  ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS interest_rank,
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 2 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 4 THEN 'moderate_demand'
    ELSE 'niche_interest'
  END AS demand_tier,
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) = 1 THEN 'primary_strength'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 3 THEN 'showcase_more'
    ELSE 'consider_expanding'
  END AS portfolio_recommendation,
  CURRENT_TIMESTAMP() AS ranked_at
FROM domain_7day
ORDER BY interest_rank;

-- ----------------------------------------------------------------------------
-- 3.5 Visitor Insights View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_visitor_insights` AS
WITH visitor_sessions AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT session_id) AS total_sessions,
    MIN(session_start) AS first_visit,
    MAX(session_end) AS last_visit,
    SUM(page_views) AS total_page_views,
    AVG(session_duration_seconds) AS avg_session_duration,
    COUNTIF(is_engaged) AS engaged_sessions,
    ANY_VALUE(device_category) AS primary_device,
    ANY_VALUE(country) AS primary_country,
    ANY_VALUE(traffic_source) AS primary_traffic_source
  FROM `portfolio-483605.analytics_processed.v_sessions`
  WHERE session_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY user_pseudo_id
)
SELECT
  user_pseudo_id,
  total_sessions,
  first_visit,
  last_visit,
  total_page_views,
  ROUND(avg_session_duration, 2) AS avg_session_duration_sec,
  engaged_sessions,
  ROUND(engaged_sessions * 100.0 / NULLIF(total_sessions, 0), 2) AS engagement_rate,
  primary_device,
  primary_country,
  primary_traffic_source,
  CASE
    WHEN engaged_sessions >= 2 THEN 'engaged_explorer'
    WHEN total_sessions >= 2 THEN 'returning_visitor'
    WHEN engaged_sessions = 1 THEN 'engaged_new'
    ELSE 'casual_browser'
  END AS visitor_segment
FROM visitor_sessions
ORDER BY total_sessions DESC;


-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'All 21 views created successfully!' AS status, CURRENT_TIMESTAMP() AS created_at;
