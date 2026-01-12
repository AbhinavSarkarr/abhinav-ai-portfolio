-- Layer 3: Rankings View - Domain/Industry Rankings
-- 7-day rolling domain interest rankings
-- Answers: Which industries are visitors most interested in?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_domain_rankings` AS
WITH domain_7day AS (
  SELECT
    domain,

    -- Aggregate 7-day metrics
    SUM(explicit_interest_signals) AS total_explicit_interest,
    SUM(implicit_interest_from_views) AS total_implicit_interest,
    SUM(total_domain_interactions) AS total_interactions,
    SUM(unique_interested_users) AS total_unique_users,
    SUM(domain_interest_score) AS total_interest_score

  FROM `portfolio-483605.analytics_processed.v_domain_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY domain
)

SELECT
  domain,

  -- Metrics
  total_explicit_interest,
  total_implicit_interest,
  total_interactions,
  total_unique_users,
  total_interest_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS interest_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100,
    2
  ) AS interest_percentile,

  -- Market demand tier
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 2 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 4 THEN 'moderate_demand'
    ELSE 'niche_interest'
  END AS demand_tier,

  -- Career insight
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) = 1 THEN 'primary_strength'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 3 THEN 'showcase_more'
    ELSE 'consider_expanding'
  END AS portfolio_recommendation,

  CURRENT_TIMESTAMP() AS ranked_at

FROM domain_7day
ORDER BY interest_rank;
