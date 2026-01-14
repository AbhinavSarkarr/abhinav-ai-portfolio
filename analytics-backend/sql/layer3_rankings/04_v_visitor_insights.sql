-- Layer 3: Insights View - Visitor Insights
-- Comprehensive visitor behavior analysis
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_visitor_insights` AS
WITH visitor_sessions AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT session_id) AS total_sessions,
    MIN(session_start) AS first_visit,
    MAX(session_end) AS last_visit,
    SUM(page_views) AS total_page_views,
    AVG(session_duration_seconds) AS avg_session_duration,
    COUNTIF(is_engaged) AS engaged_sessions,
    ANY_VALUE(device_category) AS primary_device,
    ANY_VALUE(country) AS primary_country,
    ANY_VALUE(traffic_source) AS primary_traffic_source,
    ARRAY_AGG(DISTINCT landing_page IGNORE NULLS LIMIT 5) AS landing_pages,
    ARRAY_AGG(DISTINCT exit_page IGNORE NULLS LIMIT 5) AS exit_pages

  FROM `portfolio-483605.analytics_processed.v_sessions`
  WHERE session_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY user_pseudo_id
),

visitor_projects AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT project_id) AS projects_viewed,
    ARRAY_AGG(DISTINCT project_id IGNORE NULLS ORDER BY project_id LIMIT 10) AS project_ids_viewed,
    ARRAY_AGG(DISTINCT project_category IGNORE NULLS LIMIT 5) AS project_categories_viewed,
    ARRAY_AGG(DISTINCT technology IGNORE NULLS LIMIT 10) AS technologies_explored

  FROM `portfolio-483605.analytics_processed.v_project_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  GROUP BY user_pseudo_id
),

visitor_skills AS (
  SELECT
    user_pseudo_id,
    ARRAY_AGG(DISTINCT skill_name IGNORE NULLS ORDER BY skill_name LIMIT 15) AS skills_clicked,
    ARRAY_AGG(DISTINCT skill_category IGNORE NULLS LIMIT 5) AS skill_categories

  FROM `portfolio-483605.analytics_processed.v_skill_events`
  WHERE event_date >= FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  GROUP BY user_pseudo_id
),

visitor_conversions AS (
  SELECT
    user_pseudo_id,
    COUNTIF(event_name = 'cta_click') AS cta_clicks,
    COUNTIF(event_name = 'contact_form_submit') AS form_submissions,
    COUNTIF(event_name = 'social_click') AS social_clicks,
    COUNTIF(event_name = 'resume_download') AS resume_downloads,
    COUNTIF(event_name = 'outbound_link') AS outbound_clicks,
    COUNTIF(event_name = 'publication_click') AS publication_clicks,
    COUNTIF(event_name = 'content_copy') AS content_copies

  FROM `portfolio-483605.analytics_processed.v_conversion_events`
  WHERE DATE(event_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY user_pseudo_id
)

SELECT
  vs.user_pseudo_id,

  -- Session metrics
  vs.total_sessions,
  vs.first_visit,
  vs.last_visit,
  DATE_DIFF(DATE(vs.last_visit), DATE(vs.first_visit), DAY) AS visitor_tenure_days,
  vs.total_page_views,
  ROUND(vs.avg_session_duration, 2) AS avg_session_duration_sec,
  vs.engaged_sessions,
  ROUND(vs.engaged_sessions * 100.0 / NULLIF(vs.total_sessions, 0), 2) AS engagement_rate,

  -- Device and location
  vs.primary_device,
  vs.primary_country,
  vs.primary_traffic_source,
  vs.landing_pages,
  vs.exit_pages,

  -- Content engagement
  COALESCE(vp.projects_viewed, 0) AS projects_viewed,
  vp.project_ids_viewed,
  vp.project_categories_viewed,
  vp.technologies_explored,
  vsk.skills_clicked,
  vsk.skill_categories,

  -- Conversion signals
  COALESCE(vc.cta_clicks, 0) AS cta_clicks,
  COALESCE(vc.form_submissions, 0) AS form_submissions,
  COALESCE(vc.social_clicks, 0) AS social_clicks,
  COALESCE(vc.resume_downloads, 0) AS resume_downloads,
  COALESCE(vc.outbound_clicks, 0) AS outbound_clicks,
  COALESCE(vc.publication_clicks, 0) AS publication_clicks,
  COALESCE(vc.content_copies, 0) AS content_copies,

  -- Visitor value score
  (
    (vs.total_sessions * 1) +
    (vs.engaged_sessions * 3) +
    (COALESCE(vp.projects_viewed, 0) * 2) +
    (COALESCE(vc.form_submissions, 0) * 20) +
    (COALESCE(vc.resume_downloads, 0) * 15) +
    (COALESCE(vc.social_clicks, 0) * 5) +
    (COALESCE(vc.content_copies, 0) * 8)
  ) AS visitor_value_score,

  -- Visitor segment
  -- A "converter" is anyone who performed a conversion action (form submission OR resume download)
  CASE
    WHEN COALESCE(vc.form_submissions, 0) > 0
      OR COALESCE(vc.resume_downloads, 0) > 0 THEN 'converter'
    WHEN vs.engaged_sessions >= 2 AND COALESCE(vp.projects_viewed, 0) >= 3 THEN 'engaged_explorer'
    WHEN vs.total_sessions >= 2 THEN 'returning_visitor'
    WHEN vs.engaged_sessions = 1 THEN 'engaged_new'
    ELSE 'casual_browser'
  END AS visitor_segment,

  -- Interest profile
  CASE
    WHEN ARRAY_LENGTH(vp.technologies_explored) > 5 THEN 'tech_enthusiast'
    WHEN ARRAY_LENGTH(vsk.skills_clicked) > 3 THEN 'skills_focused'
    WHEN COALESCE(vp.projects_viewed, 0) >= 4 THEN 'portfolio_explorer'
    WHEN COALESCE(vc.publication_clicks, 0) > 0 THEN 'research_interested'
    ELSE 'general_visitor'
  END AS interest_profile

FROM visitor_sessions vs
LEFT JOIN visitor_projects vp ON vs.user_pseudo_id = vp.user_pseudo_id
LEFT JOIN visitor_skills vsk ON vs.user_pseudo_id = vsk.user_pseudo_id
LEFT JOIN visitor_conversions vc ON vs.user_pseudo_id = vc.user_pseudo_id
ORDER BY visitor_value_score DESC;
