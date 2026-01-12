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
