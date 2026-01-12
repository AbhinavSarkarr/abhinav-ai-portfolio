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
