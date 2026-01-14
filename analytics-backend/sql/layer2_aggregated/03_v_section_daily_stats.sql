-- Layer 2: Aggregated View - Section Daily Stats
-- Section engagement metrics aggregated by day
-- Calculates BOTH unique (per-session) and total (raw) metrics
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_daily_stats` AS
WITH session_metrics AS (
  -- Calculate unique views/exits per session (for funnel analysis)
  SELECT
    event_date,
    section_id,
    session_id,
    user_pseudo_id,
    -- Count unique views/exits per session (a session can only count once)
    MAX(CASE WHEN event_name = 'section_view' THEN 1 ELSE 0 END) AS had_view,
    MAX(CASE WHEN event_name = 'section_exit' THEN 1 ELSE 0 END) AS had_exit
  FROM `portfolio-483605.analytics_processed.v_section_events`
  WHERE section_id IS NOT NULL
  GROUP BY event_date, section_id, session_id, user_pseudo_id
)
SELECT
  e.event_date,
  e.section_id,

  -- UNIQUE metrics (per-session, for funnel analysis)
  -- Each session counts only once regardless of revisits
  SUM(s.had_view) AS unique_views,
  SUM(s.had_exit) AS unique_exits,
  COUNT(DISTINCT e.user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT e.session_id) AS unique_sessions,
  ROUND(
    SUM(s.had_exit) * 100.0 / NULLIF(SUM(s.had_view), 0),
    2
  ) AS unique_exit_rate,

  -- TOTAL metrics (raw counts, for engagement/stickiness analysis)
  -- Higher total than unique = users revisiting the section
  COUNTIF(e.event_name = 'section_view') AS total_views,
  COUNTIF(e.event_name = 'section_exit') AS total_exits,
  ROUND(
    COUNTIF(e.event_name = 'section_exit') * 100.0 /
    NULLIF(COUNTIF(e.event_name = 'section_view'), 0),
    2
  ) AS total_exit_rate,

  -- Revisit metrics (engagement indicator)
  ROUND(
    COUNTIF(e.event_name = 'section_view') * 1.0 / NULLIF(SUM(s.had_view), 0),
    2
  ) AS avg_revisits_per_session,

  -- Engagement metrics
  COUNTIF(e.event_name = 'section_engagement') AS engaged_views,
  ROUND(
    COUNTIF(e.event_name = 'section_engagement') * 100.0 /
    NULLIF(COUNTIF(e.event_name = 'section_view'), 0),
    2
  ) AS engagement_rate,

  -- Time spent
  AVG(e.time_spent_seconds) AS avg_time_spent_seconds,
  MAX(e.time_threshold_sec) AS max_time_threshold_reached,

  -- Scroll depth
  AVG(e.scroll_depth_percent) AS avg_scroll_depth_percent,
  MAX(e.scroll_milestone) AS max_scroll_milestone,

  -- Device breakdown
  COUNTIF(e.device_category = 'desktop') AS desktop_views,
  COUNTIF(e.device_category = 'mobile') AS mobile_views,

  -- Section flow context
  COUNTIF(e.entry_direction = 'down') AS entries_from_above,
  COUNTIF(e.entry_direction = 'up') AS entries_from_below,
  COUNTIF(e.exit_direction = 'down') AS continued_to_next,
  COUNTIF(e.exit_direction = 'up') AS went_back_up,
  ROUND(COUNTIF(e.exit_direction = 'down') * 100.0 / NULLIF(COUNTIF(e.event_name = 'section_exit'), 0), 2) AS continue_rate,

  -- Section position analysis
  ROUND(AVG(e.section_position), 1) AS avg_section_position,

  -- Scroll behavior analysis
  ROUND(AVG(e.scroll_velocity), 1) AS avg_scroll_velocity,
  ROUND(AVG(e.time_to_reach_depth_sec), 1) AS avg_time_to_scroll_depth,
  COUNTIF(e.is_bouncing = 'true') AS bouncing_sessions,
  ROUND(COUNTIF(e.is_bouncing = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate_from_section

FROM `portfolio-483605.analytics_processed.v_section_events` e
LEFT JOIN session_metrics s
  ON e.event_date = s.event_date
  AND e.section_id = s.section_id
  AND e.session_id = s.session_id
  AND e.user_pseudo_id = s.user_pseudo_id
WHERE e.section_id IS NOT NULL
GROUP BY e.event_date, e.section_id
ORDER BY e.event_date DESC, total_views DESC;
