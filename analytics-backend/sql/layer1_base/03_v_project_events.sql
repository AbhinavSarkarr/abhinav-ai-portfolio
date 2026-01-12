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

  -- Project view context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_first_view') AS is_first_view,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_viewed_before') AS projects_viewed_before,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'was_recommended') AS was_recommended,

  -- Click behavior (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'hover_duration_seconds') AS hover_duration_sec,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_clicked_before') AS projects_clicked_before,

  -- Skill-to-project journey (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_from_skill_click') AS is_from_skill_click,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'source_skill') AS source_skill,

  -- Case study engagement (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth_percent') AS scroll_depth_percent,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'sections_read_count') AS sections_read_count,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'completion_rate') AS completion_rate,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_deep_read') AS is_deep_read,

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

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN (
  'project_view',
  'project_click',
  'project_expand',
  'project_link_click',
  'case_study_open',
  'case_study_engagement',
  'technology_interest',
  'project_category_interest'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
