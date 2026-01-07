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

  -- Traffic source (who's looking at these roles?)
  ARRAY_AGG(
    STRUCT(traffic_source AS source, COUNT(*) AS interactions)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_traffic_sources,

  -- Geographic interest (where are interested visitors from?)
  ARRAY_AGG(
    STRUCT(country, COUNT(*) AS interactions)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_countries,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views

FROM `portfolio-483605.analytics_processed.v_client_events`
WHERE event_name = 'experience_level_interest'
  AND experience_id IS NOT NULL
GROUP BY event_date, experience_id, experience_title, company
ORDER BY event_date DESC, total_interactions DESC;
