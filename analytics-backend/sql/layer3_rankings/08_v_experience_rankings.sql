-- Layer 3: Rankings View - Experience/Role Rankings
-- 7-day rolling experience level interest rankings
-- Answers: Which job titles/roles attract the most attention?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_experience_rankings` AS
WITH experience_7day AS (
  SELECT
    experience_id,
    experience_title,
    company,

    -- Aggregate 7-day metrics
    SUM(total_interactions) AS total_interactions,
    SUM(unique_interested_users) AS total_unique_users,
    SUM(unique_sessions) AS total_sessions

  FROM `portfolio-483605.analytics_processed.v_experience_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY experience_id, experience_title, company
)

SELECT
  experience_id,
  experience_title,
  company,

  -- Metrics
  total_interactions,
  total_unique_users,
  total_sessions,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY total_interactions DESC) AS interest_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interactions) * 100,
    2
  ) AS interest_percentile,

  -- Insights
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) = 1 THEN 'most_attractive_role'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 3 THEN 'high_interest_role'
    ELSE 'moderate_interest'
  END AS role_attractiveness,

  -- Career positioning suggestion
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) = 1 THEN 'lead_with_this'
    WHEN total_unique_users > 5 THEN 'highlight_prominently'
    ELSE 'include_for_context'
  END AS positioning_suggestion,

  CURRENT_TIMESTAMP() AS ranked_at

FROM experience_7day
ORDER BY interest_rank;
