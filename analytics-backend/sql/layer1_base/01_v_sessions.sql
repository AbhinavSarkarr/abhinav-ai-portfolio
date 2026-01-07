-- Layer 1: Base View - Sessions
-- Extracts session-level data from GA4 events
-- Dataset: portfolio-483605.analytics_PROPERTY_ID

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_sessions` AS
WITH session_data AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    MIN(TIMESTAMP_MICROS(event_timestamp)) AS session_start,
    MAX(TIMESTAMP_MICROS(event_timestamp)) AS session_end,

    -- Device info
    device.category AS device_category,
    device.operating_system AS os,
    device.browser AS browser,
    device.is_limited_ad_tracking AS limited_ad_tracking,
    device.mobile_brand_name AS mobile_brand,
    device.mobile_model_name AS mobile_model,
    device.language AS device_language,

    -- Geo info
    geo.country AS country,
    geo.region AS region,
    geo.city AS city,
    geo.continent AS continent,

    -- Traffic source
    traffic_source.source AS traffic_source,
    traffic_source.medium AS traffic_medium,
    traffic_source.name AS campaign_name,

    -- Session metrics
    COUNT(*) AS total_events,
    COUNTIF(event_name = 'page_view') AS page_views,
    COUNTIF(event_name = 'scroll') AS scroll_events,
    COUNTIF(event_name = 'click') AS click_events,

    -- Engagement signals
    MAX((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engaged_session_event')) AS engaged_session,
    MAX((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) AS max_engagement_time_msec,

    -- First page
    MIN(CASE WHEN event_name = 'page_view'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')
        END) AS landing_page,

    -- Last page
    MAX(CASE WHEN event_name = 'page_view'
        THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')
        END) AS exit_page

  FROM `portfolio-483605.analytics_*.events_*`
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
  *,
  TIMESTAMP_DIFF(session_end, session_start, SECOND) AS session_duration_seconds,
  DATE(session_start) AS session_date,
  EXTRACT(HOUR FROM session_start) AS session_hour,
  EXTRACT(DAYOFWEEK FROM session_start) AS session_day_of_week,
  CASE
    WHEN page_views = 1 THEN TRUE
    ELSE FALSE
  END AS is_bounce,
  CASE
    WHEN engaged_session = 1 OR TIMESTAMP_DIFF(session_end, session_start, SECOND) > 10 THEN TRUE
    ELSE FALSE
  END AS is_engaged
FROM session_data
WHERE session_id IS NOT NULL;
