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
  COUNTIF(event_name = 'section_engagement') AS engaged_views,
  ROUND(
    COUNTIF(event_name = 'section_engagement') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0),
    2
  ) AS engagement_rate,

  -- Time spent
  AVG(time_spent_seconds) AS avg_time_spent_seconds,
  MAX(time_threshold_sec) AS max_time_threshold_reached,

  -- Scroll depth
  AVG(scroll_depth_percent) AS avg_scroll_depth_percent,
  MAX(scroll_milestone) AS max_scroll_milestone,

  -- Exit rate from this section
  COUNTIF(event_name = 'section_exit') AS exits,
  ROUND(
    COUNTIF(event_name = 'section_exit') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0),
    2
  ) AS exit_rate,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views,

  -- Section flow context (NEW - from enhanced v_section_events)
  COUNTIF(entry_direction = 'down') AS entries_from_above,
  COUNTIF(entry_direction = 'up') AS entries_from_below,
  COUNTIF(exit_direction = 'down') AS continued_to_next,
  COUNTIF(exit_direction = 'up') AS went_back_up,
  ROUND(COUNTIF(exit_direction = 'down') * 100.0 / NULLIF(COUNTIF(event_name = 'section_exit'), 0), 2) AS continue_rate,

  -- Section position analysis (NEW)
  ROUND(AVG(section_position), 1) AS avg_section_position,

  -- Scroll behavior analysis (NEW)
  ROUND(AVG(scroll_velocity), 1) AS avg_scroll_velocity,
  ROUND(AVG(time_to_reach_depth_sec), 1) AS avg_time_to_scroll_depth,
  COUNTIF(is_bouncing = 'true') AS bouncing_sessions,
  ROUND(COUNTIF(is_bouncing = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate_from_section,

FROM `portfolio-483605.analytics_processed.v_section_events`
WHERE section_id IS NOT NULL
GROUP BY event_date, section_id
ORDER BY event_date DESC, views DESC;
