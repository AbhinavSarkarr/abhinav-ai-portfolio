-- Layer 1: Base View - Certification Events
-- Extracts certification interaction events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_certification_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- Certification details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cert_title') AS cert_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cert_issuer') AS cert_issuer,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,

  -- Traffic
  traffic_source.source AS traffic_source

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name = 'certification_click'
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
