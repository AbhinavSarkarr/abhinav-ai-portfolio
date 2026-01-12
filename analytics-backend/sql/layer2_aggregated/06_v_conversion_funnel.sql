-- Layer 2: Aggregated View - Conversion Funnel
-- Track conversion events and funnel progression by day
-- Dataset: portfolio-483605.analytics_processed

CREATE OR REPLACE VIEW `portfolio-483605.analytics_processed.v_conversion_funnel` AS
WITH session_conversions AS (
  SELECT
    DATE(event_timestamp) AS event_date,
    user_pseudo_id,
    session_id,

    -- CTA interactions
    COUNTIF(event_name = 'cta_view') AS cta_views,
    COUNTIF(event_name = 'cta_click') AS cta_clicks,

    -- Contact form funnel
    MAX(CASE WHEN event_name = 'contact_form_start' THEN 1 ELSE 0 END) AS started_contact_form,
    MAX(CASE WHEN event_name = 'contact_form_field_focus' THEN 1 ELSE 0 END) AS focused_form_field,
    MAX(CASE WHEN event_name = 'contact_form_submit' AND submission_status = 'success' THEN 1 ELSE 0 END) AS submitted_contact_form,

    -- Social clicks
    MAX(CASE WHEN event_name = 'social_click' THEN 1 ELSE 0 END) AS clicked_social,
    STRING_AGG(DISTINCT social_platform, ',') AS social_platforms_clicked,

    -- Outbound links
    MAX(CASE WHEN event_name = 'outbound_link' THEN 1 ELSE 0 END) AS clicked_outbound,
    STRING_AGG(DISTINCT link_domain, ',') AS outbound_domains,

    -- Resume/files
    MAX(CASE WHEN event_name = 'resume_download' THEN 1 ELSE 0 END) AS downloaded_resume,
    MAX(CASE WHEN event_name = 'file_download' THEN 1 ELSE 0 END) AS downloaded_file,

    -- Publication clicks
    MAX(CASE WHEN event_name = 'publication_click' THEN 1 ELSE 0 END) AS clicked_publication,

    -- Content copy
    MAX(CASE WHEN event_name = 'content_copy' THEN 1 ELSE 0 END) AS copied_content,

    -- Exit intent (negative signal)
    MAX(CASE WHEN event_name = 'exit_intent' THEN 1 ELSE 0 END) AS triggered_exit_intent,

    -- Conversion context (NEW - from enhanced v_conversion_events)
    AVG(time_on_site_before_start) AS avg_time_on_site_before_start,
    AVG(sections_viewed) AS avg_sections_viewed,
    AVG(projects_viewed) AS avg_projects_viewed,
    AVG(projects_clicked_before) AS avg_projects_clicked_before,
    AVG(scroll_depth_at_start) AS avg_scroll_depth_at_start,

    -- Form engagement (NEW)
    AVG(message_length) AS avg_message_length,
    AVG(time_to_submit_sec) AS avg_time_to_submit,

    -- Returning visitor conversions (NEW)
    MAX(CASE WHEN is_returning_visitor = 'true' THEN 1 ELSE 0 END) AS is_returning_visitor,

    -- Download source (NEW)
    STRING_AGG(DISTINCT download_source, ',') AS download_sources,

    -- Exit behavior (NEW)
    STRING_AGG(DISTINCT exit_trigger, ',') AS exit_triggers,
    MAX(CASE WHEN was_idle = 'true' THEN 1 ELSE 0 END) AS was_idle_before_exit,
    MAX(conversions_count) AS max_conversions_in_session

  FROM `portfolio-483605.analytics_processed.v_conversion_events`
  GROUP BY event_date, user_pseudo_id, session_id
)

SELECT
  event_date,

  -- Session counts
  COUNT(*) AS total_sessions,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,

  -- CTA funnel
  SUM(cta_views) AS total_cta_views,
  SUM(cta_clicks) AS total_cta_clicks,
  ROUND(SUM(cta_clicks) * 100.0 / NULLIF(SUM(cta_views), 0), 2) AS cta_click_rate,

  -- Contact form funnel
  SUM(started_contact_form) AS contact_form_starts,
  SUM(focused_form_field) AS contact_form_field_focuses,
  SUM(submitted_contact_form) AS contact_form_submissions,
  ROUND(SUM(submitted_contact_form) * 100.0 / NULLIF(SUM(started_contact_form), 0), 2) AS form_completion_rate,

  -- Social engagement
  SUM(clicked_social) AS social_clicks,
  ROUND(SUM(clicked_social) * 100.0 / NULLIF(COUNT(*), 0), 2) AS social_click_rate,

  -- Outbound interest
  SUM(clicked_outbound) AS outbound_clicks,
  ROUND(SUM(clicked_outbound) * 100.0 / NULLIF(COUNT(*), 0), 2) AS outbound_click_rate,

  -- Downloads
  SUM(downloaded_resume) AS resume_downloads,
  SUM(downloaded_file) AS file_downloads,

  -- Publications
  SUM(clicked_publication) AS publication_clicks,

  -- Content copy (strong interest signal)
  SUM(copied_content) AS content_copies,

  -- Exit intent rate (negative signal)
  ROUND(SUM(triggered_exit_intent) * 100.0 / NULLIF(COUNT(*), 0), 2) AS exit_intent_rate,

  -- Overall conversion score
  ROUND(
    (SUM(submitted_contact_form) * 10 +
     SUM(downloaded_resume) * 8 +
     SUM(clicked_social) * 3 +
     SUM(clicked_outbound) * 2 +
     SUM(copied_content) * 4) * 1.0 / NULLIF(COUNT(*), 0),
    3
  ) AS avg_conversion_score,

  -- Conversion context aggregates (NEW)
  ROUND(AVG(avg_time_on_site_before_start), 1) AS avg_time_to_conversion_start,
  ROUND(AVG(avg_sections_viewed), 1) AS avg_sections_before_conversion,
  ROUND(AVG(avg_projects_viewed), 1) AS avg_projects_before_conversion,
  ROUND(AVG(avg_projects_clicked_before), 1) AS avg_projects_clicked_before_conversion,
  ROUND(AVG(avg_scroll_depth_at_start), 1) AS avg_scroll_depth_at_conversion,

  -- Form quality metrics (NEW)
  ROUND(AVG(avg_message_length), 0) AS avg_contact_message_length,
  ROUND(AVG(avg_time_to_submit), 1) AS avg_form_completion_time_sec,

  -- Returning visitor conversion (NEW)
  SUM(is_returning_visitor) AS returning_visitor_conversions,
  ROUND(SUM(is_returning_visitor) * 100.0 / NULLIF(SUM(submitted_contact_form) + SUM(downloaded_resume), 0), 2) AS returning_visitor_conversion_share,

  -- Exit behavior analysis (NEW)
  SUM(was_idle_before_exit) AS idle_exits,
  ROUND(SUM(was_idle_before_exit) * 100.0 / NULLIF(SUM(triggered_exit_intent), 0), 2) AS idle_exit_rate

FROM session_conversions
GROUP BY event_date
ORDER BY event_date DESC;
