-- Layer 1: Base View - Project Events
-- Extracts all project-related custom events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- Project details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'project_id') AS project_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'project_title') AS project_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'category') AS project_category,

  -- Interaction context
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'action') AS action_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'technology') AS technology,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'display_position') AS display_position,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'view_duration') AS view_duration_ms,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_page') AS time_on_page_sec,

  -- Link details (for click events)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_type') AS link_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,
  geo.city AS city,

  -- Traffic
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium

FROM `portfolio-483605.analytics_*.events_*`
WHERE event_name IN (
  'project_view',
  'project_click',
  'project_expand',
  'project_link_click',
  'technology_interest',
  'project_category_interest'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
