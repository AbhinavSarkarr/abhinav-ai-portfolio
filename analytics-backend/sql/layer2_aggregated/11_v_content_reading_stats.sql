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
    read_time_seconds
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

  -- Per domain reading patterns
  ARRAY_AGG(
    STRUCT(
      domain,
      AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_time,
      AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END) AS avg_solution_time
    )
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS domain_reading_patterns,

  -- Per client reading patterns
  ARRAY_AGG(
    STRUCT(
      client_name,
      AVG(CASE WHEN event_name = 'problem_statement_read' THEN read_time_seconds END) AS avg_problem_time,
      AVG(CASE WHEN event_name = 'solution_read' THEN read_time_seconds END) AS avg_solution_time,
      COUNT(*) AS total_reads
    )
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS client_reading_patterns

FROM reading_events
GROUP BY event_date
ORDER BY event_date DESC;
