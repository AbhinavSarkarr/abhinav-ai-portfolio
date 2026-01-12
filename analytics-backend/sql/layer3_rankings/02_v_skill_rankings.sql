-- Layer 3: Rankings View - Skill Rankings
-- 7-day rolling skill interest rankings
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_rankings` AS
WITH skill_7day AS (
  SELECT
    skill_name,
    skill_category,

    -- Aggregate 7-day metrics
    SUM(clicks) AS total_clicks,
    SUM(hovers) AS total_hovers,
    SUM(unique_users) AS total_unique_users,
    SUM(unique_sessions) AS total_unique_sessions,
    SUM(weighted_interest_score) AS total_interest_score

  FROM `portfolio-483605.analytics_processed.v_skill_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY skill_name, skill_category
)

SELECT
  skill_name,
  skill_category,

  -- Metrics
  total_clicks,
  total_hovers,
  total_unique_users,
  total_unique_sessions,
  total_interest_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY skill_category ORDER BY total_interest_score DESC) AS category_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100,
    2
  ) AS interest_percentile,

  -- Interest tier
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 15 THEN 'moderate_demand'
    ELSE 'low_demand'
  END AS demand_tier,

  -- Learning recommendation (skills to focus on)
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5 THEN 'maintain_expertise'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 10 THEN 'showcase_more'
    ELSE 'consider_highlighting'
  END AS recommendation,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM skill_7day
ORDER BY overall_rank;
