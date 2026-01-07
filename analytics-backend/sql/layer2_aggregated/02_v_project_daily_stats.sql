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
  COUNTIF(event_name = 'project_expand') AS expands,
  COUNTIF(event_name = 'project_link_click') AS link_clicks,

  -- Engagement
  AVG(view_duration_ms) AS avg_view_duration_ms,
  AVG(time_on_page_sec) AS avg_time_on_page_sec,

  -- Click-through rate
  ROUND(
    COUNTIF(event_name IN ('project_click', 'project_expand', 'project_link_click')) * 100.0 /
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
  COUNTIF(device_category = 'mobile') AS mobile_interactions

FROM `portfolio-483605.analytics_processed.v_project_events`
WHERE project_id IS NOT NULL
GROUP BY event_date, project_id, project_title, project_category
ORDER BY event_date DESC, views DESC;
