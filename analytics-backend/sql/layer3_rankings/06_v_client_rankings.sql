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
  WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
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
