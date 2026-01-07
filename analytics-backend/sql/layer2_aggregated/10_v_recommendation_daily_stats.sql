-- Layer 2: Aggregated View - Recommendation System Daily Stats
-- Recommendation performance metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendation_daily_stats` AS
SELECT
  event_date,

  -- Overall metrics
  COUNTIF(event_name = 'recommendation_shown') AS total_impressions,
  COUNTIF(event_name = 'recommendation_click') AS total_clicks,
  COUNT(DISTINCT user_pseudo_id) AS unique_users_shown_recs,
  COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN user_pseudo_id END) AS unique_users_clicked,

  -- Click-through rate
  ROUND(
    COUNTIF(event_name = 'recommendation_click') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown'), 0),
    2
  ) AS overall_ctr,

  -- Position performance
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND position = 1) * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND position = 1), 0),
    2
  ) AS position_1_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND position = 2) * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND position = 2), 0),
    2
  ) AS position_2_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND position = 3) * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND position = 3), 0),
    2
  ) AS position_3_ctr,

  -- Top performing recommended projects
  ARRAY_AGG(
    STRUCT(
      recommended_project_id,
      recommended_project_title,
      COUNTIF(event_name = 'recommendation_shown') AS impressions,
      COUNTIF(event_name = 'recommendation_click') AS clicks
    )
    ORDER BY COUNTIF(event_name = 'recommendation_click') DESC
    LIMIT 5
  ) AS top_recommended_projects,

  -- Top source projects (which projects drive most rec clicks)
  ARRAY_AGG(
    STRUCT(
      source_project_id,
      COUNTIF(event_name = 'recommendation_click') AS clicks_generated
    )
    ORDER BY COUNTIF(event_name = 'recommendation_click') DESC
    LIMIT 5
  ) AS top_source_projects,

  -- Device breakdown
  COUNTIF(device_category = 'desktop' AND event_name = 'recommendation_click') AS desktop_clicks,
  COUNTIF(device_category = 'mobile' AND event_name = 'recommendation_click') AS mobile_clicks

FROM `portfolio-483605.analytics_processed.v_recommendation_events`
GROUP BY event_date
ORDER BY event_date DESC;
