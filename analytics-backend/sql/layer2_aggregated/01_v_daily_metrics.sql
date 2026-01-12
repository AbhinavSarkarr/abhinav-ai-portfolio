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

  -- Time patterns
  ROUND(AVG(session_hour), 1) AS avg_session_hour,

  -- Engagement score metrics (NEW - from enhanced v_sessions)
  ROUND(AVG(engagement_score), 1) AS avg_engagement_score,
  COUNTIF(engagement_level = 'very_high') AS very_high_engagement_sessions,
  COUNTIF(engagement_level = 'high') AS high_engagement_sessions,
  COUNTIF(engagement_level = 'medium') AS medium_engagement_sessions,
  COUNTIF(engagement_level = 'low') AS low_engagement_sessions,

  -- Returning visitor metrics (NEW)
  COUNTIF(is_returning = true) AS returning_visitor_sessions,
  ROUND(COUNTIF(is_returning = true) * 100.0 / NULLIF(COUNT(*), 0), 2) AS returning_visitor_rate,
  AVG(CASE WHEN is_returning = true THEN visit_count END) AS avg_visit_count_returning,

  -- User preferences (NEW)
  COUNTIF(color_scheme = 'dark') AS dark_mode_sessions,
  COUNTIF(color_scheme = 'light') AS light_mode_sessions,
  ROUND(COUNTIF(color_scheme = 'dark') * 100.0 / NULLIF(COUNT(*), 0), 2) AS dark_mode_percentage,

  -- Connection quality (NEW)
  COUNTIF(connection_type = '4g') AS sessions_4g,
  COUNTIF(connection_type = 'wifi') AS sessions_wifi,
  COUNTIF(connection_type IN ('3g', '2g')) AS sessions_slow_connection

FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY session_date
ORDER BY session_date DESC;
