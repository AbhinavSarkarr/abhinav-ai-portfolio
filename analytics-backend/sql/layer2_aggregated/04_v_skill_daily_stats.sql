-- Layer 2: Aggregated View - Skill Daily Stats
-- Skill interest metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_daily_stats` AS
SELECT
  event_date,
  skill_name,
  skill_category,

  -- Interaction metrics
  COUNTIF(event_name = 'skill_click') AS clicks,
  COUNTIF(event_name = 'skill_hover') AS hovers,
  COUNT(DISTINCT user_pseudo_id) AS unique_users,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Category views (when category is shown)
  COUNTIF(event_name = 'skill_category_view') AS category_views,

  -- Interest score (weighted)
  (COUNTIF(event_name = 'skill_click') * 3 +
   COUNTIF(event_name = 'skill_hover') * 1) AS weighted_interest_score,

  -- Context (where skill was interacted with)
  ARRAY_AGG(
    DISTINCT interaction_context IGNORE NULLS
    ORDER BY interaction_context
    LIMIT 5
  ) AS interaction_contexts,

  -- Position impact
  AVG(skill_position) AS avg_position,

  -- Traffic source correlation
  ARRAY_AGG(
    STRUCT(traffic_source AS source, COUNT(*) AS interactions)
    ORDER BY COUNT(*) DESC
    LIMIT 3
  ) AS top_traffic_sources,

  -- Geographic interest
  ARRAY_AGG(
    STRUCT(country, COUNT(*) AS interactions)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_countries

FROM `portfolio-483605.analytics_processed.v_skill_events`
WHERE skill_name IS NOT NULL
GROUP BY event_date, skill_name, skill_category
ORDER BY event_date DESC, clicks DESC;
