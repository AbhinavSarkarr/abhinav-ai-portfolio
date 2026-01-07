-- Layer 1: Base View - Skill Events
-- Extracts skill-related interaction events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- Skill details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'skill_name') AS skill_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'skill_category') AS skill_category,

  -- Context
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'context') AS interaction_context,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'skill_position') AS skill_position,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,
  geo.city AS city,

  -- Traffic
  traffic_source.source AS traffic_source

FROM `portfolio-483605.analytics_*.events_*`
WHERE event_name IN (
  'skill_click',
  'skill_category_view',
  'skill_hover'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
