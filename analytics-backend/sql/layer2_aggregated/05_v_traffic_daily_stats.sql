-- Layer 2: Aggregated View - Traffic Daily Stats
-- Traffic source and acquisition metrics by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_traffic_daily_stats` AS
SELECT
  session_date AS event_date,
  traffic_source,
  traffic_medium,
  campaign_name,

  -- Volume
  COUNT(*) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  SUM(page_views) AS total_page_views,

  -- Quality
  ROUND(AVG(page_views), 2) AS avg_pages_per_session,
  ROUND(AVG(session_duration_seconds), 2) AS avg_session_duration_sec,
  ROUND(COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
  ROUND(COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_sessions,
  COUNTIF(device_category = 'mobile') AS mobile_sessions,




  -- Engagement quality by source (NEW - from enhanced v_sessions)
  ROUND(AVG(engagement_score), 1) AS avg_engagement_score,
  COUNTIF(engagement_level IN ('very_high', 'high')) AS high_engagement_sessions,
  ROUND(COUNTIF(engagement_level IN ('very_high', 'high')) * 100.0 / NULLIF(COUNT(*), 0), 2) AS high_engagement_rate,

  -- Returning visitors by source (NEW)
  COUNTIF(is_returning = true) AS returning_visitors,
  ROUND(COUNTIF(is_returning = true) * 100.0 / NULLIF(COUNT(*), 0), 2) AS returning_visitor_rate,

  -- Scroll depth by source (NEW)
  ROUND(AVG(max_scroll_depth), 1) AS avg_scroll_depth

FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY event_date, traffic_source, traffic_medium, campaign_name
ORDER BY event_date DESC, sessions DESC;
