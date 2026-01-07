-- ML Training Data View
-- Comprehensive feature set for training recommendation models
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
    SUM(CASE WHEN event_name = 'project_expand' THEN 1 ELSE 0 END) AS project_expands,
    SUM(CASE WHEN event_name = 'project_link_click' THEN 1 ELSE 0 END) AS project_link_clicks,
    MAX(view_duration_ms) AS max_view_duration_ms,
    AVG(display_position) AS avg_display_position,

    -- Engagement score for this project
    (SUM(CASE WHEN event_name = 'project_view' THEN 1 ELSE 0 END) * 1 +
     SUM(CASE WHEN event_name = 'project_click' THEN 1 ELSE 0 END) * 3 +
     SUM(CASE WHEN event_name = 'project_expand' THEN 1 ELSE 0 END) * 5 +
     SUM(CASE WHEN event_name = 'project_link_click' THEN 1 ELSE 0 END) * 7) AS project_engagement_score,

    -- Binary target: did user show strong interest?
    CASE
      WHEN SUM(CASE WHEN event_name IN ('project_expand', 'project_link_click') THEN 1 ELSE 0 END) > 0 THEN 1
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
    SUM(CASE WHEN event_name = 'section_engaged' THEN 1 ELSE 0 END) AS section_engaged,
    MAX(view_duration_ms) AS max_section_duration_ms,
    MAX(scroll_depth) AS max_scroll_depth,
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
    AVG(max_section_duration_ms) AS avg_section_duration_ms,
    MAX(max_scroll_depth) AS max_scroll_depth,
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
  COALESCE(sss.avg_section_duration_ms, 0) AS avg_section_duration_ms,
  COALESCE(sss.max_scroll_depth, 0) AS max_scroll_depth,
  COALESCE(sss.max_scroll_milestone, 0) AS max_scroll_milestone,

  -- Skill interest features
  COALESCE(si.unique_skills_clicked, 0) AS unique_skills_clicked,
  COALESCE(si.unique_skill_categories, 0) AS unique_skill_categories,
  si.skills_clicked_list,
  si.skill_categories_list,

  -- Conversion features
  COALESCE(cs.cta_clicks, 0) AS cta_clicks,
  COALESCE(cs.form_starts, 0) AS form_starts,
  COALESCE(cs.form_submissions, 0) AS form_submissions,
  COALESCE(cs.social_clicks, 0) AS social_clicks,
  COALESCE(cs.resume_downloads, 0) AS resume_downloads,
  COALESCE(cs.outbound_clicks, 0) AS outbound_clicks,
  COALESCE(cs.content_copies, 0) AS content_copies,
  COALESCE(cs.exit_intents, 0) AS exit_intents,

  -- Target variables
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
    COALESCE(cs.form_submissions, 0) * 50 +
    COALESCE(cs.resume_downloads, 0) * 40 +
    COALESCE(cs.social_clicks, 0) * 10
  ) AS target_engagement_score,

  -- High-value visitor classification (binary)
  CASE
    WHEN COALESCE(cs.form_submissions, 0) > 0 OR COALESCE(cs.resume_downloads, 0) > 0 THEN 1
    WHEN COALESCE(sps.high_interest_projects, 0) >= 2 THEN 1
    WHEN sf.is_engaged = TRUE AND COALESCE(sps.projects_viewed, 0) >= 3 THEN 1
    ELSE 0
  END AS target_high_value_visitor

FROM session_features sf
LEFT JOIN session_project_summary sps
  ON sf.user_pseudo_id = sps.user_pseudo_id AND sf.session_id = sps.session_id
LEFT JOIN session_section_summary sss
  ON sf.user_pseudo_id = sss.user_pseudo_id AND sf.session_id = sss.session_id
LEFT JOIN skill_interests si
  ON sf.user_pseudo_id = si.user_pseudo_id AND sf.session_id = si.session_id
LEFT JOIN conversion_signals cs
  ON sf.user_pseudo_id = cs.user_pseudo_id AND sf.session_id = cs.session_id

ORDER BY sf.session_date DESC, sf.user_pseudo_id;
