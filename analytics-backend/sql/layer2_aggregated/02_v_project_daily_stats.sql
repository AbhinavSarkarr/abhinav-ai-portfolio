-- Layer 2: Aggregated View - Project Daily Stats
-- Project engagement metrics aggregated by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_project_daily_stats` AS
SELECT
  event_date,
  project_id,
  project_title,
  project_category,

  -- View metrics (use clicks as fallback for historical data where views weren't tracked)
  GREATEST(
    COUNTIF(event_name = 'project_view'),
    COUNTIF(event_name = 'project_click')
  ) AS views,
  COUNT(DISTINCT CASE WHEN event_name IN ('project_view', 'project_click') THEN user_pseudo_id END) AS unique_viewers,
  COUNT(DISTINCT CASE WHEN event_name IN ('project_view', 'project_click') THEN session_id END) AS unique_sessions,

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
