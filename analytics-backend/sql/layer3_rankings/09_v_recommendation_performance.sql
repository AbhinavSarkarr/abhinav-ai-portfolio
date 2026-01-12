-- Layer 3: Insights View - Recommendation System Performance
-- 7-day rolling recommendation system analytics
-- Answers: How well is the recommendation system performing?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendation_performance` AS
WITH rec_7day AS (
  SELECT
    SUM(total_impressions) AS total_impressions,
    SUM(total_clicks) AS total_clicks,
    SUM(unique_users_shown_recs) AS total_users_shown,
    SUM(unique_users_clicked) AS total_users_clicked,

    -- Position-level aggregation
    AVG(position_1_ctr) AS avg_position_1_ctr,
    AVG(position_2_ctr) AS avg_position_2_ctr,
    AVG(position_3_ctr) AS avg_position_3_ctr

  FROM `portfolio-483605.analytics_processed.v_recommendation_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
),

project_performance AS (
  SELECT
    recommended_project_id,
    recommended_project_title,
    COUNTIF(event_name = 'recommendation_shown') AS impressions,
    COUNTIF(event_name = 'recommendation_click') AS clicks,
    ROUND(
      COUNTIF(event_name = 'recommendation_click') * 100.0 /
      NULLIF(COUNTIF(event_name = 'recommendation_shown'), 0),
      2
    ) AS ctr
  FROM `portfolio-483605.analytics_processed.v_recommendation_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY recommended_project_id, recommended_project_title
),

source_performance AS (
  SELECT
    source_project_id,
    COUNTIF(event_name = 'recommendation_click') AS clicks_generated,
    COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN recommended_project_id END) AS unique_projects_clicked
  FROM `portfolio-483605.analytics_processed.v_recommendation_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY source_project_id
)

SELECT
  -- Overall metrics
  r.total_impressions,
  r.total_clicks,
  ROUND(r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0), 2) AS overall_ctr,
  r.total_users_shown,
  r.total_users_clicked,
  ROUND(r.total_users_clicked * 100.0 / NULLIF(r.total_users_shown, 0), 2) AS user_conversion_rate,

  -- Position performance
  ROUND(r.avg_position_1_ctr, 2) AS position_1_ctr,
  ROUND(r.avg_position_2_ctr, 2) AS position_2_ctr,
  ROUND(r.avg_position_3_ctr, 2) AS position_3_ctr,

  -- Best position insight
  CASE
    WHEN r.avg_position_1_ctr >= GREATEST(r.avg_position_2_ctr, r.avg_position_3_ctr) THEN 'Position 1 performs best'
    WHEN r.avg_position_2_ctr >= r.avg_position_3_ctr THEN 'Position 2 performs best'
    ELSE 'Position 3 performs best'
  END AS best_position_insight,

  -- Top recommended projects (best CTR)
  ARRAY(
    SELECT AS STRUCT recommended_project_id, recommended_project_title, impressions, clicks, ctr
    FROM project_performance
    WHERE impressions >= 5  -- Minimum impressions for reliability
    ORDER BY ctr DESC
    LIMIT 5
  ) AS top_performing_recommendations,

  -- Top source projects (drive most clicks)
  ARRAY(
    SELECT AS STRUCT source_project_id, clicks_generated, unique_projects_clicked
    FROM source_performance
    ORDER BY clicks_generated DESC
    LIMIT 5
  ) AS top_recommendation_drivers,

  -- System health
  CASE
    WHEN r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0) >= 10 THEN 'excellent'
    WHEN r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0) >= 5 THEN 'good'
    WHEN r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0) >= 2 THEN 'needs_improvement'
    ELSE 'underperforming'
  END AS system_health,

  CURRENT_TIMESTAMP() AS generated_at

FROM rec_7day r;
