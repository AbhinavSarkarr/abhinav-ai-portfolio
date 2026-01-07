-- Layer 3: Rankings View - Section Rankings
-- 7-day rolling section engagement rankings
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_rankings` AS
WITH section_7day AS (
  SELECT
    section_id,

    -- Aggregate 7-day metrics
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(engaged_views) AS total_engaged_views,
    AVG(engagement_rate) AS avg_engagement_rate,
    AVG(avg_view_duration_ms) AS avg_view_duration_ms,
    AVG(avg_scroll_depth) AS avg_scroll_depth,
    MAX(max_scroll_milestone) AS max_scroll_milestone,
    SUM(exits) AS total_exits,
    AVG(exit_rate) AS avg_exit_rate,

    -- Navigation flows
    ARRAY_CONCAT_AGG(top_navigation_flows) AS all_navigation_flows

  FROM `portfolio-483605.analytics_processed.v_section_daily_stats`
  WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  GROUP BY section_id
),

scored AS (
  SELECT
    *,
    -- Section health score
    (
      (avg_engagement_rate * 2) +  -- High engagement is good
      (avg_scroll_depth * 0.5) +   -- Scroll depth matters
      (100 - avg_exit_rate) * 0.3  -- Low exit rate is good
    ) AS health_score

  FROM section_7day
)

SELECT
  section_id,

  -- Metrics
  total_views,
  total_unique_viewers,
  total_engaged_views,
  ROUND(avg_engagement_rate, 2) AS avg_engagement_rate,
  ROUND(avg_view_duration_ms / 1000.0, 2) AS avg_view_duration_sec,
  ROUND(avg_scroll_depth, 2) AS avg_scroll_depth,
  max_scroll_milestone,
  total_exits,
  ROUND(avg_exit_rate, 2) AS avg_exit_rate,

  -- Scores
  ROUND(health_score, 2) AS health_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY health_score DESC) AS engagement_rank,
  ROW_NUMBER() OVER (ORDER BY total_views DESC) AS view_rank,
  ROW_NUMBER() OVER (ORDER BY avg_exit_rate ASC) AS retention_rank,

  -- Health tier
  CASE
    WHEN health_score >= 80 THEN 'excellent'
    WHEN health_score >= 60 THEN 'good'
    WHEN health_score >= 40 THEN 'needs_attention'
    ELSE 'critical'
  END AS health_tier,

  -- Drop-off indicator
  CASE
    WHEN avg_exit_rate > 50 THEN 'high_dropoff'
    WHEN avg_exit_rate > 30 THEN 'moderate_dropoff'
    ELSE 'low_dropoff'
  END AS dropoff_indicator,

  -- Optimization suggestions
  CASE
    WHEN avg_engagement_rate < 30 AND total_views > 100 THEN 'improve_content'
    WHEN avg_exit_rate > 50 THEN 'add_cta_or_navigation'
    WHEN avg_scroll_depth < 50 THEN 'hook_earlier'
    WHEN avg_view_duration_ms < 3000 THEN 'make_more_engaging'
    ELSE 'performing_well'
  END AS optimization_hint,

  -- Navigation context
  all_navigation_flows,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM scored
ORDER BY engagement_rank;
