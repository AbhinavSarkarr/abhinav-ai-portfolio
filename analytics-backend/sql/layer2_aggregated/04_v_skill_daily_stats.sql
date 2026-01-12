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

  -- Position impact
  AVG(skill_position) AS avg_position,

  -- Skill level distribution (NEW - from enhanced v_skill_events)
  COUNTIF(skill_level = 'advanced') AS advanced_skill_clicks,
  COUNTIF(skill_level = 'intermediate') AS intermediate_skill_clicks,
  COUNTIF(skill_level = 'beginner') AS beginner_skill_clicks,

  -- Related projects context (NEW)
  ROUND(AVG(related_projects_count), 1) AS avg_related_projects,

  -- User journey context (NEW)
  ROUND(AVG(time_on_site_sec), 1) AS avg_time_on_site_before_click,
  ROUND(AVG(projects_viewed_before), 1) AS avg_projects_viewed_before_click,
  ROUND(AVG(sections_viewed), 1) AS avg_sections_viewed_before_click,

  -- Viewport visibility (NEW)
  COUNTIF(was_in_viewport = 'true') AS clicks_while_in_viewport

FROM `portfolio-483605.analytics_processed.v_skill_events`
WHERE skill_name IS NOT NULL
GROUP BY event_date, skill_name, skill_category
ORDER BY event_date DESC, clicks DESC;
