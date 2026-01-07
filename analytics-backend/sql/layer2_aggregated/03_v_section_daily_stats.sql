-- Layer 2: Aggregated View - Section Daily Stats
-- Section engagement metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_daily_stats` AS
SELECT
  event_date,
  section_id,

  -- View metrics
  COUNTIF(event_name = 'section_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Engagement metrics
  COUNTIF(event_name = 'section_engaged') AS engaged_views,
  ROUND(
    COUNTIF(event_name = 'section_engaged') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0),
    2
  ) AS engagement_rate,

  -- Time spent
  AVG(view_duration_ms) AS avg_view_duration_ms,
  AVG(visible_time_ms) AS avg_visible_time_ms,
  MAX(time_threshold_sec) AS max_time_threshold_reached,

  -- Scroll depth
  AVG(scroll_depth) AS avg_scroll_depth,
  MAX(scroll_milestone) AS max_scroll_milestone,
  AVG(visibility_percentage) AS avg_visibility_percentage,

  -- Exit rate from this section
  COUNTIF(event_name = 'section_exit') AS exits,
  ROUND(
    COUNTIF(event_name = 'section_exit') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0),
    2
  ) AS exit_rate,

  -- Navigation patterns
  ARRAY_AGG(
    STRUCT(from_section, to_section, COUNT(*) AS transitions)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_navigation_flows,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views

FROM `portfolio-483605.analytics_processed.v_section_events`
WHERE section_id IS NOT NULL
GROUP BY event_date, section_id
ORDER BY event_date DESC, views DESC;
