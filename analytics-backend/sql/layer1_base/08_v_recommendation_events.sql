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

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,

  -- Traffic
  traffic_source.source AS traffic_source

FROM `portfolio-483605.analytics_*.events_*`
WHERE event_name IN (
  'recommendation_shown',
  'recommendation_click'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
