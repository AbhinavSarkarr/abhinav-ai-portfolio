-- Layer 1: Base View - Page Views
-- Extracts page view events with detailed context
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_page_views` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,

  -- Page info
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,

  -- Extract section from URL hash
  REGEXP_EXTRACT(
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
    r'#([a-zA-Z0-9_-]+)'
  ) AS section_hash,

  -- Engagement
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec') AS engagement_time_msec,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'entrances') AS is_entrance,

  -- Device
  device.category AS device_category,
  device.browser AS browser,
  device.operating_system AS os,

  -- Geo
  geo.country AS country,
  geo.city AS city,

  -- Traffic
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name = 'page_view'
  AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
