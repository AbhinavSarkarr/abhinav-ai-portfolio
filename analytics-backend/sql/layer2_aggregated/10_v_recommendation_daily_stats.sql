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

  -- Device breakdown
  COUNTIF(device_category = 'desktop' AND event_name = 'recommendation_click') AS desktop_clicks,
  COUNTIF(device_category = 'mobile' AND event_name = 'recommendation_click') AS mobile_clicks,

  -- Algorithm performance (NEW - from enhanced v_recommendation_events)
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND recommendation_algorithm = 'category_match') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND recommendation_algorithm = 'category_match'), 0),
    2
  ) AS category_match_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND recommendation_algorithm = 'tech_stack') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND recommendation_algorithm = 'tech_stack'), 0),
    2
  ) AS tech_stack_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND recommendation_algorithm = 'popularity') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND recommendation_algorithm = 'popularity'), 0),
    2
  ) AS popularity_ctr,

  -- Visibility impact (NEW)
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND is_above_fold = 'true') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND is_above_fold = 'true'), 0),
    2
  ) AS above_fold_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND is_above_fold = 'false') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND is_above_fold = 'false'), 0),
    2
  ) AS below_fold_ctr,

  -- Decision time (NEW)
  ROUND(AVG(CASE WHEN event_name = 'recommendation_click' THEN time_since_shown_sec END), 1) AS avg_time_to_click_sec,

  -- User context (NEW)
  ROUND(AVG(projects_viewed_before), 1) AS avg_projects_viewed_before_rec,
  COUNTIF(user_viewed_similar = 'true' AND event_name = 'recommendation_click') AS clicks_after_viewing_similar

FROM `portfolio-483605.analytics_processed.v_recommendation_events`
GROUP BY event_date
ORDER BY event_date DESC;
