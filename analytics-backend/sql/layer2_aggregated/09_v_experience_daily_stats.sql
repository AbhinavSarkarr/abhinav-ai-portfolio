-- Layer 2: Aggregated View - Experience/Role Daily Stats
-- Job role and experience interest metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_experience_daily_stats` AS
SELECT
  event_date,
  experience_id,
  experience_title,
  company,

  -- Interest metrics
  COUNT(*) AS total_interactions,
  COUNT(DISTINCT user_pseudo_id) AS unique_interested_users,
  COUNT(DISTINCT session_id) AS unique_sessions,



  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views,

  -- Experience engagement context (NEW - from enhanced v_client_events)
  COUNTIF(is_first_view = 'true') AS first_time_views,
  COUNTIF(is_deep_read = 'true') AS deep_reads,
  ROUND(AVG(completion_rate), 1) AS avg_completion_rate,
  ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session

FROM `portfolio-483605.analytics_processed.v_client_events`
WHERE event_name = 'experience_level_interest'
  AND experience_id IS NOT NULL
GROUP BY event_date, experience_id, experience_title, company
ORDER BY event_date DESC, total_interactions DESC;
