-- Layer 2: Aggregated View - Section Daily Stats
-- Section engagement metrics aggregated by day
-- Calculates BOTH unique (per-session) and total (raw) metrics
-- RE-DUPLICATION FIX: If exits > views, assume views = exits (you can't exit without entering)
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_daily_stats` AS
WITH session_metrics AS (
  -- Calculate views/exits per session
  SELECT
    event_date,
    section_id,
    session_id,
    user_pseudo_id,
    -- Count actual events per session
    COUNTIF(event_name = 'section_view') AS view_count,
    COUNTIF(event_name = 'section_exit') AS exit_count,
    -- For unique: did this session have at least one view/exit?
    MAX(CASE WHEN event_name = 'section_view' THEN 1 ELSE 0 END) AS had_view,
    MAX(CASE WHEN event_name = 'section_exit' THEN 1 ELSE 0 END) AS had_exit
  FROM `portfolio-483605.analytics_processed.v_section_events`
  WHERE section_id IS NOT NULL
  GROUP BY event_date, section_id, session_id, user_pseudo_id
),
adjusted_metrics AS (
  -- RE-DUPLICATION: If exits > views, assume views = exits (legacy data fix)
  SELECT
    event_date,
    section_id,
    session_id,
    user_pseudo_id,
    -- Adjusted counts: views should be at least as many as exits
    GREATEST(view_count, exit_count) AS adjusted_view_count,
    exit_count,
    -- For unique sessions: if had_exit but not had_view, assume had_view (can't exit without entering)
    GREATEST(had_view, had_exit) AS adjusted_had_view,
    had_exit
  FROM session_metrics
)
SELECT
  e.event_date,
  e.section_id,

  -- UNIQUE metrics (per-session, for funnel analysis)
  -- Uses adjusted views: if session had exit but no view, count as viewed
  SUM(a.adjusted_had_view) AS unique_views,
  SUM(a.had_exit) AS unique_exits,
  COUNT(DISTINCT e.user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT e.session_id) AS unique_sessions,
  ROUND(
    SUM(a.had_exit) * 100.0 / NULLIF(SUM(a.adjusted_had_view), 0),
    2
  ) AS unique_exit_rate,

  -- TOTAL metrics (adjusted for legacy data)
  -- Uses adjusted view count: views >= exits always
  SUM(a.adjusted_view_count) AS total_views,
  SUM(a.exit_count) AS total_exits,
  ROUND(
    SUM(a.exit_count) * 100.0 / NULLIF(SUM(a.adjusted_view_count), 0),
    2
  ) AS total_exit_rate,

  -- Revisit metrics (stickiness - inferred from exits for legacy data)
  ROUND(
    SUM(a.adjusted_view_count) * 1.0 / NULLIF(SUM(a.adjusted_had_view), 0),
    2
  ) AS avg_revisits_per_session,

  -- Data quality marker: percentage of data that needed adjustment
  ROUND(
    SUM(CASE WHEN a.adjusted_view_count > a.exit_count THEN 0 ELSE 1 END) * 100.0 / COUNT(*),
    2
  ) AS pct_legacy_adjusted,

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
LEFT JOIN adjusted_metrics a
  ON e.event_date = a.event_date
  AND e.section_id = a.section_id
  AND e.session_id = a.session_id
  AND e.user_pseudo_id = a.user_pseudo_id
WHERE e.section_id IS NOT NULL
GROUP BY e.event_date, e.section_id
ORDER BY e.event_date DESC, total_views DESC;
