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
  -- FIX: Use COUNT(DISTINCT) to count unique sessions, not rows
  COUNT(DISTINCT CASE WHEN is_engaged THEN CONCAT(user_pseudo_id, '-', session_id) END) AS engaged_sessions,
  ROUND(
    COUNT(DISTINCT CASE WHEN is_engaged THEN CONCAT(user_pseudo_id, '-', session_id) END) * 100.0 /
    NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)), 0),
    2
  ) AS engagement_rate,
  COUNT(DISTINCT CASE WHEN is_bounce THEN CONCAT(user_pseudo_id, '-', session_id) END) AS bounces,
  ROUND(
    COUNT(DISTINCT CASE WHEN is_bounce THEN CONCAT(user_pseudo_id, '-', session_id) END) * 100.0 /
    NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)), 0),
    2
  ) AS bounce_rate,
  AVG(session_duration_seconds) AS avg_session_duration_sec,
  AVG(max_engagement_time_msec / 1000.0) AS avg_engagement_time_sec,

  -- Device breakdown
  -- FIX: Use COUNT(DISTINCT) to count unique sessions per device, not rows
  COUNT(DISTINCT CASE WHEN device_category = 'desktop' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS desktop_sessions,
  COUNT(DISTINCT CASE WHEN device_category = 'mobile' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS mobile_sessions,
  COUNT(DISTINCT CASE WHEN device_category = 'tablet' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS tablet_sessions,

  -- Time patterns
  ROUND(AVG(session_hour), 1) AS avg_session_hour,

  -- Engagement score metrics (NEW - from enhanced v_sessions)
  ROUND(AVG(engagement_score), 1) AS avg_engagement_score,
  -- FIX: Use COUNT(DISTINCT) to count unique sessions per engagement level, not rows
  COUNT(DISTINCT CASE WHEN engagement_level = 'very_high' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS very_high_engagement_sessions,
  COUNT(DISTINCT CASE WHEN engagement_level = 'high' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS high_engagement_sessions,
  COUNT(DISTINCT CASE WHEN engagement_level = 'medium' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS medium_engagement_sessions,
  COUNT(DISTINCT CASE WHEN engagement_level = 'low' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS low_engagement_sessions,

  -- Returning visitor metrics (NEW)
  -- FIX: Use COUNT(DISTINCT) to count unique returning sessions, not rows
  COUNT(DISTINCT CASE WHEN is_returning = true THEN CONCAT(user_pseudo_id, '-', session_id) END) AS returning_visitor_sessions,
  ROUND(
    COUNT(DISTINCT CASE WHEN is_returning = true THEN CONCAT(user_pseudo_id, '-', session_id) END) * 100.0 /
    NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)), 0),
    2
  ) AS returning_visitor_rate,
  AVG(CASE WHEN is_returning = true THEN visit_count END) AS avg_visit_count_returning,

  -- User preferences (NEW)
  -- FIX: Use COUNT(DISTINCT) to count unique sessions per color scheme, not rows
  COUNT(DISTINCT CASE WHEN color_scheme = 'dark' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS dark_mode_sessions,
  COUNT(DISTINCT CASE WHEN color_scheme = 'light' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS light_mode_sessions,
  ROUND(
    COUNT(DISTINCT CASE WHEN color_scheme = 'dark' THEN CONCAT(user_pseudo_id, '-', session_id) END) * 100.0 /
    NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)), 0),
    2
  ) AS dark_mode_percentage,

  -- Connection quality (NEW)
  -- FIX: Use COUNT(DISTINCT) to count unique sessions per connection type, not rows
  COUNT(DISTINCT CASE WHEN connection_type = '4g' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS sessions_4g,
  COUNT(DISTINCT CASE WHEN connection_type = 'wifi' THEN CONCAT(user_pseudo_id, '-', session_id) END) AS sessions_wifi,
  COUNT(DISTINCT CASE WHEN connection_type IN ('3g', '2g') THEN CONCAT(user_pseudo_id, '-', session_id) END) AS sessions_slow_connection

FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY session_date
ORDER BY session_date DESC;
