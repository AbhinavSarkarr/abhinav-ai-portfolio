-- Layer 1: Base View - Client/Experience Events
-- Extracts client work and experience-related events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_client_events` AS
SELECT
  event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  event_name,

  -- Client details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'client_id') AS client_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'client_name') AS client_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'domain') AS domain,

  -- Experience details
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experience_id') AS experience_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experience_title') AS experience_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'company') AS company,

  -- Engagement metrics
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_spent_seconds') AS time_spent_seconds,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth_percent') AS scroll_depth_percent,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'read_time_seconds') AS read_time_seconds,

  -- Contribution tracking
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'contribution_index') AS contribution_index,

  -- Technology from client work
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'technology') AS technology,

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
  'client_view',
  'client_click',
  'client_case_study_open',
  'client_case_study_engagement',
  'domain_interest',
  'client_tech_stack_click',
  'experience_level_interest',
  'contribution_view',
  'problem_statement_read',
  'solution_read'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
