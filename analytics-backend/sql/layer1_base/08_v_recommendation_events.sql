-- Layer 1: Base View - Recommendation Events
-- Extracts recommendation system interaction events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendation_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- Recommendation details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'recommended_project_id') AS recommended_project_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'recommended_project_title') AS recommended_project_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'source_project_id') AS source_project_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'position') AS position,

  -- Recommendation context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'recommendation_algorithm') AS recommendation_algorithm,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'context_category') AS context_category,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'user_viewed_similar') AS user_viewed_similar,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'total_recommendations_shown') AS total_recommendations_shown,

  -- Click behavior (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_since_shown') AS time_since_shown_sec,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'was_above_fold') AS was_above_fold,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_above_fold') AS is_above_fold,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_viewed_before') AS projects_viewed_before,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,

  -- Traffic
  traffic_source.source AS traffic_source

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN (
  'recommendation_shown',
  'recommendation_click'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
