-- Layer 1: Base View - Conversion Events
-- Extracts conversion and CTA-related events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_conversion_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- CTA details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_name') AS cta_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_location') AS cta_location,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_text') AS cta_text,

  -- Contact form
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'form_name') AS form_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'form_step') AS form_step,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'form_field') AS form_field,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'submission_status') AS submission_status,

  -- Outbound links
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_text') AS link_text,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_domain') AS link_domain,

  -- Resume/downloads
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'file_name') AS file_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'file_type') AS file_type,

  -- Social
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'social_platform') AS social_platform,

  -- Exit intent
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'last_section') AS exit_last_section,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_page') AS exit_time_on_page,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth') AS exit_scroll_depth,

  -- Copy events
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'content_type') AS copied_content_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'content_snippet') AS copied_content,

  -- Publication
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'publication_title') AS publication_title,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,
  geo.city AS city,

  -- Traffic
  traffic_source.source AS traffic_source,
  traffic_source.medium AS traffic_medium

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN (
  'cta_click',
  'cta_view',
  'contact_form_start',
  'contact_form_field_focus',
  'contact_form_submit',
  'outbound_link',
  'social_click',
  'resume_download',
  'file_download',
  'exit_intent',
  'content_copy',
  'publication_click'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
