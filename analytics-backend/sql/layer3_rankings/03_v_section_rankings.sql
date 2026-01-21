-- Layer 3: Rankings View - Section Rankings
-- 7-day rolling section engagement rankings
-- Uses UNIQUE metrics for funnel analysis (exit rate should be <=100%)
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_rankings` AS
WITH section_7day AS (
  SELECT
    section_id,

    -- Unique metrics (for funnel analysis - each session counts once)
    SUM(unique_views) AS total_unique_views,
    SUM(unique_exits) AS total_unique_exits,
    AVG(unique_exit_rate) AS avg_exit_rate,  -- This is the meaningful exit rate

    -- Total metrics (for engagement analysis - includes revisits)
    SUM(total_views) AS total_views,
    SUM(total_exits) AS total_exits,
    AVG(total_exit_rate) AS avg_total_exit_rate,
    AVG(avg_revisits_per_session) AS avg_revisits,

    -- Other aggregated metrics
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(engaged_sessions) AS total_engaged_sessions,
    AVG(engagement_rate) AS avg_engagement_rate,
    AVG(avg_time_spent_seconds) AS avg_time_spent_seconds,
    AVG(avg_scroll_depth_percent) AS avg_scroll_depth_percent,
    MAX(max_scroll_milestone) AS max_scroll_milestone

  FROM `portfolio-483605.analytics_processed.v_section_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY section_id
),

scored AS (
  SELECT
    *,
    -- Section health score (re-duplication fix ensures exit_rate <= 100%)
    (
      (avg_engagement_rate * 2) +  -- High engagement is good
      (avg_scroll_depth_percent * 0.5) +   -- Scroll depth matters
      (100 - avg_exit_rate) * 0.3  -- Low exit rate is good
    ) AS health_score

  FROM section_7day
)

SELECT
  section_id,

  -- Unique metrics (for funnel analysis)
  total_unique_views,
  total_unique_exits,
  total_unique_viewers,
  -- Re-duplication fix ensures this is always <= 100%
  ROUND(avg_exit_rate, 2) AS avg_exit_rate,

  -- Total metrics (for engagement/stickiness analysis)
  total_views,
  total_exits,
  ROUND(avg_total_exit_rate, 2) AS avg_total_exit_rate,
  ROUND(avg_revisits, 2) AS avg_revisits_per_session,

  -- Engagement metrics
  total_engaged_sessions,
  ROUND(avg_engagement_rate, 2) AS avg_engagement_rate,
  ROUND(avg_time_spent_seconds, 2) AS avg_time_spent_seconds,
  ROUND(avg_scroll_depth_percent, 2) AS avg_scroll_depth_percent,
  max_scroll_milestone,

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
    WHEN avg_scroll_depth_percent < 50 THEN 'hook_earlier'
    WHEN avg_time_spent_seconds < 3 THEN 'make_more_engaging'
    ELSE 'performing_well'
  END AS optimization_hint,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM scored
ORDER BY engagement_rank;
