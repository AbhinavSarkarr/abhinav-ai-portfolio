-- Layer 3: Insights View - Technology Demand Intelligence
-- Analyzes which technologies are most in-demand across domains
-- Answers: What tech should I learn? What's trending in each domain?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_tech_demand_insights` AS
WITH tech_from_clients AS (
  -- Technologies clicked in client work context
  SELECT
    technology,
    domain,
    'client_work' AS source,
    COUNT(*) AS interactions,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM `portfolio-483605.analytics_processed.v_client_events`
  WHERE event_name = 'client_tech_stack_click'
    AND technology IS NOT NULL
    AND event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  GROUP BY technology, domain
),

tech_from_projects AS (
  -- Technologies clicked in project context (from v_project_events)
  SELECT
    technology,
    project_category AS domain,
    'project' AS source,
    COUNT(*) AS interactions,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM `portfolio-483605.analytics_processed.v_project_events`
  WHERE event_name = 'technology_interest'
    AND technology IS NOT NULL
    AND event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  GROUP BY technology, project_category
),

tech_from_skills AS (
  -- Skills clicked (map to technologies)
  SELECT
    skill_name AS technology,
    skill_category AS domain,
    'skills_section' AS source,
    COUNT(*) AS interactions,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM `portfolio-483605.analytics_processed.v_skill_events`
  WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  GROUP BY skill_name, skill_category
),

all_tech AS (
  SELECT * FROM tech_from_clients
  UNION ALL
  SELECT * FROM tech_from_projects
  UNION ALL
  SELECT * FROM tech_from_skills
),

tech_aggregated AS (
  SELECT
    technology,
    SUM(interactions) AS total_interactions,
    SUM(unique_users) AS total_unique_users,

    -- Domain breakdown
    ARRAY_AGG(
      STRUCT(domain, SUM(interactions) AS interactions)
      ORDER BY SUM(interactions) DESC
      LIMIT 5
    ) AS domain_breakdown,

    -- Source breakdown
    ARRAY_AGG(
      STRUCT(source, SUM(interactions) AS interactions)
      ORDER BY SUM(interactions) DESC
    ) AS source_breakdown

  FROM all_tech
  WHERE technology IS NOT NULL
  GROUP BY technology
)

SELECT
  technology,
  total_interactions,
  total_unique_users,

  -- Ranking
  ROW_NUMBER() OVER (ORDER BY total_interactions DESC) AS demand_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interactions) * 100,
    2
  ) AS demand_percentile,

  -- Demand tier
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 5 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 15 THEN 'moderate_demand'
    ELSE 'niche_interest'
  END AS demand_tier,

  -- Learning recommendation
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 3 THEN 'master_this'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 10 THEN 'strengthen_skills'
    ELSE 'maintain_awareness'
  END AS learning_priority,

  -- Context
  domain_breakdown,
  source_breakdown,

  CURRENT_TIMESTAMP() AS generated_at

FROM tech_aggregated
ORDER BY demand_rank;
