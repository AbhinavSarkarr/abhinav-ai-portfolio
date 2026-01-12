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
