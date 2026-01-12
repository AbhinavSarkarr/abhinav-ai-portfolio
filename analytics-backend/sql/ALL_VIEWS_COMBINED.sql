-- Layer 1: Base View - Sessions (Enhanced)
-- Extracts session-level data from GA4 events
-- Includes: returning visitor data, engagement scores, user preferences, temporal patterns
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_sessions` AS
WITH session_data AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    MIN(TIMESTAMP_MICROS(event_timestamp)) AS session_start,
    MAX(TIMESTAMP_MICROS(event_timestamp)) AS session_end,

    -- Device info (GA4 built-in)
    device.category AS device_category,
    device.operating_system AS os,
    device.browser AS browser,
    device.is_limited_ad_tracking AS limited_ad_tracking,
    device.mobile_brand_name AS mobile_brand,
    device.mobile_model_name AS mobile_model,
    device.language AS device_language,

    -- Geo info (GA4 built-in)
    geo.country AS country,
    geo.region AS region,
    geo.city AS city,
    geo.continent AS continent,

    -- Traffic source (GA4 built-in)
    traffic_source.source AS source,
    traffic_source.medium AS traffic_medium,
    traffic_source.name AS campaign_name,

    -- Session metrics (event counts)
    COUNT(*) AS total_events,
    COUNTIF(event_name = 'page_view') AS page_views,
    COUNTIF(event_name = 'scroll') AS scroll_events,
    COUNTIF(event_name = 'click') AS click_events,

    -- Engagement signals (GA4 built-in)
    MAX((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engaged_session_event')) AS engaged_session,
    MAX((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) AS max_engagement_time_msec,

    -- First page
    MIN(CASE WHEN event_name = 'page_view'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')
        END) AS landing_page,

    -- Last page
    MAX(CASE WHEN event_name = 'page_view'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')
        END) AS exit_page,

    -- =====================================================
    -- HIGH PRIORITY: Returning Visitor Data (from session_start event)
    -- =====================================================
    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'visit_count')
        END) AS visit_count,

    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'days_since_last_visit')
        END) AS days_since_last_visit,

    MAX(CASE WHEN event_name = 'session_start'
        THEN CAST((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_returning') AS BOOL)
        END) AS is_returning,

    -- =====================================================
    -- HIGH PRIORITY: Engagement Summary (from session_end event)
    -- =====================================================
    MAX(CASE WHEN event_name = 'session_end'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_score')
        END) AS engagement_score,

    MAX(CASE WHEN event_name = 'session_end'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'engagement_level')
        END) AS engagement_level,

    MAX(CASE WHEN event_name = 'session_end'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'max_scroll_depth')
        END) AS max_scroll_depth,

    MAX(CASE WHEN event_name = 'session_end'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'sections_viewed_count')
        END) AS sections_viewed_count,

    MAX(CASE WHEN event_name = 'session_end'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_clicked_count')
        END) AS projects_clicked_count,

    MAX(CASE WHEN event_name = 'session_end'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'conversions_count')
        END) AS conversions_count,

    -- =====================================================
    -- MEDIUM PRIORITY: Time Context (from session_start event)
    -- =====================================================
    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'day_of_week')
        END) AS day_of_week_name,

    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'hour_of_day')
        END) AS hour_of_day,

    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'local_timezone')
        END) AS local_timezone,

    -- =====================================================
    -- MEDIUM PRIORITY: User Preferences (from session_start event)
    -- =====================================================
    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'color_scheme')
        END) AS color_scheme,

    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'language')
        END) AS user_language,

    MAX(CASE WHEN event_name = 'session_start'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'connection_type')
        END) AS connection_type

  FROM `portfolio-483605.analytics_518701756.events_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
  GROUP BY
    user_pseudo_id,
    session_id,
    device.category,
    device.operating_system,
    device.browser,
    device.is_limited_ad_tracking,
    device.mobile_brand_name,
    device.mobile_model_name,
    device.language,
    geo.country,
    geo.region,
    geo.city,
    geo.continent,
    traffic_source.source,
    traffic_source.medium,
    traffic_source.name
)

SELECT
  -- All base fields
  user_pseudo_id,
  session_id,
  session_start,
  session_end,

  -- Device
  device_category,
  os,
  browser,
  limited_ad_tracking,
  mobile_brand,
  mobile_model,
  device_language,

  -- Geo
  country,
  region,
  city,
  continent,

  -- Traffic
  source AS traffic_source,
  traffic_medium,
  campaign_name,

  -- Event counts
  total_events,
  page_views,
  scroll_events,
  click_events,

  -- GA4 engagement
  engaged_session,
  max_engagement_time_msec,

  -- Pages
  landing_page,
  exit_page,

  -- HIGH PRIORITY: Returning visitor
  COALESCE(visit_count, 1) AS visit_count,
  COALESCE(days_since_last_visit, 0) AS days_since_last_visit,
  COALESCE(is_returning, FALSE) AS is_returning,

  -- HIGH PRIORITY: Engagement summary
  COALESCE(engagement_score, 0) AS engagement_score,
  COALESCE(engagement_level, 'unknown') AS engagement_level,
  COALESCE(max_scroll_depth, 0) AS max_scroll_depth,
  COALESCE(sections_viewed_count, 0) AS sections_viewed_count,
  COALESCE(projects_clicked_count, 0) AS projects_clicked_count,
  COALESCE(conversions_count, 0) AS conversions_count,

  -- MEDIUM PRIORITY: Time context
  day_of_week_name,
  hour_of_day,
  local_timezone,

  -- MEDIUM PRIORITY: User preferences
  color_scheme,
  user_language,
  connection_type,

  -- Computed fields
  TIMESTAMP_DIFF(session_end, session_start, SECOND) AS session_duration_seconds,
  DATE(session_start) AS session_date,
  EXTRACT(HOUR FROM session_start) AS session_hour,
  EXTRACT(DAYOFWEEK FROM session_start) AS session_day_of_week,

  -- Bounce detection
  CASE
    WHEN page_views = 1 THEN TRUE
    ELSE FALSE
  END AS is_bounce,

  -- Engaged session detection
  CASE
    WHEN engaged_session = 1 OR TIMESTAMP_DIFF(session_end, session_start, SECOND) > 10 THEN TRUE
    ELSE FALSE
  END AS is_engaged,

  -- Engagement tier (computed from score)
  CASE
    WHEN COALESCE(engagement_score, 0) >= 75 THEN 'very_high'
    WHEN COALESCE(engagement_score, 0) >= 50 THEN 'high'
    WHEN COALESCE(engagement_score, 0) >= 25 THEN 'medium'
    ELSE 'low'
  END AS engagement_tier,

  -- Visitor type
  CASE
    WHEN COALESCE(visit_count, 1) = 1 THEN 'new'
    WHEN COALESCE(visit_count, 1) BETWEEN 2 AND 3 THEN 'returning'
    ELSE 'loyal'
  END AS visitor_type,

  -- Has conversion
  CASE
    WHEN COALESCE(conversions_count, 0) > 0 THEN TRUE
    ELSE FALSE
  END AS has_conversion

FROM session_data
WHERE session_id IS NOT NULL;
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

  -- Navigation context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'previous_page') AS previous_page,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_type') AS page_type,

  -- Session depth (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'page_number') AS page_number,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_previous_page') AS time_on_previous_page_sec,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_since_session_start') AS time_since_session_start_sec,

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

  -- Section flow context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'entry_direction') AS entry_direction,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'previous_section') AS previous_section,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'section_position') AS section_position,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'exit_direction') AS exit_direction,

  -- Scroll behavior analysis (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_velocity') AS scroll_velocity,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_to_reach_depth') AS time_to_reach_depth_sec,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_bouncing') AS is_bouncing,

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

  -- Skill engagement context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'skill_level') AS skill_level,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'related_projects_count') AS related_projects_count,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_site') AS time_on_site_sec,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_viewed_before') AS projects_viewed_before,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'sections_viewed') AS sections_viewed,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'was_in_viewport') AS was_in_viewport,

  -- Device
  device.category AS device_category,
  device.browser AS browser,

  -- Geo
  geo.country AS country,
  geo.city AS city,

  -- Traffic
  traffic_source.source AS traffic_source

FROM `portfolio-483605.analytics_518701756.events_*`
WHERE event_name IN (
  'skill_click',
  'skill_category_view',
  'skill_hover'
)
AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY));
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

  -- Conversion context (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_site_before_start') AS time_on_site_before_start,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'sections_viewed') AS sections_viewed,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_viewed') AS projects_viewed,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'projects_clicked_before') AS projects_clicked_before,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'scroll_depth_at_start') AS scroll_depth_at_start,

  -- Form engagement (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'message_length') AS message_length,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_to_submit') AS time_to_submit_sec,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_returning_visitor') AS is_returning_visitor,

  -- Download context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'download_source') AS download_source,

  -- Exit behavior (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'exit_trigger') AS exit_trigger,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'was_idle') AS was_idle,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'conversions_count') AS conversions_count,

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

  -- Client engagement context (NEW)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_first_view') AS is_first_view,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'clients_viewed_before') AS clients_viewed_before,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_deep_read') AS is_deep_read,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'completion_rate') AS completion_rate,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'was_recommended') AS was_recommended,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'contributions_read_count') AS contributions_read_count,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_since_session_start') AS time_since_session_start,

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

  -- Certification context (NEW)
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'cert_year') AS cert_year,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'is_expired') AS is_expired,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cert_category') AS cert_category,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'time_on_site') AS time_on_site_sec,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'current_section') AS current_section,

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
-- Layer 2: Aggregated View - Daily Metrics
-- Overall site metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_daily_metrics` AS
SELECT
  session_date,

  -- Session metrics
  COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)) AS total_sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  SUM(page_views) AS total_page_views,
  AVG(page_views) AS avg_pages_per_session,

  -- Engagement
  COUNTIF(is_engaged) AS engaged_sessions,
  ROUND(COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
  COUNTIF(is_bounce) AS bounces,
  ROUND(COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,
  AVG(session_duration_seconds) AS avg_session_duration_sec,
  AVG(max_engagement_time_msec / 1000.0) AS avg_engagement_time_sec,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_sessions,
  COUNTIF(device_category = 'mobile') AS mobile_sessions,
  COUNTIF(device_category = 'tablet') AS tablet_sessions,

  -- Time patterns
  ROUND(AVG(session_hour), 1) AS avg_session_hour,

  -- Engagement score metrics (NEW - from enhanced v_sessions)
  ROUND(AVG(engagement_score), 1) AS avg_engagement_score,
  COUNTIF(engagement_level = 'very_high') AS very_high_engagement_sessions,
  COUNTIF(engagement_level = 'high') AS high_engagement_sessions,
  COUNTIF(engagement_level = 'medium') AS medium_engagement_sessions,
  COUNTIF(engagement_level = 'low') AS low_engagement_sessions,

  -- Returning visitor metrics (NEW)
  COUNTIF(is_returning = true) AS returning_visitor_sessions,
  ROUND(COUNTIF(is_returning = true) * 100.0 / NULLIF(COUNT(*), 0), 2) AS returning_visitor_rate,
  AVG(CASE WHEN is_returning = true THEN visit_count END) AS avg_visit_count_returning,

  -- User preferences (NEW)
  COUNTIF(color_scheme = 'dark') AS dark_mode_sessions,
  COUNTIF(color_scheme = 'light') AS light_mode_sessions,
  ROUND(COUNTIF(color_scheme = 'dark') * 100.0 / NULLIF(COUNT(*), 0), 2) AS dark_mode_percentage,

  -- Connection quality (NEW)
  COUNTIF(connection_type = '4g') AS sessions_4g,
  COUNTIF(connection_type = 'wifi') AS sessions_wifi,
  COUNTIF(connection_type IN ('3g', '2g')) AS sessions_slow_connection

FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY session_date
ORDER BY session_date DESC;
-- Layer 2: Aggregated View - Project Daily Stats
-- Project engagement metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_daily_stats` AS
SELECT
  event_date,
  project_id,
  project_title,
  project_category,

  -- View metrics
  COUNTIF(event_name = 'project_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Click metrics
  COUNTIF(event_name = 'project_click') AS clicks,
  COUNTIF(event_name IN ('project_expand', 'case_study_open')) AS expands,
  COUNTIF(event_name = 'project_link_click') AS link_clicks,
  COUNTIF(event_name = 'case_study_engagement') AS case_study_engagements,

  -- Engagement
  AVG(view_duration_ms) AS avg_view_duration_ms,
  AVG(time_on_page_sec) AS avg_time_on_page_sec,

  -- Click-through rate
  ROUND(
    COUNTIF(event_name IN ('project_click', 'project_expand', 'case_study_open', 'project_link_click')) * 100.0 /
    NULLIF(COUNTIF(event_name = 'project_view'), 0),
    2
  ) AS click_through_rate,

  -- Technology interests
  ARRAY_AGG(
    DISTINCT technology IGNORE NULLS
    ORDER BY technology
    LIMIT 10
  ) AS technologies_clicked,

  -- Link types clicked
  COUNTIF(link_type = 'github') AS github_clicks,
  COUNTIF(link_type = 'demo') AS demo_clicks,
  COUNTIF(link_type = 'external') AS external_clicks,

  -- Position impact
  AVG(display_position) AS avg_display_position,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_interactions,
  COUNTIF(device_category = 'mobile') AS mobile_interactions,

  -- First view & discovery metrics (NEW - from enhanced v_project_events)
  COUNTIF(is_first_view = 'true') AS first_time_views,
  ROUND(AVG(projects_viewed_before), 1) AS avg_projects_viewed_before,

  -- Recommendation performance (NEW)
  COUNTIF(was_recommended = 'true') AS recommended_project_views,
  ROUND(COUNTIF(was_recommended = 'true') * 100.0 / NULLIF(COUNTIF(event_name = 'project_view'), 0), 2) AS recommended_view_rate,

  -- Click behavior (NEW)
  ROUND(AVG(hover_duration_sec), 1) AS avg_hover_duration_sec,
  COUNTIF(projects_clicked_before = 0) AS first_project_clicks,

  -- Skill-to-project journey (NEW)
  COUNTIF(is_from_skill_click = 'true') AS skill_driven_clicks,
  ROUND(COUNTIF(is_from_skill_click = 'true') * 100.0 / NULLIF(COUNTIF(event_name = 'project_click'), 0), 2) AS skill_driven_click_rate,
  ARRAY_AGG(DISTINCT source_skill IGNORE NULLS ORDER BY source_skill LIMIT 10) AS source_skills,

  -- Case study engagement quality (NEW)
  COUNTIF(is_deep_read = 'true') AS deep_reads,
  ROUND(AVG(scroll_depth_percent), 1) AS avg_case_study_scroll_depth,
  ROUND(AVG(completion_rate), 1) AS avg_case_study_completion_rate,
  ROUND(AVG(sections_read_count), 1) AS avg_sections_read

FROM `portfolio-483605.analytics_processed.v_project_events`
WHERE project_id IS NOT NULL
GROUP BY event_date, project_id, project_title, project_category
ORDER BY event_date DESC, views DESC;
-- Layer 2: Aggregated View - Section Daily Stats
-- Section engagement metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_daily_stats` AS
SELECT
  event_date,
  section_id,

  -- View metrics
  COUNTIF(event_name = 'section_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Engagement metrics
  COUNTIF(event_name = 'section_engagement') AS engaged_views,
  ROUND(
    COUNTIF(event_name = 'section_engagement') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0),
    2
  ) AS engagement_rate,

  -- Time spent
  AVG(time_spent_seconds) AS avg_time_spent_seconds,
  MAX(time_threshold_sec) AS max_time_threshold_reached,

  -- Scroll depth
  AVG(scroll_depth_percent) AS avg_scroll_depth_percent,
  MAX(scroll_milestone) AS max_scroll_milestone,

  -- Exit rate from this section
  COUNTIF(event_name = 'section_exit') AS exits,
  ROUND(
    COUNTIF(event_name = 'section_exit') * 100.0 /
    NULLIF(COUNTIF(event_name = 'section_view'), 0),
    2
  ) AS exit_rate,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views,

  -- Section flow context (NEW - from enhanced v_section_events)
  COUNTIF(entry_direction = 'down') AS entries_from_above,
  COUNTIF(entry_direction = 'up') AS entries_from_below,
  COUNTIF(exit_direction = 'down') AS continued_to_next,
  COUNTIF(exit_direction = 'up') AS went_back_up,
  ROUND(COUNTIF(exit_direction = 'down') * 100.0 / NULLIF(COUNTIF(event_name = 'section_exit'), 0), 2) AS continue_rate,

  -- Section position analysis (NEW)
  ROUND(AVG(section_position), 1) AS avg_section_position,

  -- Scroll behavior analysis (NEW)
  ROUND(AVG(scroll_velocity), 1) AS avg_scroll_velocity,
  ROUND(AVG(time_to_reach_depth_sec), 1) AS avg_time_to_scroll_depth,
  COUNTIF(is_bouncing = 'true') AS bouncing_sessions,
  ROUND(COUNTIF(is_bouncing = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate_from_section,

FROM `portfolio-483605.analytics_processed.v_section_events`
WHERE section_id IS NOT NULL
GROUP BY event_date, section_id
ORDER BY event_date DESC, views DESC;
-- Layer 2: Aggregated View - Skill Daily Stats
-- Skill interest metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_daily_stats` AS
SELECT
  event_date,
  skill_name,
  skill_category,

  -- Interaction metrics
  COUNTIF(event_name = 'skill_click') AS clicks,
  COUNTIF(event_name = 'skill_hover') AS hovers,
  COUNT(DISTINCT user_pseudo_id) AS unique_users,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Category views (when category is shown)
  COUNTIF(event_name = 'skill_category_view') AS category_views,

  -- Interest score (weighted)
  (COUNTIF(event_name = 'skill_click') * 3 +
   COUNTIF(event_name = 'skill_hover') * 1) AS weighted_interest_score,

  -- Position impact
  AVG(skill_position) AS avg_position,

  -- Skill level distribution (NEW - from enhanced v_skill_events)
  COUNTIF(skill_level = 'advanced') AS advanced_skill_clicks,
  COUNTIF(skill_level = 'intermediate') AS intermediate_skill_clicks,
  COUNTIF(skill_level = 'beginner') AS beginner_skill_clicks,

  -- Related projects context (NEW)
  ROUND(AVG(related_projects_count), 1) AS avg_related_projects,

  -- User journey context (NEW)
  ROUND(AVG(time_on_site_sec), 1) AS avg_time_on_site_before_click,
  ROUND(AVG(projects_viewed_before), 1) AS avg_projects_viewed_before_click,
  ROUND(AVG(sections_viewed), 1) AS avg_sections_viewed_before_click,

  -- Viewport visibility (NEW)
  COUNTIF(was_in_viewport = 'true') AS clicks_while_in_viewport

FROM `portfolio-483605.analytics_processed.v_skill_events`
WHERE skill_name IS NOT NULL
GROUP BY event_date, skill_name, skill_category
ORDER BY event_date DESC, clicks DESC;
-- Layer 2: Aggregated View - Traffic Daily Stats
-- Traffic source and acquisition metrics by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_traffic_daily_stats` AS
SELECT
  session_date AS event_date,
  traffic_source,
  traffic_medium,
  campaign_name,

  -- Volume
  COUNT(*) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  SUM(page_views) AS total_page_views,

  -- Quality
  ROUND(AVG(page_views), 2) AS avg_pages_per_session,
  ROUND(AVG(session_duration_seconds), 2) AS avg_session_duration_sec,
  ROUND(COUNTIF(is_engaged) * 100.0 / NULLIF(COUNT(*), 0), 2) AS engagement_rate,
  ROUND(COUNTIF(is_bounce) * 100.0 / NULLIF(COUNT(*), 0), 2) AS bounce_rate,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_sessions,
  COUNTIF(device_category = 'mobile') AS mobile_sessions,




  -- Engagement quality by source (NEW - from enhanced v_sessions)
  ROUND(AVG(engagement_score), 1) AS avg_engagement_score,
  COUNTIF(engagement_level IN ('very_high', 'high')) AS high_engagement_sessions,
  ROUND(COUNTIF(engagement_level IN ('very_high', 'high')) * 100.0 / NULLIF(COUNT(*), 0), 2) AS high_engagement_rate,

  -- Returning visitors by source (NEW)
  COUNTIF(is_returning = true) AS returning_visitors,
  ROUND(COUNTIF(is_returning = true) * 100.0 / NULLIF(COUNT(*), 0), 2) AS returning_visitor_rate,

  -- Scroll depth by source (NEW)
  ROUND(AVG(max_scroll_depth), 1) AS avg_scroll_depth

FROM `portfolio-483605.analytics_processed.v_sessions`
GROUP BY event_date, traffic_source, traffic_medium, campaign_name
ORDER BY event_date DESC, sessions DESC;
-- Layer 2: Aggregated View - Conversion Funnel
-- Track conversion events and funnel progression by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_conversion_funnel` AS
WITH session_conversions AS (
  SELECT
    DATE(event_timestamp) AS event_date,
    user_pseudo_id,
    session_id,

    -- CTA interactions
    COUNTIF(event_name = 'cta_view') AS cta_views,
    COUNTIF(event_name = 'cta_click') AS cta_clicks,

    -- Contact form funnel
    MAX(CASE WHEN event_name = 'contact_form_start' THEN 1 ELSE 0 END) AS started_contact_form,
    MAX(CASE WHEN event_name = 'contact_form_field_focus' THEN 1 ELSE 0 END) AS focused_form_field,
    MAX(CASE WHEN event_name = 'contact_form_submit' AND submission_status = 'success' THEN 1 ELSE 0 END) AS submitted_contact_form,

    -- Social clicks
    MAX(CASE WHEN event_name = 'social_click' THEN 1 ELSE 0 END) AS clicked_social,
    STRING_AGG(DISTINCT social_platform, ',') AS social_platforms_clicked,

    -- Outbound links
    MAX(CASE WHEN event_name = 'outbound_link' THEN 1 ELSE 0 END) AS clicked_outbound,
    STRING_AGG(DISTINCT link_domain, ',') AS outbound_domains,

    -- Resume/files
    MAX(CASE WHEN event_name = 'resume_download' THEN 1 ELSE 0 END) AS downloaded_resume,
    MAX(CASE WHEN event_name = 'file_download' THEN 1 ELSE 0 END) AS downloaded_file,

    -- Publication clicks
    MAX(CASE WHEN event_name = 'publication_click' THEN 1 ELSE 0 END) AS clicked_publication,

    -- Content copy
    MAX(CASE WHEN event_name = 'content_copy' THEN 1 ELSE 0 END) AS copied_content,

    -- Exit intent (negative signal)
    MAX(CASE WHEN event_name = 'exit_intent' THEN 1 ELSE 0 END) AS triggered_exit_intent,

    -- Conversion context (NEW - from enhanced v_conversion_events)
    AVG(time_on_site_before_start) AS avg_time_on_site_before_start,
    AVG(sections_viewed) AS avg_sections_viewed,
    AVG(projects_viewed) AS avg_projects_viewed,
    AVG(projects_clicked_before) AS avg_projects_clicked_before,
    AVG(scroll_depth_at_start) AS avg_scroll_depth_at_start,

    -- Form engagement (NEW)
    AVG(message_length) AS avg_message_length,
    AVG(time_to_submit_sec) AS avg_time_to_submit,

    -- Returning visitor conversions (NEW)
    MAX(CASE WHEN is_returning_visitor = 'true' THEN 1 ELSE 0 END) AS is_returning_visitor,

    -- Download source (NEW)
    STRING_AGG(DISTINCT download_source, ',') AS download_sources,

    -- Exit behavior (NEW)
    STRING_AGG(DISTINCT exit_trigger, ',') AS exit_triggers,
    MAX(CASE WHEN was_idle = 'true' THEN 1 ELSE 0 END) AS was_idle_before_exit,
    MAX(conversions_count) AS max_conversions_in_session

  FROM `portfolio-483605.analytics_processed.v_conversion_events`
  GROUP BY event_date, user_pseudo_id, session_id
)

SELECT
  event_date,

  -- Session counts
  COUNT(*) AS total_sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,

  -- CTA funnel
  SUM(cta_views) AS total_cta_views,
  SUM(cta_clicks) AS total_cta_clicks,
  ROUND(SUM(cta_clicks) * 100.0 / NULLIF(SUM(cta_views), 0), 2) AS cta_click_rate,

  -- Contact form funnel
  SUM(started_contact_form) AS contact_form_starts,
  SUM(focused_form_field) AS contact_form_field_focuses,
  SUM(submitted_contact_form) AS contact_form_submissions,
  ROUND(SUM(submitted_contact_form) * 100.0 / NULLIF(SUM(started_contact_form), 0), 2) AS form_completion_rate,

  -- Social engagement
  SUM(clicked_social) AS social_clicks,
  ROUND(SUM(clicked_social) * 100.0 / NULLIF(COUNT(*), 0), 2) AS social_click_rate,

  -- Outbound interest
  SUM(clicked_outbound) AS outbound_clicks,
  ROUND(SUM(clicked_outbound) * 100.0 / NULLIF(COUNT(*), 0), 2) AS outbound_click_rate,

  -- Downloads
  SUM(downloaded_resume) AS resume_downloads,
  SUM(downloaded_file) AS file_downloads,

  -- Publications
  SUM(clicked_publication) AS publication_clicks,

  -- Content copy (strong interest signal)
  SUM(copied_content) AS content_copies,

  -- Exit intent rate (negative signal)
  ROUND(SUM(triggered_exit_intent) * 100.0 / NULLIF(COUNT(*), 0), 2) AS exit_intent_rate,

  -- Overall conversion score
  ROUND(
    (SUM(submitted_contact_form) * 10 +
     SUM(downloaded_resume) * 8 +
     SUM(clicked_social) * 3 +
     SUM(clicked_outbound) * 2 +
     SUM(copied_content) * 4) * 1.0 / NULLIF(COUNT(*), 0),
    3
  ) AS avg_conversion_score,

  -- Conversion context aggregates (NEW)
  ROUND(AVG(avg_time_on_site_before_start), 1) AS avg_time_to_conversion_start,
  ROUND(AVG(avg_sections_viewed), 1) AS avg_sections_before_conversion,
  ROUND(AVG(avg_projects_viewed), 1) AS avg_projects_before_conversion,
  ROUND(AVG(avg_projects_clicked_before), 1) AS avg_projects_clicked_before_conversion,
  ROUND(AVG(avg_scroll_depth_at_start), 1) AS avg_scroll_depth_at_conversion,

  -- Form quality metrics (NEW)
  ROUND(AVG(avg_message_length), 0) AS avg_contact_message_length,
  ROUND(AVG(avg_time_to_submit), 1) AS avg_form_completion_time_sec,

  -- Returning visitor conversion (NEW)
  SUM(is_returning_visitor) AS returning_visitor_conversions,
  ROUND(SUM(is_returning_visitor) * 100.0 / NULLIF(SUM(submitted_contact_form) + SUM(downloaded_resume), 0), 2) AS returning_visitor_conversion_share,

  -- Exit behavior analysis (NEW)
  SUM(was_idle_before_exit) AS idle_exits,
  ROUND(SUM(was_idle_before_exit) * 100.0 / NULLIF(SUM(triggered_exit_intent), 0), 2) AS idle_exit_rate

FROM session_conversions
GROUP BY event_date
ORDER BY event_date DESC;
-- Layer 2: Aggregated View - Client/Experience Daily Stats
-- Client work engagement metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_client_daily_stats` AS
SELECT
  event_date,
  client_id,
  client_name,
  domain,

  -- View metrics
  COUNTIF(event_name = 'client_view') AS views,
  COUNT(DISTINCT user_pseudo_id) AS unique_viewers,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Click & engagement metrics
  COUNTIF(event_name = 'client_click') AS clicks,
  COUNTIF(event_name = 'client_case_study_open') AS case_study_opens,
  COUNTIF(event_name = 'client_case_study_engagement') AS case_study_engagements,

  -- Time spent
  AVG(CASE WHEN event_name = 'client_case_study_engagement' THEN time_spent_seconds END) AS avg_case_study_time_sec,
  AVG(CASE WHEN event_name = 'client_case_study_engagement' THEN scroll_depth_percent END) AS avg_case_study_scroll_depth,

  -- Content reading
  COUNTIF(event_name = 'problem_statement_read') AS problem_reads,
  COUNTIF(event_name = 'solution_read') AS solution_reads,
  AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_read_time_sec,
  AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END) AS avg_solution_read_time_sec,

  -- Contribution views
  COUNTIF(event_name = 'contribution_view') AS contribution_views,
  ARRAY_AGG(
    DISTINCT contribution_index IGNORE NULLS
    ORDER BY contribution_index
    LIMIT 10
  ) AS contributions_viewed,

  -- Tech stack clicks
  COUNTIF(event_name = 'client_tech_stack_click') AS tech_stack_clicks,
  ARRAY_AGG(
    DISTINCT technology IGNORE NULLS
    ORDER BY technology
    LIMIT 10
  ) AS technologies_clicked,

  -- Click-through rate to case study
  ROUND(
    COUNTIF(event_name = 'client_case_study_open') * 100.0 /
    NULLIF(COUNTIF(event_name = 'client_view'), 0),
    2
  ) AS case_study_open_rate,

  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views,

  -- Client engagement context (NEW - from enhanced v_client_events)
  COUNTIF(is_first_view = 'true') AS first_time_views,
  ROUND(AVG(clients_viewed_before), 1) AS avg_clients_viewed_before,

  -- Deep engagement metrics (NEW)
  COUNTIF(is_deep_read = 'true') AS deep_reads,
  ROUND(COUNTIF(is_deep_read = 'true') * 100.0 / NULLIF(COUNTIF(event_name = 'client_case_study_engagement'), 0), 2) AS deep_read_rate,
  ROUND(AVG(completion_rate), 1) AS avg_completion_rate,

  -- Recommendation performance (NEW)
  COUNTIF(was_recommended = 'true') AS recommended_client_views,

  -- Contribution engagement (NEW)
  ROUND(AVG(contributions_read_count), 1) AS avg_contributions_read,

  -- Session context (NEW)
  ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session

FROM `portfolio-483605.analytics_processed.v_client_events`
WHERE client_id IS NOT NULL
GROUP BY event_date, client_id, client_name, domain
ORDER BY event_date DESC, views DESC;
-- Layer 2: Aggregated View - Domain/Industry Daily Stats
-- Industry domain interest metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_domain_daily_stats` AS
WITH domain_events AS (
  -- Domain interest events
  SELECT
    event_date,
    domain,
    user_pseudo_id,
    session_id,
    'domain_interest' AS event_type,
    device_category,
    country,
    traffic_source,
    -- NEW: Enhanced context fields
    is_first_view,
    is_deep_read,
    completion_rate,
    was_recommended,
    time_since_session_start
  FROM `portfolio-483605.analytics_processed.v_client_events`
  WHERE event_name = 'domain_interest' AND domain IS NOT NULL

  UNION ALL

  -- Client views by domain
  SELECT
    event_date,
    domain,
    user_pseudo_id,
    session_id,
    'client_view' AS event_type,
    device_category,
    country,
    traffic_source,
    -- NEW: Enhanced context fields
    is_first_view,
    is_deep_read,
    completion_rate,
    was_recommended,
    time_since_session_start
  FROM `portfolio-483605.analytics_processed.v_client_events`
  WHERE event_name IN ('client_view', 'client_case_study_open') AND domain IS NOT NULL
)

SELECT
  event_date,
  domain,

  -- Interest metrics
  COUNTIF(event_type = 'domain_interest') AS explicit_interest_signals,
  COUNTIF(event_type = 'client_view') AS implicit_interest_from_views,
  COUNT(*) AS total_domain_interactions,
  COUNT(DISTINCT user_pseudo_id) AS unique_interested_users,
  COUNT(DISTINCT session_id) AS unique_sessions,

  -- Weighted interest score
  (COUNTIF(event_type = 'domain_interest') * 3 +
   COUNTIF(event_type = 'client_view') * 1) AS domain_interest_score,



  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_interactions,
  COUNTIF(device_category = 'mobile') AS mobile_interactions,

  -- Domain discovery context (NEW - from enhanced v_client_events)
  COUNTIF(is_first_view = 'true') AS first_time_domain_views,
  ROUND(COUNTIF(is_first_view = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS first_time_view_rate,

  -- Deep engagement by domain (NEW)
  COUNTIF(is_deep_read = 'true') AS deep_reads,
  ROUND(COUNTIF(is_deep_read = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS deep_read_rate,
  ROUND(AVG(completion_rate), 1) AS avg_completion_rate,

  -- Recommendation-driven domain interest (NEW)
  COUNTIF(was_recommended = 'true') AS recommended_views,
  ROUND(COUNTIF(was_recommended = 'true') * 100.0 / NULLIF(COUNT(*), 0), 2) AS recommendation_driven_rate,

  -- Journey timing (NEW)
  ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session

FROM domain_events
GROUP BY event_date, domain
ORDER BY event_date DESC, total_domain_interactions DESC;
-- Layer 2: Aggregated View - Experience/Role Daily Stats
-- Job role and experience interest metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_experience_daily_stats` AS
SELECT
  event_date,
  experience_id,
  experience_title,
  company,

  -- Interest metrics
  COUNT(*) AS total_interactions,
  COUNT(DISTINCT user_pseudo_id) AS unique_interested_users,
  COUNT(DISTINCT session_id) AS unique_sessions,



  -- Device breakdown
  COUNTIF(device_category = 'desktop') AS desktop_views,
  COUNTIF(device_category = 'mobile') AS mobile_views,

  -- Experience engagement context (NEW - from enhanced v_client_events)
  COUNTIF(is_first_view = 'true') AS first_time_views,
  COUNTIF(is_deep_read = 'true') AS deep_reads,
  ROUND(AVG(completion_rate), 1) AS avg_completion_rate,
  ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session

FROM `portfolio-483605.analytics_processed.v_client_events`
WHERE event_name = 'experience_level_interest'
  AND experience_id IS NOT NULL
GROUP BY event_date, experience_id, experience_title, company
ORDER BY event_date DESC, total_interactions DESC;
-- Layer 2: Aggregated View - Recommendation System Daily Stats
-- Recommendation performance metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendation_daily_stats` AS
SELECT
  event_date,

  -- Overall metrics
  COUNTIF(event_name = 'recommendation_shown') AS total_impressions,
  COUNTIF(event_name = 'recommendation_click') AS total_clicks,
  COUNT(DISTINCT user_pseudo_id) AS unique_users_shown_recs,
  COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN user_pseudo_id END) AS unique_users_clicked,

  -- Click-through rate
  ROUND(
    COUNTIF(event_name = 'recommendation_click') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown'), 0),
    2
  ) AS overall_ctr,

  -- Position performance
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND position = 1) * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND position = 1), 0),
    2
  ) AS position_1_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND position = 2) * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND position = 2), 0),
    2
  ) AS position_2_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND position = 3) * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND position = 3), 0),
    2
  ) AS position_3_ctr,

  -- Device breakdown
  COUNTIF(device_category = 'desktop' AND event_name = 'recommendation_click') AS desktop_clicks,
  COUNTIF(device_category = 'mobile' AND event_name = 'recommendation_click') AS mobile_clicks,

  -- Algorithm performance (NEW - from enhanced v_recommendation_events)
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND recommendation_algorithm = 'category_match') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND recommendation_algorithm = 'category_match'), 0),
    2
  ) AS category_match_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND recommendation_algorithm = 'tech_stack') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND recommendation_algorithm = 'tech_stack'), 0),
    2
  ) AS tech_stack_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND recommendation_algorithm = 'popularity') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND recommendation_algorithm = 'popularity'), 0),
    2
  ) AS popularity_ctr,

  -- Visibility impact (NEW)
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND is_above_fold = 'true') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND is_above_fold = 'true'), 0),
    2
  ) AS above_fold_ctr,
  ROUND(
    COUNTIF(event_name = 'recommendation_click' AND is_above_fold = 'false') * 100.0 /
    NULLIF(COUNTIF(event_name = 'recommendation_shown' AND is_above_fold = 'false'), 0),
    2
  ) AS below_fold_ctr,

  -- Decision time (NEW)
  ROUND(AVG(CASE WHEN event_name = 'recommendation_click' THEN time_since_shown_sec END), 1) AS avg_time_to_click_sec,

  -- User context (NEW)
  ROUND(AVG(projects_viewed_before), 1) AS avg_projects_viewed_before_rec,
  COUNTIF(user_viewed_similar = 'true' AND event_name = 'recommendation_click') AS clicks_after_viewing_similar

FROM `portfolio-483605.analytics_processed.v_recommendation_events`
GROUP BY event_date
ORDER BY event_date DESC;
-- Layer 2: Aggregated View - Content Reading Patterns
-- Analyze how visitors read problem statements vs solutions
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_content_reading_stats` AS
WITH reading_events AS (
  SELECT
    event_date,
    user_pseudo_id,
    session_id,
    client_id,
    client_name,
    domain,
    event_name,
    read_time_seconds,
    -- NEW: Enhanced context fields
    is_first_view,
    is_deep_read,
    completion_rate,
    was_recommended,
    time_since_session_start,
    device_category
  FROM `portfolio-483605.analytics_processed.v_client_events`
  WHERE event_name IN ('problem_statement_read', 'solution_read')
)

SELECT
  event_date,

  -- Overall reading patterns
  COUNTIF(event_name = 'problem_statement_read') AS problem_reads,
  COUNTIF(event_name = 'solution_read') AS solution_reads,

  -- Do people read both or skip to solutions?
  COUNT(DISTINCT CASE
    WHEN event_name = 'problem_statement_read' THEN CONCAT(user_pseudo_id, '-', session_id, '-', client_id)
  END) AS sessions_read_problem,
  COUNT(DISTINCT CASE
    WHEN event_name = 'solution_read' THEN CONCAT(user_pseudo_id, '-', session_id, '-', client_id)
  END) AS sessions_read_solution,

  -- Average reading times
  AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_read_time_sec,
  AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END) AS avg_solution_read_time_sec,

  -- Reading ratio (higher = more problem reading relative to solution)
  ROUND(
    AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) /
    NULLIF(AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END), 0),
    2
  ) AS problem_to_solution_time_ratio,

  -- Reading context (NEW - from enhanced v_client_events)
  COUNTIF(is_first_view = 'true') AS first_time_readers,
  ROUND(COUNTIF(is_first_view = 'true') * 100.0 / NULLIF(COUNT(DISTINCT CONCAT(user_pseudo_id, '-', session_id)), 0), 2) AS first_time_reader_rate,

  -- Deep reading engagement (NEW)
  COUNTIF(is_deep_read = 'true') AS deep_read_events,
  ROUND(AVG(completion_rate), 1) AS avg_content_completion_rate,

  -- Recommendation influence on reading (NEW)
  COUNTIF(was_recommended = 'true') AS reads_from_recommendations,
  ROUND(
    AVG(CASE WHEN was_recommended = 'true' THEN read_time_seconds END) /
    NULLIF(AVG(CASE WHEN was_recommended = 'false' OR was_recommended IS NULL THEN read_time_seconds END), 0),
    2
  ) AS recommended_vs_organic_read_time_ratio,

  -- Session timing context (NEW)
  ROUND(AVG(time_since_session_start), 1) AS avg_time_into_session_at_read,

  -- Device reading patterns (NEW)
  ROUND(AVG(CASE WHEN device_category = 'desktop' THEN read_time_seconds END), 1) AS avg_desktop_read_time,
  ROUND(AVG(CASE WHEN device_category = 'mobile' THEN read_time_seconds END), 1) AS avg_mobile_read_time

FROM reading_events
GROUP BY event_date
ORDER BY event_date DESC;
-- Layer 3: Rankings View - Project Rankings
-- 7-day rolling project rankings for portfolio reordering
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_rankings` AS
WITH project_7day AS (
  SELECT
    project_id,
    project_title,
    project_category,

    -- Aggregate 7-day metrics
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(clicks) AS total_clicks,
    SUM(expands) AS total_expands,
    SUM(link_clicks) AS total_link_clicks,
    AVG(avg_view_duration_ms) AS avg_view_duration_ms,
    AVG(click_through_rate) AS avg_ctr,
    SUM(github_clicks) AS total_github_clicks,
    SUM(demo_clicks) AS total_demo_clicks,

    -- Technology aggregation
    ARRAY_CONCAT_AGG(technologies_clicked) AS all_technologies_clicked

  FROM `portfolio-483605.analytics_processed.v_project_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY project_id, project_title, project_category
),

scored AS (
  SELECT
    *,

    -- Engagement Score (weighted composite)
    (
      -- Views (normalized weight: 1x)
      (total_views * 1.0) +
      -- Unique viewers (weight: 2x, quality matters)
      (total_unique_viewers * 2.0) +
      -- Clicks (weight: 3x, active interest)
      (total_clicks * 3.0) +
      -- Expands (weight: 4x, deep interest)
      (total_expands * 4.0) +
      -- Link clicks (weight: 5x, strongest signal)
      (total_link_clicks * 5.0) +
      -- GitHub clicks (weight: 6x, developer interest)
      (total_github_clicks * 6.0) +
      -- Demo clicks (weight: 7x, highest intent)
      (total_demo_clicks * 7.0) +
      -- View duration bonus (normalized)
      (COALESCE(avg_view_duration_ms, 0) / 1000.0 * 0.5) +
      -- CTR bonus
      (COALESCE(avg_ctr, 0) * 2.0)
    ) AS raw_engagement_score

  FROM project_7day
)

SELECT
  project_id,
  project_title,
  project_category,

  -- Metrics
  total_views,
  total_unique_viewers,
  total_clicks,
  total_expands,
  total_link_clicks,
  total_github_clicks,
  total_demo_clicks,
  ROUND(avg_view_duration_ms / 1000.0, 2) AS avg_view_duration_sec,
  ROUND(avg_ctr, 2) AS avg_ctr_percent,

  -- Scores
  ROUND(raw_engagement_score, 2) AS engagement_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY project_category ORDER BY raw_engagement_score DESC) AS category_rank,

  -- Percentile (for normalization)
  ROUND(
    PERCENT_RANK() OVER (ORDER BY raw_engagement_score) * 100,
    2
  ) AS engagement_percentile,

  -- Trend indicator (would need previous period for real trend)
  CASE
    WHEN raw_engagement_score > (
      SELECT AVG(raw_engagement_score) FROM scored
    ) THEN 'above_average'
    ELSE 'below_average'
  END AS performance_tier,

  -- Technologies driving interest
  all_technologies_clicked,

  -- Recommended display position (based on rank)
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 3 THEN 'featured'
    WHEN ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) <= 6 THEN 'primary'
    ELSE 'secondary'
  END AS recommended_position,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM scored
ORDER BY overall_rank;
-- Layer 3: Rankings View - Skill Rankings
-- 7-day rolling skill interest rankings
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_skill_rankings` AS
WITH skill_7day AS (
  SELECT
    skill_name,
    skill_category,

    -- Aggregate 7-day metrics
    SUM(clicks) AS total_clicks,
    SUM(hovers) AS total_hovers,
    SUM(unique_users) AS total_unique_users,
    SUM(unique_sessions) AS total_unique_sessions,
    SUM(weighted_interest_score) AS total_interest_score

  FROM `portfolio-483605.analytics_processed.v_skill_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY skill_name, skill_category
)

SELECT
  skill_name,
  skill_category,

  -- Metrics
  total_clicks,
  total_hovers,
  total_unique_users,
  total_unique_sessions,
  total_interest_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY skill_category ORDER BY total_interest_score DESC) AS category_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100,
    2
  ) AS interest_percentile,

  -- Interest tier
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 15 THEN 'moderate_demand'
    ELSE 'low_demand'
  END AS demand_tier,

  -- Learning recommendation (skills to focus on)
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 5 THEN 'maintain_expertise'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 10 THEN 'showcase_more'
    ELSE 'consider_highlighting'
  END AS recommendation,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM skill_7day
ORDER BY overall_rank;
-- Layer 3: Rankings View - Section Rankings
-- 7-day rolling section engagement rankings
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_section_rankings` AS
WITH section_7day AS (
  SELECT
    section_id,

    -- Aggregate 7-day metrics
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(engaged_views) AS total_engaged_views,
    AVG(engagement_rate) AS avg_engagement_rate,
    AVG(avg_time_spent_seconds) AS avg_time_spent_seconds,
    AVG(avg_scroll_depth_percent) AS avg_scroll_depth_percent,
    MAX(max_scroll_milestone) AS max_scroll_milestone,
    SUM(exits) AS total_exits,
    AVG(exit_rate) AS avg_exit_rate

  FROM `portfolio-483605.analytics_processed.v_section_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY section_id
),

scored AS (
  SELECT
    *,
    -- Section health score
    (
      (avg_engagement_rate * 2) +  -- High engagement is good
      (avg_scroll_depth_percent * 0.5) +   -- Scroll depth matters
      (100 - avg_exit_rate) * 0.3  -- Low exit rate is good
    ) AS health_score

  FROM section_7day
)

SELECT
  section_id,

  -- Metrics
  total_views,
  total_unique_viewers,
  total_engaged_views,
  ROUND(avg_engagement_rate, 2) AS avg_engagement_rate,
  ROUND(avg_time_spent_seconds, 2) AS avg_time_spent_seconds,
  ROUND(avg_scroll_depth_percent, 2) AS avg_scroll_depth_percent,
  max_scroll_milestone,
  total_exits,
  ROUND(avg_exit_rate, 2) AS avg_exit_rate,

  -- Scores
  ROUND(health_score, 2) AS health_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY health_score DESC) AS engagement_rank,
  ROW_NUMBER() OVER (ORDER BY total_views DESC) AS view_rank,
  ROW_NUMBER() OVER (ORDER BY avg_exit_rate ASC) AS retention_rank,

  -- Health tier
  CASE
    WHEN health_score >= 80 THEN 'excellent'
    WHEN health_score >= 60 THEN 'good'
    WHEN health_score >= 40 THEN 'needs_attention'
    ELSE 'critical'
  END AS health_tier,

  -- Drop-off indicator
  CASE
    WHEN avg_exit_rate > 50 THEN 'high_dropoff'
    WHEN avg_exit_rate > 30 THEN 'moderate_dropoff'
    ELSE 'low_dropoff'
  END AS dropoff_indicator,

  -- Optimization suggestions
  CASE
    WHEN avg_engagement_rate < 30 AND total_views > 100 THEN 'improve_content'
    WHEN avg_exit_rate > 50 THEN 'add_cta_or_navigation'
    WHEN avg_scroll_depth_percent < 50 THEN 'hook_earlier'
    WHEN avg_time_spent_seconds < 3 THEN 'make_more_engaging'
    ELSE 'performing_well'
  END AS optimization_hint,

  -- Last updated
  CURRENT_TIMESTAMP() AS ranked_at

FROM scored
ORDER BY engagement_rank;
-- Layer 3: Insights View - Visitor Insights
-- Comprehensive visitor behavior analysis
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_visitor_insights` AS
WITH visitor_sessions AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT session_id) AS total_sessions,
    MIN(session_start) AS first_visit,
    MAX(session_end) AS last_visit,
    SUM(page_views) AS total_page_views,
    AVG(session_duration_seconds) AS avg_session_duration,
    COUNTIF(is_engaged) AS engaged_sessions,
    ANY_VALUE(device_category) AS primary_device,
    ANY_VALUE(country) AS primary_country,
    ANY_VALUE(traffic_source) AS primary_traffic_source,
    ARRAY_AGG(DISTINCT landing_page IGNORE NULLS LIMIT 5) AS landing_pages,
    ARRAY_AGG(DISTINCT exit_page IGNORE NULLS LIMIT 5) AS exit_pages

  FROM `portfolio-483605.analytics_processed.v_sessions`
  WHERE session_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY user_pseudo_id
),

visitor_projects AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT project_id) AS projects_viewed,
    ARRAY_AGG(DISTINCT project_id IGNORE NULLS ORDER BY project_id LIMIT 10) AS project_ids_viewed,
    ARRAY_AGG(DISTINCT project_category IGNORE NULLS LIMIT 5) AS project_categories_viewed,
    ARRAY_AGG(DISTINCT technology IGNORE NULLS LIMIT 10) AS technologies_explored

  FROM `portfolio-483605.analytics_processed.v_project_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  GROUP BY user_pseudo_id
),

visitor_skills AS (
  SELECT
    user_pseudo_id,
    ARRAY_AGG(DISTINCT skill_name IGNORE NULLS ORDER BY skill_name LIMIT 15) AS skills_clicked,
    ARRAY_AGG(DISTINCT skill_category IGNORE NULLS LIMIT 5) AS skill_categories

  FROM `portfolio-483605.analytics_processed.v_skill_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  GROUP BY user_pseudo_id
),

visitor_conversions AS (
  SELECT
    user_pseudo_id,
    COUNTIF(event_name = 'cta_click') AS cta_clicks,
    COUNTIF(event_name = 'contact_form_submit') AS form_submissions,
    COUNTIF(event_name = 'social_click') AS social_clicks,
    COUNTIF(event_name = 'resume_download') AS resume_downloads,
    COUNTIF(event_name = 'outbound_link') AS outbound_clicks,
    COUNTIF(event_name = 'publication_click') AS publication_clicks,
    COUNTIF(event_name = 'content_copy') AS content_copies

  FROM `portfolio-483605.analytics_processed.v_conversion_events`
  WHERE DATE(event_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY user_pseudo_id
)

SELECT
  vs.user_pseudo_id,

  -- Session metrics
  vs.total_sessions,
  vs.first_visit,
  vs.last_visit,
  DATE_DIFF(DATE(vs.last_visit), DATE(vs.first_visit), DAY) AS visitor_tenure_days,
  vs.total_page_views,
  ROUND(vs.avg_session_duration, 2) AS avg_session_duration_sec,
  vs.engaged_sessions,
  ROUND(vs.engaged_sessions * 100.0 / NULLIF(vs.total_sessions, 0), 2) AS engagement_rate,

  -- Device and location
  vs.primary_device,
  vs.primary_country,
  vs.primary_traffic_source,
  vs.landing_pages,
  vs.exit_pages,

  -- Content engagement
  COALESCE(vp.projects_viewed, 0) AS projects_viewed,
  vp.project_ids_viewed,
  vp.project_categories_viewed,
  vp.technologies_explored,
  vsk.skills_clicked,
  vsk.skill_categories,

  -- Conversion signals
  COALESCE(vc.cta_clicks, 0) AS cta_clicks,
  COALESCE(vc.form_submissions, 0) AS form_submissions,
  COALESCE(vc.social_clicks, 0) AS social_clicks,
  COALESCE(vc.resume_downloads, 0) AS resume_downloads,
  COALESCE(vc.outbound_clicks, 0) AS outbound_clicks,
  COALESCE(vc.publication_clicks, 0) AS publication_clicks,
  COALESCE(vc.content_copies, 0) AS content_copies,

  -- Visitor value score
  (
    (vs.total_sessions * 1) +
    (vs.engaged_sessions * 3) +
    (COALESCE(vp.projects_viewed, 0) * 2) +
    (COALESCE(vc.form_submissions, 0) * 20) +
    (COALESCE(vc.resume_downloads, 0) * 15) +
    (COALESCE(vc.social_clicks, 0) * 5) +
    (COALESCE(vc.content_copies, 0) * 8)
  ) AS visitor_value_score,

  -- Visitor segment
  CASE
    WHEN COALESCE(vc.form_submissions, 0) > 0 THEN 'converter'
    WHEN COALESCE(vc.resume_downloads, 0) > 0 THEN 'high_intent'
    WHEN vs.engaged_sessions >= 2 AND COALESCE(vp.projects_viewed, 0) >= 3 THEN 'engaged_explorer'
    WHEN vs.total_sessions >= 2 THEN 'returning_visitor'
    WHEN vs.engaged_sessions = 1 THEN 'engaged_new'
    ELSE 'casual_browser'
  END AS visitor_segment,

  -- Interest profile
  CASE
    WHEN ARRAY_LENGTH(vp.technologies_explored) > 5 THEN 'tech_enthusiast'
    WHEN ARRAY_LENGTH(vsk.skills_clicked) > 3 THEN 'skills_focused'
    WHEN COALESCE(vp.projects_viewed, 0) >= 4 THEN 'portfolio_explorer'
    WHEN COALESCE(vc.publication_clicks, 0) > 0 THEN 'research_interested'
    ELSE 'general_visitor'
  END AS interest_profile

FROM visitor_sessions vs
LEFT JOIN visitor_projects vp ON vs.user_pseudo_id = vp.user_pseudo_id
LEFT JOIN visitor_skills vsk ON vs.user_pseudo_id = vsk.user_pseudo_id
LEFT JOIN visitor_conversions vc ON vs.user_pseudo_id = vc.user_pseudo_id
ORDER BY visitor_value_score DESC;
-- Layer 3: Recommendations View - Content Recommendations
-- Real-time content recommendations based on visitor behavior
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendations` AS

-- Part 1: Visitor-Project Affinity Matrix
WITH visitor_project_affinity AS (
  SELECT
    user_pseudo_id,
    project_id,
    SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) AS views,
    SUM(CASE WHEN event_name = 'project_click' THEN 3 ELSE 0 END) AS clicks,
    SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open') THEN 5 ELSE 0 END) AS expands,
    SUM(CASE WHEN event_name = 'project_link_click' THEN 7 ELSE 0 END) AS link_clicks,
    -- Affinity score
    (SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN event_name = 'project_click' THEN 3 ELSE 0 END) +
     SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open') THEN 5 ELSE 0 END) +
     SUM(CASE WHEN event_name = 'project_link_click' THEN 7 ELSE 0 END)) AS affinity_score

  FROM `portfolio-483605.analytics_processed.v_project_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND project_id IS NOT NULL
  GROUP BY user_pseudo_id, project_id
),

-- Part 2: Similar Users (Collaborative Filtering Basis)
user_similarity AS (
  SELECT
    a.user_pseudo_id AS user_a,
    b.user_pseudo_id AS user_b,
    COUNT(DISTINCT a.project_id) AS common_projects,
    -- Cosine similarity approximation
    SUM(a.affinity_score * b.affinity_score) AS similarity_score

  FROM visitor_project_affinity a
  JOIN visitor_project_affinity b
    ON a.project_id = b.project_id
    AND a.user_pseudo_id != b.user_pseudo_id
  GROUP BY a.user_pseudo_id, b.user_pseudo_id
  HAVING common_projects >= 2
),

-- Part 3: Collaborative Recommendations
collaborative_recs AS (
  SELECT
    us.user_a AS user_pseudo_id,
    vpa.project_id AS recommended_project_id,
    'collaborative' AS recommendation_type,
    AVG(vpa.affinity_score * us.similarity_score) AS recommendation_score,
    COUNT(DISTINCT us.user_b) AS recommending_users

  FROM user_similarity us
  JOIN visitor_project_affinity vpa
    ON us.user_b = vpa.user_pseudo_id
  -- Only recommend projects the user hasn't seen
  LEFT JOIN visitor_project_affinity existing
    ON us.user_a = existing.user_pseudo_id
    AND vpa.project_id = existing.project_id
  WHERE existing.project_id IS NULL
  GROUP BY us.user_a, vpa.project_id
),

-- Part 4: Content-Based Recommendations (Technology matching)
content_recs AS (
  SELECT
    vi.user_pseudo_id,
    pr.project_id AS recommended_project_id,
    'content_based' AS recommendation_type,
    pr.engagement_score AS recommendation_score,
    1 AS recommending_users

  FROM `portfolio-483605.analytics_processed.v_visitor_insights` vi
  CROSS JOIN `portfolio-483605.analytics_processed.v_project_rankings` pr
  -- Match based on technology interests
  WHERE EXISTS (
    SELECT 1
    FROM UNNEST(vi.technologies_explored) AS tech
    WHERE tech IN (SELECT * FROM UNNEST(pr.all_technologies_clicked))
  )
  -- Exclude already viewed
  AND pr.project_id NOT IN (
    SELECT * FROM UNNEST(vi.project_ids_viewed)
  )
),

-- Part 5: Popularity-Based Recommendations (fallback)
popularity_recs AS (
  SELECT
    vi.user_pseudo_id,
    pr.project_id AS recommended_project_id,
    'popularity' AS recommendation_type,
    pr.engagement_score AS recommendation_score,
    pr.total_unique_viewers AS recommending_users

  FROM `portfolio-483605.analytics_processed.v_visitor_insights` vi
  CROSS JOIN (
    SELECT * FROM `portfolio-483605.analytics_processed.v_project_rankings`
    WHERE overall_rank <= 5
  ) pr
  -- Exclude already viewed
  WHERE pr.project_id NOT IN (
    SELECT * FROM UNNEST(vi.project_ids_viewed)
  )
),

-- Combine all recommendations
all_recs AS (
  SELECT * FROM collaborative_recs
  UNION ALL
  SELECT * FROM content_recs
  UNION ALL
  SELECT * FROM popularity_recs
)

SELECT
  user_pseudo_id,
  recommended_project_id,
  recommendation_type,
  ROUND(recommendation_score, 2) AS recommendation_score,
  recommending_users,

  -- Final rank per user (blended)
  ROW_NUMBER() OVER (
    PARTITION BY user_pseudo_id
    ORDER BY
      -- Prioritize collaborative, then content, then popularity
      CASE recommendation_type
        WHEN 'collaborative' THEN 1
        WHEN 'content_based' THEN 2
        ELSE 3
      END,
      recommendation_score DESC
  ) AS recommendation_rank,

  -- Explanation
  CASE recommendation_type
    WHEN 'collaborative' THEN CONCAT('Users similar to you also liked this (', recommending_users, ' similar users)')
    WHEN 'content_based' THEN 'Based on technologies you explored'
    ELSE CONCAT('Popular project (', recommending_users, ' visitors)')
  END AS recommendation_reason,

  CURRENT_TIMESTAMP() AS generated_at

FROM all_recs
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY user_pseudo_id, recommended_project_id
  ORDER BY recommendation_score DESC
) = 1  -- Dedupe same project from multiple methods
ORDER BY user_pseudo_id, recommendation_rank;
-- Layer 3: Rankings View - Client Work Rankings
-- 7-day rolling client work rankings
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_client_rankings` AS
WITH client_7day AS (
  SELECT
    client_id,
    client_name,
    domain,

    -- Aggregate 7-day metrics
    SUM(views) AS total_views,
    SUM(unique_viewers) AS total_unique_viewers,
    SUM(clicks) AS total_clicks,
    SUM(case_study_opens) AS total_case_study_opens,
    SUM(case_study_engagements) AS total_case_study_engagements,
    AVG(avg_case_study_time_sec) AS avg_case_study_time_sec,
    AVG(avg_case_study_scroll_depth) AS avg_case_study_scroll_depth,
    SUM(problem_reads) AS total_problem_reads,
    SUM(solution_reads) AS total_solution_reads,
    SUM(contribution_views) AS total_contribution_views,
    SUM(tech_stack_clicks) AS total_tech_stack_clicks,
    AVG(case_study_open_rate) AS avg_case_study_open_rate

  FROM `portfolio-483605.analytics_processed.v_client_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY client_id, client_name, domain
),

scored AS (
  SELECT
    *,
    -- Engagement Score (weighted composite)
    (
      (total_views * 1.0) +
      (total_unique_viewers * 2.0) +
      (total_clicks * 3.0) +
      (total_case_study_opens * 5.0) +
      (total_case_study_engagements * 7.0) +
      (total_problem_reads * 4.0) +
      (total_solution_reads * 4.0) +
      (total_contribution_views * 3.0) +
      (total_tech_stack_clicks * 4.0) +
      (COALESCE(avg_case_study_time_sec, 0) * 0.2) +
      (COALESCE(avg_case_study_scroll_depth, 0) * 0.1)
    ) AS raw_engagement_score

  FROM client_7day
)

SELECT
  client_id,
  client_name,
  domain,

  -- Metrics
  total_views,
  total_unique_viewers,
  total_clicks,
  total_case_study_opens,
  total_case_study_engagements,
  ROUND(avg_case_study_time_sec, 2) AS avg_case_study_time_sec,
  ROUND(avg_case_study_scroll_depth, 2) AS avg_case_study_scroll_depth,
  total_problem_reads,
  total_solution_reads,
  total_contribution_views,
  total_tech_stack_clicks,
  ROUND(avg_case_study_open_rate, 2) AS avg_case_study_open_rate,

  -- Scores
  ROUND(raw_engagement_score, 2) AS engagement_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY raw_engagement_score DESC) AS overall_rank,
  ROW_NUMBER() OVER (PARTITION BY domain ORDER BY raw_engagement_score DESC) AS domain_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY raw_engagement_score) * 100,
    2
  ) AS engagement_percentile,

  -- Insights
  CASE
    WHEN total_case_study_opens > 0 AND avg_case_study_time_sec > 60 THEN 'high_engagement'
    WHEN total_case_study_opens > 0 THEN 'moderate_engagement'
    WHEN total_views > 5 THEN 'viewed_but_not_explored'
    ELSE 'low_visibility'
  END AS engagement_tier,

  -- Content quality signal
  CASE
    WHEN total_problem_reads > 0 AND total_solution_reads > 0 THEN 'full_story_readers'
    WHEN total_solution_reads > total_problem_reads THEN 'solution_focused'
    WHEN total_problem_reads > 0 THEN 'problem_curious'
    ELSE 'skimmers'
  END AS reader_behavior,

  CURRENT_TIMESTAMP() AS ranked_at

FROM scored
ORDER BY overall_rank;
-- Layer 3: Rankings View - Domain/Industry Rankings
-- 7-day rolling domain interest rankings
-- Answers: Which industries are visitors most interested in?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_domain_rankings` AS
WITH domain_7day AS (
  SELECT
    domain,

    -- Aggregate 7-day metrics
    SUM(explicit_interest_signals) AS total_explicit_interest,
    SUM(implicit_interest_from_views) AS total_implicit_interest,
    SUM(total_domain_interactions) AS total_interactions,
    SUM(unique_interested_users) AS total_unique_users,
    SUM(domain_interest_score) AS total_interest_score

  FROM `portfolio-483605.analytics_processed.v_domain_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY domain
)

SELECT
  domain,

  -- Metrics
  total_explicit_interest,
  total_implicit_interest,
  total_interactions,
  total_unique_users,
  total_interest_score,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) AS interest_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interest_score) * 100,
    2
  ) AS interest_percentile,

  -- Market demand tier
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 2 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 4 THEN 'moderate_demand'
    ELSE 'niche_interest'
  END AS demand_tier,

  -- Career insight
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) = 1 THEN 'primary_strength'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interest_score DESC) <= 3 THEN 'showcase_more'
    ELSE 'consider_expanding'
  END AS portfolio_recommendation,

  CURRENT_TIMESTAMP() AS ranked_at

FROM domain_7day
ORDER BY interest_rank;
-- Layer 3: Rankings View - Experience/Role Rankings
-- 7-day rolling experience level interest rankings
-- Answers: Which job titles/roles attract the most attention?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_experience_rankings` AS
WITH experience_7day AS (
  SELECT
    experience_id,
    experience_title,
    company,

    -- Aggregate 7-day metrics
    SUM(total_interactions) AS total_interactions,
    SUM(unique_interested_users) AS total_unique_users,
    SUM(unique_sessions) AS total_sessions

  FROM `portfolio-483605.analytics_processed.v_experience_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY experience_id, experience_title, company
)

SELECT
  experience_id,
  experience_title,
  company,

  -- Metrics
  total_interactions,
  total_unique_users,
  total_sessions,

  -- Rankings
  ROW_NUMBER() OVER (ORDER BY total_interactions DESC) AS interest_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interactions) * 100,
    2
  ) AS interest_percentile,

  -- Insights
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) = 1 THEN 'most_attractive_role'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 3 THEN 'high_interest_role'
    ELSE 'moderate_interest'
  END AS role_attractiveness,

  -- Career positioning suggestion
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) = 1 THEN 'lead_with_this'
    WHEN total_unique_users > 5 THEN 'highlight_prominently'
    ELSE 'include_for_context'
  END AS positioning_suggestion,

  CURRENT_TIMESTAMP() AS ranked_at

FROM experience_7day
ORDER BY interest_rank;
-- Layer 3: Insights View - Recommendation System Performance
-- 7-day rolling recommendation system analytics
-- Answers: How well is the recommendation system performing?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_recommendation_performance` AS
WITH rec_7day AS (
  SELECT
    SUM(total_impressions) AS total_impressions,
    SUM(total_clicks) AS total_clicks,
    SUM(unique_users_shown_recs) AS total_users_shown,
    SUM(unique_users_clicked) AS total_users_clicked,

    -- Position-level aggregation
    AVG(position_1_ctr) AS avg_position_1_ctr,
    AVG(position_2_ctr) AS avg_position_2_ctr,
    AVG(position_3_ctr) AS avg_position_3_ctr

  FROM `portfolio-483605.analytics_processed.v_recommendation_daily_stats`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
),

project_performance AS (
  SELECT
    recommended_project_id,
    recommended_project_title,
    COUNTIF(event_name = 'recommendation_shown') AS impressions,
    COUNTIF(event_name = 'recommendation_click') AS clicks,
    ROUND(
      COUNTIF(event_name = 'recommendation_click') * 100.0 /
      NULLIF(COUNTIF(event_name = 'recommendation_shown'), 0),
      2
    ) AS ctr
  FROM `portfolio-483605.analytics_processed.v_recommendation_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY recommended_project_id, recommended_project_title
),

source_performance AS (
  SELECT
    source_project_id,
    COUNTIF(event_name = 'recommendation_click') AS clicks_generated,
    COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN recommended_project_id END) AS unique_projects_clicked
  FROM `portfolio-483605.analytics_processed.v_recommendation_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY source_project_id
)

SELECT
  -- Overall metrics
  r.total_impressions,
  r.total_clicks,
  ROUND(r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0), 2) AS overall_ctr,
  r.total_users_shown,
  r.total_users_clicked,
  ROUND(r.total_users_clicked * 100.0 / NULLIF(r.total_users_shown, 0), 2) AS user_conversion_rate,

  -- Position performance
  ROUND(r.avg_position_1_ctr, 2) AS position_1_ctr,
  ROUND(r.avg_position_2_ctr, 2) AS position_2_ctr,
  ROUND(r.avg_position_3_ctr, 2) AS position_3_ctr,

  -- Best position insight
  CASE
    WHEN r.avg_position_1_ctr >= GREATEST(r.avg_position_2_ctr, r.avg_position_3_ctr) THEN 'Position 1 performs best'
    WHEN r.avg_position_2_ctr >= r.avg_position_3_ctr THEN 'Position 2 performs best'
    ELSE 'Position 3 performs best'
  END AS best_position_insight,

  -- Top recommended projects (best CTR)
  ARRAY(
    SELECT AS STRUCT recommended_project_id, recommended_project_title, impressions, clicks, ctr
    FROM project_performance
    WHERE impressions >= 5  -- Minimum impressions for reliability
    ORDER BY ctr DESC
    LIMIT 5
  ) AS top_performing_recommendations,

  -- Top source projects (drive most clicks)
  ARRAY(
    SELECT AS STRUCT source_project_id, clicks_generated, unique_projects_clicked
    FROM source_performance
    ORDER BY clicks_generated DESC
    LIMIT 5
  ) AS top_recommendation_drivers,

  -- System health
  CASE
    WHEN r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0) >= 10 THEN 'excellent'
    WHEN r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0) >= 5 THEN 'good'
    WHEN r.total_clicks * 100.0 / NULLIF(r.total_impressions, 0) >= 2 THEN 'needs_improvement'
    ELSE 'underperforming'
  END AS system_health,

  CURRENT_TIMESTAMP() AS generated_at

FROM rec_7day r;
-- Layer 3: Insights View - Technology Demand Intelligence
-- Analyzes which technologies are most in-demand across domains
-- Answers: What tech should I learn? What's trending in each domain?
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_tech_demand_insights` AS
WITH tech_from_clients AS (
  -- Technologies clicked in client work context
  SELECT
    technology,
    domain,
    'client_work' AS source,
    COUNT(*) AS interactions,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM `portfolio-483605.analytics_processed.v_client_events`
  WHERE event_name = 'client_tech_stack_click'
    AND technology IS NOT NULL
    AND event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY technology, domain
),

tech_from_projects AS (
  -- Technologies clicked in project context (from v_project_events)
  SELECT
    technology,
    project_category AS domain,
    'project' AS source,
    COUNT(*) AS interactions,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM `portfolio-483605.analytics_processed.v_project_events`
  WHERE event_name = 'technology_interest'
    AND technology IS NOT NULL
    AND event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY technology, project_category
),

tech_from_skills AS (
  -- Skills clicked (map to technologies)
  SELECT
    skill_name AS technology,
    skill_category AS domain,
    'skills_section' AS source,
    COUNT(*) AS interactions,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM `portfolio-483605.analytics_processed.v_skill_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  GROUP BY skill_name, skill_category
),

all_tech AS (
  SELECT * FROM tech_from_clients
  UNION ALL
  SELECT * FROM tech_from_projects
  UNION ALL
  SELECT * FROM tech_from_skills
),

tech_aggregated AS (
  SELECT
    technology,
    SUM(interactions) AS total_interactions,
    SUM(unique_users) AS total_unique_users

  FROM all_tech
  WHERE technology IS NOT NULL
  GROUP BY technology
)

SELECT
  technology,
  total_interactions,
  total_unique_users,

  -- Ranking
  ROW_NUMBER() OVER (ORDER BY total_interactions DESC) AS demand_rank,

  -- Percentile
  ROUND(
    PERCENT_RANK() OVER (ORDER BY total_interactions) * 100,
    2
  ) AS demand_percentile,

  -- Demand tier
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 5 THEN 'high_demand'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 15 THEN 'moderate_demand'
    ELSE 'niche_interest'
  END AS demand_tier,

  -- Learning recommendation
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 3 THEN 'master_this'
    WHEN ROW_NUMBER() OVER (ORDER BY total_interactions DESC) <= 10 THEN 'strengthen_skills'
    ELSE 'maintain_awareness'
  END AS learning_priority,

  CURRENT_TIMESTAMP() AS generated_at

FROM tech_aggregated
ORDER BY demand_rank;
-- ML Training Data View (UPDATED)
-- Comprehensive feature set for training recommendation models
-- Includes client work, recommendations, and certification features
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.ml_training_data` AS
WITH session_features AS (
  SELECT
    user_pseudo_id,
    session_id,
    session_date,

    -- Session-level features
    device_category,
    browser,
    os,
    country,
    traffic_source,
    traffic_medium,
    session_hour,
    session_day_of_week,
    session_duration_seconds,
    page_views,
    total_events,
    scroll_events,
    click_events,
    is_bounce,
    is_engaged,

    -- Time features
    CASE
      WHEN session_hour BETWEEN 6 AND 11 THEN 'morning'
      WHEN session_hour BETWEEN 12 AND 17 THEN 'afternoon'
      WHEN session_hour BETWEEN 18 AND 21 THEN 'evening'
      ELSE 'night'
    END AS session_time_of_day,

    CASE
      WHEN session_day_of_week IN (1, 7) THEN 'weekend'
      ELSE 'weekday'
    END AS session_day_type

  FROM `portfolio-483605.analytics_processed.v_sessions`
),

project_interactions AS (
  SELECT
    user_pseudo_id,
    session_id,
    project_id,
    project_category,

    -- Interaction features per project
    SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) AS project_views,
    SUM(CASE WHEN event_name = 'project_click' THEN 1 ELSE 0 END) AS project_clicks,
    SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open') THEN 1 ELSE 0 END) AS project_expands,
    SUM(CASE WHEN event_name = 'project_link_click' THEN 1 ELSE 0 END) AS project_link_clicks,
    MAX(view_duration_ms) AS max_view_duration_ms,
    AVG(display_position) AS avg_display_position,

    -- Engagement score for this project
    (SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) * 1 +
     SUM(CASE WHEN event_name = 'project_click' THEN 1 ELSE 0 END) * 3 +
     SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open') THEN 1 ELSE 0 END) * 5 +
     SUM(CASE WHEN event_name = 'project_link_click' THEN 1 ELSE 0 END) * 7) AS project_engagement_score,

    -- Binary target: did user show strong interest?
    CASE
      WHEN SUM(CASE WHEN event_name IN ('project_expand', 'case_study_open', 'project_link_click') THEN 1 ELSE 0 END) > 0 THEN 1
      ELSE 0
    END AS high_interest_flag

  FROM `portfolio-483605.analytics_processed.v_project_events`
  GROUP BY user_pseudo_id, session_id, project_id, project_category
),

section_engagement AS (
  SELECT
    user_pseudo_id,
    session_id,
    section_id,

    -- Section engagement features
    COUNT(*) AS section_events,
    SUM(CASE WHEN event_name = 'section_view' THEN 1 ELSE 0 END) AS section_views,
    SUM(CASE WHEN event_name = 'section_engagement' THEN 1 ELSE 0 END) AS section_engaged,
    MAX(time_spent_seconds) AS max_time_spent_seconds,
    MAX(scroll_depth_percent) AS max_scroll_depth_percent,
    MAX(scroll_milestone) AS max_scroll_milestone

  FROM `portfolio-483605.analytics_processed.v_section_events`
  GROUP BY user_pseudo_id, session_id, section_id
),

skill_interests AS (
  SELECT
    user_pseudo_id,
    session_id,

    -- Skill interest features
    COUNT(DISTINCT skill_name) AS unique_skills_clicked,
    COUNT(DISTINCT skill_category) AS unique_skill_categories,
    STRING_AGG(DISTINCT skill_name, ',' ORDER BY skill_name) AS skills_clicked_list,
    STRING_AGG(DISTINCT skill_category, ',' ORDER BY skill_category) AS skill_categories_list

  FROM `portfolio-483605.analytics_processed.v_skill_events`
  GROUP BY user_pseudo_id, session_id
),

-- NEW: Client/Experience interactions
client_interactions AS (
  SELECT
    user_pseudo_id,
    session_id,

    -- Client work engagement
    COUNT(DISTINCT client_id) AS unique_clients_viewed,
    COUNTIF(event_name = 'client_view') AS client_views,
    COUNTIF(event_name = 'client_click') AS client_clicks,
    COUNTIF(event_name = 'client_case_study_open') AS case_study_opens,
    COUNTIF(event_name = 'client_case_study_engagement') AS case_study_engagements,

    -- Domain interests
    COUNT(DISTINCT domain) AS unique_domains_explored,
    COUNTIF(event_name = 'domain_interest') AS domain_interest_signals,
    STRING_AGG(DISTINCT domain, ',' ORDER BY domain) AS domains_explored,

    -- Content reading patterns
    COUNTIF(event_name = 'problem_statement_read') AS problem_reads,
    COUNTIF(event_name = 'solution_read') AS solution_reads,
    AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_read_time,
    AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END) AS avg_solution_read_time,

    -- Contribution viewing
    COUNTIF(event_name = 'contribution_view') AS contribution_views,

    -- Tech stack interest from client work
    COUNTIF(event_name = 'client_tech_stack_click') AS client_tech_clicks,
    STRING_AGG(DISTINCT technology, ',' ORDER BY technology) AS client_technologies_clicked,

    -- Experience/role interest
    COUNTIF(event_name = 'experience_level_interest') AS experience_interest_signals

  FROM `portfolio-483605.analytics_processed.v_client_events`
  GROUP BY user_pseudo_id, session_id
),

-- NEW: Recommendation interactions
recommendation_interactions AS (
  SELECT
    user_pseudo_id,
    session_id,

    -- Recommendation engagement
    COUNTIF(event_name = 'recommendation_shown') AS recs_shown,
    COUNTIF(event_name = 'recommendation_click') AS recs_clicked,

    -- Position analysis
    AVG(CASE WHEN event_name = 'recommendation_click' THEN position END) AS avg_clicked_position,
    MIN(CASE WHEN event_name = 'recommendation_click' THEN position END) AS first_clicked_position,

    -- Unique projects recommended vs clicked
    COUNT(DISTINCT CASE WHEN event_name = 'recommendation_shown' THEN recommended_project_id END) AS unique_recs_shown,
    COUNT(DISTINCT CASE WHEN event_name = 'recommendation_click' THEN recommended_project_id END) AS unique_recs_clicked

  FROM `portfolio-483605.analytics_processed.v_recommendation_events`
  GROUP BY user_pseudo_id, session_id
),

-- NEW: Certification interactions
certification_interactions AS (
  SELECT
    user_pseudo_id,
    session_id,

    -- Certification engagement
    COUNT(*) AS cert_clicks,
    COUNT(DISTINCT cert_title) AS unique_certs_clicked,
    COUNT(DISTINCT cert_issuer) AS unique_issuers_clicked,
    STRING_AGG(DISTINCT cert_title, ',' ORDER BY cert_title) AS certs_clicked

  FROM `portfolio-483605.analytics_processed.v_certification_events`
  GROUP BY user_pseudo_id, session_id
),

conversion_signals AS (
  SELECT
    user_pseudo_id,
    session_id,

    -- Conversion features
    SUM(CASE WHEN event_name = 'cta_click' THEN 1 ELSE 0 END) AS cta_clicks,
    SUM(CASE WHEN event_name = 'contact_form_start' THEN 1 ELSE 0 END) AS form_starts,
    SUM(CASE WHEN event_name = 'contact_form_submit' THEN 1 ELSE 0 END) AS form_submissions,
    SUM(CASE WHEN event_name = 'social_click' THEN 1 ELSE 0 END) AS social_clicks,
    SUM(CASE WHEN event_name = 'resume_download' THEN 1 ELSE 0 END) AS resume_downloads,
    SUM(CASE WHEN event_name = 'outbound_link' THEN 1 ELSE 0 END) AS outbound_clicks,
    SUM(CASE WHEN event_name = 'content_copy' THEN 1 ELSE 0 END) AS content_copies,
    SUM(CASE WHEN event_name = 'exit_intent' THEN 1 ELSE 0 END) AS exit_intents,

    -- Binary conversion targets
    CASE WHEN SUM(CASE WHEN event_name = 'contact_form_submit' THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS converted_contact,
    CASE WHEN SUM(CASE WHEN event_name = 'resume_download' THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS converted_resume,
    CASE WHEN SUM(CASE WHEN event_name IN ('social_click', 'outbound_link') THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS converted_external

  FROM `portfolio-483605.analytics_processed.v_conversion_events`
  GROUP BY user_pseudo_id, session_id
),

-- Aggregate project interactions at session level
session_project_summary AS (
  SELECT
    user_pseudo_id,
    session_id,
    COUNT(DISTINCT project_id) AS projects_viewed,
    SUM(project_views) AS total_project_views,
    SUM(project_clicks) AS total_project_clicks,
    SUM(project_expands) AS total_project_expands,
    SUM(project_link_clicks) AS total_project_link_clicks,
    AVG(project_engagement_score) AS avg_project_engagement,
    MAX(project_engagement_score) AS max_project_engagement,
    SUM(high_interest_flag) AS high_interest_projects

  FROM project_interactions
  GROUP BY user_pseudo_id, session_id
),

-- Aggregate section engagement at session level
session_section_summary AS (
  SELECT
    user_pseudo_id,
    session_id,
    COUNT(DISTINCT section_id) AS sections_viewed,
    SUM(section_views) AS total_section_views,
    SUM(section_engaged) AS total_sections_engaged,
    AVG(max_time_spent_seconds) AS avg_time_spent_seconds,
    MAX(max_scroll_depth_percent) AS max_scroll_depth_percent,
    MAX(max_scroll_milestone) AS max_scroll_milestone

  FROM section_engagement
  GROUP BY user_pseudo_id, session_id
)

-- Final training data
SELECT
  -- Identifiers
  sf.user_pseudo_id,
  sf.session_id,
  sf.session_date,

  -- User features
  sf.device_category,
  sf.browser,
  sf.os,
  sf.country,
  sf.traffic_source,
  sf.traffic_medium,

  -- Time features
  sf.session_hour,
  sf.session_day_of_week,
  sf.session_time_of_day,
  sf.session_day_type,

  -- Session behavior features
  sf.session_duration_seconds,
  sf.page_views,
  sf.total_events,
  sf.scroll_events,
  sf.click_events,
  sf.is_bounce,
  sf.is_engaged,

  -- Project interaction features
  COALESCE(sps.projects_viewed, 0) AS projects_viewed,
  COALESCE(sps.total_project_views, 0) AS total_project_views,
  COALESCE(sps.total_project_clicks, 0) AS total_project_clicks,
  COALESCE(sps.total_project_expands, 0) AS total_project_expands,
  COALESCE(sps.total_project_link_clicks, 0) AS total_project_link_clicks,
  COALESCE(sps.avg_project_engagement, 0) AS avg_project_engagement,
  COALESCE(sps.max_project_engagement, 0) AS max_project_engagement,
  COALESCE(sps.high_interest_projects, 0) AS high_interest_projects,

  -- Section engagement features
  COALESCE(sss.sections_viewed, 0) AS sections_viewed,
  COALESCE(sss.total_section_views, 0) AS total_section_views,
  COALESCE(sss.total_sections_engaged, 0) AS total_sections_engaged,
  COALESCE(sss.avg_time_spent_seconds, 0) AS avg_time_spent_seconds,
  COALESCE(sss.max_scroll_depth_percent, 0) AS max_scroll_depth_percent,
  COALESCE(sss.max_scroll_milestone, 0) AS max_scroll_milestone,

  -- Skill interest features
  COALESCE(si.unique_skills_clicked, 0) AS unique_skills_clicked,
  COALESCE(si.unique_skill_categories, 0) AS unique_skill_categories,
  si.skills_clicked_list,
  si.skill_categories_list,

  -- NEW: Client/Experience features
  COALESCE(ci.unique_clients_viewed, 0) AS unique_clients_viewed,
  COALESCE(ci.client_views, 0) AS client_views,
  COALESCE(ci.client_clicks, 0) AS client_clicks,
  COALESCE(ci.case_study_opens, 0) AS case_study_opens,
  COALESCE(ci.case_study_engagements, 0) AS case_study_engagements,
  COALESCE(ci.unique_domains_explored, 0) AS unique_domains_explored,
  COALESCE(ci.domain_interest_signals, 0) AS domain_interest_signals,
  ci.domains_explored,
  COALESCE(ci.problem_reads, 0) AS problem_reads,
  COALESCE(ci.solution_reads, 0) AS solution_reads,
  COALESCE(ci.avg_problem_read_time, 0) AS avg_problem_read_time,
  COALESCE(ci.avg_solution_read_time, 0) AS avg_solution_read_time,
  COALESCE(ci.contribution_views, 0) AS contribution_views,
  COALESCE(ci.client_tech_clicks, 0) AS client_tech_clicks,
  ci.client_technologies_clicked,
  COALESCE(ci.experience_interest_signals, 0) AS experience_interest_signals,

  -- NEW: Recommendation features
  COALESCE(ri.recs_shown, 0) AS recs_shown,
  COALESCE(ri.recs_clicked, 0) AS recs_clicked,
  ri.avg_clicked_position,
  ri.first_clicked_position,
  COALESCE(ri.unique_recs_shown, 0) AS unique_recs_shown,
  COALESCE(ri.unique_recs_clicked, 0) AS unique_recs_clicked,
  -- Recommendation CTR
  CASE
    WHEN COALESCE(ri.recs_shown, 0) > 0
    THEN ROUND(COALESCE(ri.recs_clicked, 0) * 100.0 / ri.recs_shown, 2)
    ELSE 0
  END AS recommendation_ctr,

  -- NEW: Certification features
  COALESCE(cert.cert_clicks, 0) AS cert_clicks,
  COALESCE(cert.unique_certs_clicked, 0) AS unique_certs_clicked,
  cert.certs_clicked,

  -- Conversion features
  COALESCE(cs.cta_clicks, 0) AS cta_clicks,
  COALESCE(cs.form_starts, 0) AS form_starts,
  COALESCE(cs.form_submissions, 0) AS form_submissions,
  COALESCE(cs.social_clicks, 0) AS social_clicks,
  COALESCE(cs.resume_downloads, 0) AS resume_downloads,
  COALESCE(cs.outbound_clicks, 0) AS outbound_clicks,
  COALESCE(cs.content_copies, 0) AS content_copies,
  COALESCE(cs.exit_intents, 0) AS exit_intents,

  -- =============================================
  -- TARGET VARIABLES
  -- =============================================

  -- Binary targets
  COALESCE(cs.converted_contact, 0) AS target_contact_conversion,
  COALESCE(cs.converted_resume, 0) AS target_resume_conversion,
  COALESCE(cs.converted_external, 0) AS target_external_conversion,

  -- Overall engagement score (regression target)
  (
    COALESCE(sf.session_duration_seconds, 0) / 60.0 +  -- Minutes on site
    COALESCE(sf.page_views, 0) * 2 +
    COALESCE(sps.total_project_clicks, 0) * 5 +
    COALESCE(sps.total_project_expands, 0) * 10 +
    COALESCE(sps.total_project_link_clicks, 0) * 15 +
    COALESCE(ci.case_study_opens, 0) * 8 +
    COALESCE(ci.case_study_engagements, 0) * 12 +
    COALESCE(ri.recs_clicked, 0) * 6 +
    COALESCE(cs.form_submissions, 0) * 50 +
    COALESCE(cs.resume_downloads, 0) * 40 +
    COALESCE(cs.social_clicks, 0) * 10
  ) AS target_engagement_score,

  -- High-value visitor classification (binary)
  CASE
    WHEN COALESCE(cs.form_submissions, 0) > 0 OR COALESCE(cs.resume_downloads, 0) > 0 THEN 1
    WHEN COALESCE(sps.high_interest_projects, 0) >= 2 THEN 1
    WHEN COALESCE(ci.case_study_engagements, 0) >= 1 THEN 1
    WHEN sf.is_engaged = TRUE AND COALESCE(sps.projects_viewed, 0) >= 3 THEN 1
    ELSE 0
  END AS target_high_value_visitor,

  -- NEW: Recruiter likelihood (binary target)
  CASE
    WHEN COALESCE(ci.experience_interest_signals, 0) > 0 THEN 1
    WHEN COALESCE(ci.unique_domains_explored, 0) >= 2 AND COALESCE(cs.resume_downloads, 0) > 0 THEN 1
    WHEN COALESCE(ci.case_study_opens, 0) >= 2 AND COALESCE(ci.problem_reads, 0) > 0 THEN 1
    ELSE 0
  END AS target_likely_recruiter,

  -- NEW: Deep explorer (binary target)
  CASE
    WHEN COALESCE(ci.problem_reads, 0) > 0 AND COALESCE(ci.solution_reads, 0) > 0 THEN 1
    WHEN COALESCE(sps.total_project_expands, 0) >= 2 THEN 1
    WHEN COALESCE(sss.max_scroll_depth_percent, 0) >= 75 AND COALESCE(sf.session_duration_seconds, 0) > 180 THEN 1
    ELSE 0
  END AS target_deep_explorer

FROM session_features sf
LEFT JOIN session_project_summary sps
  ON sf.user_pseudo_id = sps.user_pseudo_id AND sf.session_id = sps.session_id
LEFT JOIN session_section_summary sss
  ON sf.user_pseudo_id = sss.user_pseudo_id AND sf.session_id = sss.session_id
LEFT JOIN skill_interests si
  ON sf.user_pseudo_id = si.user_pseudo_id AND sf.session_id = si.session_id
LEFT JOIN client_interactions ci
  ON sf.user_pseudo_id = ci.user_pseudo_id AND sf.session_id = ci.session_id
LEFT JOIN recommendation_interactions ri
  ON sf.user_pseudo_id = ri.user_pseudo_id AND sf.session_id = ri.session_id
LEFT JOIN certification_interactions cert
  ON sf.user_pseudo_id = cert.user_pseudo_id AND sf.session_id = cert.session_id
LEFT JOIN conversion_signals cs
  ON sf.user_pseudo_id = cs.user_pseudo_id AND sf.session_id = cs.session_id

ORDER BY sf.session_date DESC, sf.user_pseudo_id;
