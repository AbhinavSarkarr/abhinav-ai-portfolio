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
