-- Layer 2: Aggregated View - Daily Metrics
-- Overall site metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_daily_metrics` AS
SELECT
  session_date,

  -- Session metrics
  COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)) AS total_sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  SUM(page_views) AS total_page_views,
  AVG(page_views) AS avg_pages_per_session,

  -- Engagement
  COUNTIF(is_engaged) AS engaged_sessions,
  ROUND(COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
  COUNTIF(is_bounce) AS bounces,
  ROUND(COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,
  AVG(session_duration_seconds) AS avg_session_duration_sec,
  AVG(max_engagement_time_msec / 1000.0) AS avg_engagement_time_sec,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_sessions,
  COUNTIF(device_category = 'mobile') AS mobile_sessions,
  COUNTIF(device_category = 'tablet') AS tablet_sessions,

  -- Top traffic sources (as struct)
  ARRAY_AGG(
    STRUCT(traffic_source AS source, traffic_medium AS medium)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_traffic_sources,

  -- Top countries
  ARRAY_AGG(
    STRUCT(country, COUNT(*) AS sessions)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_countries,

  -- Time patterns
  ROUND(AVG(session_hour), 1) AS avg_session_hour,
  MODE() WITHIN GROUP (ORDER BY session_day_of_week) AS most_common_day

FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY session_date
ORDER BY session_date DESC;
