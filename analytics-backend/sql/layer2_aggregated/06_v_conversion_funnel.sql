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
    STRING_AGG(DISTINCT social_platform IGNORE NULLS, ',') AS social_platforms_clicked,

    -- Outbound links
    MAX(CASE WHEN event_name = 'outbound_link' THEN 1 ELSE 0 END) AS clicked_outbound,
    STRING_AGG(DISTINCT link_domain IGNORE NULLS, ',') AS outbound_domains,

    -- Resume/files
    MAX(CASE WHEN event_name = 'resume_download' THEN 1 ELSE 0 END) AS downloaded_resume,
    MAX(CASE WHEN event_name = 'file_download' THEN 1 ELSE 0 END) AS downloaded_file,

    -- Publication clicks
    MAX(CASE WHEN event_name = 'publication_click' THEN 1 ELSE 0 END) AS clicked_publication,

    -- Content copy
    MAX(CASE WHEN event_name = 'content_copy' THEN 1 ELSE 0 END) AS copied_content,

    -- Exit intent (negative signal)
    MAX(CASE WHEN event_name = 'exit_intent' THEN 1 ELSE 0 END) AS triggered_exit_intent

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
  ) AS avg_conversion_score

FROM session_conversions
GROUP BY event_date
ORDER BY event_date DESC;
