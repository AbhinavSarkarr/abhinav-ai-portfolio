-- Layer 1: Base View - Section Events
-- Extracts section visibility and engagement events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- Section details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'section_id') AS section_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'section_name') AS section_name,

  -- Engagement metrics (keys match actual GA4 data)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_spent_seconds') AS time_spent_seconds,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth_percent') AS scroll_depth_percent,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'value') AS engagement_value,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_milestone') AS scroll_milestone,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_threshold') AS time_threshold_sec,

  -- Navigation context
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'from_section') AS from_section,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'to_section') AS to_section,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'navigation_method') AS navigation_method,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN (
  'section_view',
  'section_engagement',
  'section_exit',
  'scroll',
  'scroll_milestone',
  'scroll_depth',
  'time_threshold',
  'navigation'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
