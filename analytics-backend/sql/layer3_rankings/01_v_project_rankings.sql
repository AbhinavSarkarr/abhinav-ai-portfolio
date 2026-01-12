-- Layer 3: Rankings View - Project Rankings
-- 7-day rolling project rankings for portfolio reordering
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_rankings` AS
WITH project_7day AS (
  SELECT
    project_id,
    project_title,
    project_category,

    -- Aggregate 7-day metrics
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(clicks) AS total_clicks,
    SUM(expands) AS total_expands,
    SUM(link_clicks) AS total_link_clicks,
    AVG(avg_view_duration_ms) AS avg_view_duration_ms,
    AVG(click_through_rate) AS avg_ctr,
    SUM(github_clicks) AS total_github_clicks,
    SUM(demo_clicks) AS total_demo_clicks,

    -- Technology aggregation
    ARRAY_CONCAT_AGG(technologies_clicked) AS all_technologies_clicked

  FROM `portfolio-483605.analytics_processed.v_project_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY project_id, project_title, project_category
),

scored AS (
  SELECT
    *,

    -- Engagement Score (weighted composite)
    (
      -- Views (normalized weight: 1x)
      (total_views * 1.0) +
      -- Unique viewers (weight: 2x, quality matters)
      (total_unique_viewers * 2.0) +
      -- Clicks (weight: 3x, active interest)
      (total_clicks * 3.0) +
      -- Expands (weight: 4x, deep interest)
      (total_expands * 4.0) +
      -- Link clicks (weight: 5x, strongest signal)
      (total_link_clicks * 5.0) +
      -- GitHub clicks (weight: 6x, developer interest)
      (total_github_clicks * 6.0) +
      -- Demo clicks (weight: 7x, highest intent)
      (total_demo_clicks * 7.0) +
      -- View duration bonus (normalized)
      (COALESCE(avg_view_duration_ms, 0) / 1000.0 * 0.5) +
      -- CTR bonus
      (COALESCE(avg_ctr, 0) * 2.0)
    ) AS raw_engagement_score

  FROM project_7day
)

SELECT
  project_id,
  project_title,
  project_category,

  -- Metrics
  total_views,
  total_unique_viewers,
  total_clicks,
  total_expands,
  total_link_clicks,
  total_github_clicks,
  total_demo_clicks,
  ROUND(avg_view_duration_ms / 1000.0, 2) AS avg_view_duration_sec,
  ROUND(avg_ctr, 2) AS avg_ctr_percent,

  -- Scores
  ROUND(raw_engagement_score, 2) AS engagement_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY project_category ORDER BY raw_engagement_score DESC) AS category_rank,

  -- Percentile (for normalization)
  ROUND(
    PERCENT_RANK() OVER (ORDER BY raw_engagement_score) * 100,
    2
  ) AS engagement_percentile,

  -- Trend indicator (would need previous period for real trend)
  CASE
    WHEN raw_engagement_score > (
      SELECT AVG(raw_engagement_score) FROM scored
    ) THEN 'above_average'
    ELSE 'below_average'
  END AS performance_tier,

  -- Technologies driving interest
  all_technologies_clicked,

  -- Recommended display position (based on rank)
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 3 THEN 'featured'
    WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 6 THEN 'primary'
    ELSE 'secondary'
  END AS recommended_position,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM scored
ORDER BY overall_rank;
