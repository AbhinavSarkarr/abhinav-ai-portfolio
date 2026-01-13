# BigQuery Materialized Tables Schema Reference

> **Last Updated:** January 12, 2026
> **Dataset:** `portfolio-483605.analytics_materialized`
> **Total Tables:** 31
> **Source:** Queried from `INFORMATION_SCHEMA.COLUMNS`

This document provides comprehensive schema documentation for all materialized tables in the analytics pipeline.

---

## Table of Contents

- [Overview](#overview)
- [Layer 1: Base Views (Event-Level Data)](#layer-1-base-views)
- [Layer 2: Aggregated Views (Daily Stats)](#layer-2-aggregated-views)
- [Layer 3: Rankings & Insights](#layer-3-rankings--insights)
- [ML Layer: Training Data](#ml-layer)

---

## Overview

### Row Counts Summary

| Layer | Table | Rows | Columns |
|-------|-------|------|---------|
| **Layer 1** | sessions | 231 | 51 |
| | page_views | 814 | 23 |
| | project_events | 176 | 33 |
| | section_events | 6,073 | 26 |
| | skill_events | 27 | 21 |
| | conversion_events | 20 | 43 |
| | client_events | 110 | 30 |
| | recommendation_events | 0 | 22 |
| | certification_events | 0 | 17 |
| **Layer 2** | daily_metrics | 5 | 30 |
| | project_daily_stats | 22 | 35 |
| | section_daily_stats | 32 | 26 |
| | skill_daily_stats | 10 | 19 |
| | traffic_daily_stats | 25 | 20 |
| | conversion_funnel | 2 | 32 |
| | client_daily_stats | 0 | 32 |
| | domain_daily_stats | 14 | 19 |
| | experience_daily_stats | 8 | 14 |
| | recommendation_daily_stats | 0 | 20 |
| | content_reading_stats | 0 | 18 |
| **Layer 3** | project_rankings | 10 | 21 |
| | skill_rankings | 10 | 14 |
| | section_rankings | 8 | 19 |
| | visitor_insights | 117 | 31 |
| | recommendations | 580 | 9 |
| | client_rankings | 0 | 23 |
| | domain_rankings | 7 | 12 |
| | experience_rankings | 2 | 12 |
| | recommendation_performance | 1 | 15 |
| | tech_demand_insights | 10 | 9 |
| **ML** | ml_training_data | 231 | 80 |

---

## Layer 1: Base Views

> Event-level data extracted and enriched from raw GA4 events.

### 1.1 `sessions`

**Description:** Session-level aggregation of all user visits with device, geo, and engagement data.

**Row Count:** 231 | **Columns:** 51

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `user_pseudo_id` | STRING | YES | Unique anonymous visitor ID |
| `session_id` | INT64 | YES | Session identifier |
| `session_start` | TIMESTAMP | YES | Session start time |
| `session_end` | TIMESTAMP | YES | Session end time |
| `device_category` | STRING | YES | Device type (desktop/mobile/tablet) |
| `os` | STRING | YES | Operating system |
| `browser` | STRING | YES | Browser name |
| `limited_ad_tracking` | STRING | YES | Ad tracking status |
| `mobile_brand` | STRING | YES | Mobile device brand |
| `mobile_model` | STRING | YES | Mobile device model |
| `device_language` | STRING | YES | Device language setting |
| `country` | STRING | YES | Country name |
| `region` | STRING | YES | State/region |
| `city` | STRING | YES | City name |
| `continent` | STRING | YES | Continent |
| `traffic_source` | STRING | YES | Traffic source |
| `traffic_medium` | STRING | YES | Traffic medium |
| `campaign_name` | STRING | YES | Campaign name |
| `total_events` | INT64 | YES | Total events in session |
| `page_views` | INT64 | YES | Page view count |
| `scroll_events` | INT64 | YES | Scroll event count |
| `click_events` | INT64 | YES | Click event count |
| `engaged_session` | INT64 | YES | Engaged session flag |
| `max_engagement_time_msec` | INT64 | YES | Max engagement time (ms) |
| `landing_page` | STRING | YES | First page URL |
| `exit_page` | STRING | YES | Last page URL |
| `visit_count` | INT64 | YES | Visit number for user |
| `days_since_last_visit` | INT64 | YES | Days since previous visit |
| `is_returning` | BOOL | YES | Returning visitor flag |
| `engagement_score` | INT64 | YES | Calculated engagement score |
| `engagement_level` | STRING | YES | Engagement tier |
| `max_scroll_depth` | INT64 | YES | Maximum scroll depth % |
| `sections_viewed_count` | INT64 | YES | Sections viewed count |
| `projects_clicked_count` | INT64 | YES | Projects clicked count |
| `conversions_count` | INT64 | YES | Conversions count |
| `day_of_week_name` | STRING | YES | Day name (Monday, etc.) |
| `hour_of_day` | INT64 | YES | Hour (0-23) |
| `local_timezone` | STRING | YES | User's timezone |
| `color_scheme` | STRING | YES | Dark/light mode preference |
| `user_language` | STRING | YES | Browser language |
| `connection_type` | STRING | YES | Network type (4g, wifi) |
| `session_duration_seconds` | INT64 | YES | Total session duration |
| `session_date` | DATE | YES | Session date |
| `session_hour` | INT64 | YES | Session start hour |
| `session_day_of_week` | INT64 | YES | Day of week (0-6) |
| `is_bounce` | BOOL | YES | Single-page session flag |
| `is_engaged` | BOOL | YES | Met engagement threshold |
| `engagement_tier` | STRING | YES | Engagement tier label |
| `visitor_type` | STRING | YES | Visitor type classification |
| `has_conversion` | BOOL | YES | Had conversion event |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.2 `page_views`

**Description:** Individual page view events with navigation context.

**Row Count:** 814 | **Columns:** 23

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date (YYYYMMDD) |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `page_url` | STRING | YES | Full page URL |
| `page_title` | STRING | YES | Page title |
| `page_referrer` | STRING | YES | Referrer URL |
| `section_hash` | STRING | YES | URL hash fragment (#section) |
| `previous_page` | STRING | YES | Previous page URL |
| `page_type` | STRING | YES | Page classification |
| `page_number` | INT64 | YES | Page position in session |
| `time_on_previous_page_sec` | INT64 | YES | Time spent on prev page |
| `time_since_session_start_sec` | INT64 | YES | Seconds since session start |
| `engagement_time_msec` | INT64 | YES | Engagement time (ms) |
| `is_entrance` | INT64 | YES | Is entrance page (1/0) |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser name |
| `os` | STRING | YES | Operating system |
| `country` | STRING | YES | Country |
| `city` | STRING | YES | City |
| `traffic_source` | STRING | YES | Source |
| `traffic_medium` | STRING | YES | Medium |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.3 `project_events`

**Description:** All project-related interactions (views, clicks, expands, link clicks).

**Row Count:** 176 | **Columns:** 33

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type (project_view, project_click, etc.) |
| `project_id` | STRING | YES | Project identifier |
| `project_title` | STRING | YES | Project name |
| `project_category` | STRING | YES | Project category |
| `action_type` | STRING | YES | Action type |
| `technology` | STRING | YES | Technology clicked |
| `display_position` | INT64 | YES | Card display position |
| `view_duration_ms` | INT64 | YES | View duration (ms) |
| `time_on_page_sec` | INT64 | YES | Time on page |
| `is_first_view` | STRING | YES | First time viewing |
| `projects_viewed_before` | INT64 | YES | Projects viewed count |
| `was_recommended` | STRING | YES | From recommendation |
| `hover_duration_sec` | INT64 | YES | Hover duration |
| `projects_clicked_before` | INT64 | YES | Prior clicks count |
| `is_from_skill_click` | STRING | YES | Came from skill click |
| `source_skill` | STRING | YES | Source skill name |
| `scroll_depth_percent` | INT64 | YES | Case study scroll % |
| `sections_read_count` | INT64 | YES | Sections read count |
| `completion_rate` | INT64 | YES | Case study completion % |
| `is_deep_read` | STRING | YES | Deep read flag |
| `link_type` | STRING | YES | Link type (github, demo) |
| `link_url` | STRING | YES | Link URL |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `city` | STRING | YES | City |
| `traffic_source` | STRING | YES | Source |
| `traffic_medium` | STRING | YES | Medium |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.4 `section_events`

**Description:** Section-level engagement tracking (views, engagement, exits, scrolls).

**Row Count:** 6,073 | **Columns:** 26

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type (section_view, section_engagement, etc.) |
| `section_id` | STRING | YES | Section identifier |
| `section_name` | STRING | YES | Section display name |
| `time_spent_seconds` | INT64 | YES | Time in section |
| `scroll_depth_percent` | INT64 | YES | Scroll depth % |
| `engagement_value` | INT64 | YES | Engagement value |
| `scroll_milestone` | INT64 | YES | Scroll milestone reached |
| `time_threshold_sec` | INT64 | YES | Time threshold reached |
| `entry_direction` | STRING | YES | Entry direction (scroll_down, scroll_up) |
| `previous_section` | STRING | YES | Previous section ID |
| `section_position` | INT64 | YES | Section position |
| `exit_direction` | STRING | YES | Exit direction |
| `scroll_velocity` | INT64 | YES | Scroll speed |
| `time_to_reach_depth_sec` | INT64 | YES | Time to reach scroll depth |
| `is_bouncing` | STRING | YES | Quick exit flag |
| `from_section` | STRING | YES | Navigation from section |
| `to_section` | STRING | YES | Navigation to section |
| `navigation_method` | STRING | YES | Navigation method |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.5 `skill_events`

**Description:** Skill badge/tag click events.

**Row Count:** 27 | **Columns:** 21

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type |
| `skill_name` | STRING | YES | Skill name |
| `skill_category` | STRING | YES | Skill category |
| `interaction_context` | STRING | YES | Interaction context |
| `skill_position` | INT64 | YES | Skill display position |
| `skill_level` | STRING | YES | Proficiency level |
| `related_projects_count` | INT64 | YES | Related projects count |
| `time_on_site_sec` | INT64 | YES | Time on site before click |
| `projects_viewed_before` | INT64 | YES | Projects viewed before |
| `sections_viewed` | INT64 | YES | Sections viewed |
| `was_in_viewport` | STRING | YES | Was visible |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `city` | STRING | YES | City |
| `traffic_source` | STRING | YES | Source |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.6 `conversion_events`

**Description:** Conversion-related events (CTA clicks, form submissions, downloads, social clicks).

**Row Count:** 20 | **Columns:** 43

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type |
| `cta_name` | STRING | YES | CTA identifier |
| `cta_location` | STRING | YES | CTA location |
| `cta_text` | STRING | YES | Button text |
| `form_name` | STRING | YES | Form identifier |
| `form_step` | STRING | YES | Form step |
| `form_field` | STRING | YES | Form field name |
| `submission_status` | STRING | YES | Submission result |
| `link_url` | STRING | YES | Link URL |
| `link_text` | STRING | YES | Link text |
| `link_domain` | STRING | YES | Link domain |
| `file_name` | STRING | YES | Downloaded file name |
| `file_type` | STRING | YES | File type |
| `social_platform` | STRING | YES | Social network |
| `exit_last_section` | STRING | YES | Last section before exit |
| `exit_time_on_page` | INT64 | YES | Time on page at exit |
| `exit_scroll_depth` | INT64 | YES | Scroll depth at exit |
| `copied_content_type` | STRING | YES | Copied content type |
| `copied_content` | STRING | YES | Copied content |
| `publication_title` | STRING | YES | Publication title |
| `time_on_site_before_start` | INT64 | YES | Time before conversion start |
| `sections_viewed` | INT64 | YES | Sections viewed |
| `projects_viewed` | INT64 | YES | Projects viewed |
| `projects_clicked_before` | INT64 | YES | Projects clicked |
| `scroll_depth_at_start` | INT64 | YES | Scroll depth at start |
| `message_length` | INT64 | YES | Form message length |
| `time_to_submit_sec` | INT64 | YES | Form completion time |
| `is_returning_visitor` | STRING | YES | Returning visitor flag |
| `download_source` | STRING | YES | Download source |
| `exit_trigger` | STRING | YES | Exit trigger |
| `was_idle` | STRING | YES | Was idle before exit |
| `conversions_count` | INT64 | YES | Total conversions |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `city` | STRING | YES | City |
| `traffic_source` | STRING | YES | Source |
| `traffic_medium` | STRING | YES | Medium |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.7 `client_events`

**Description:** Client logo and experience section interactions.

**Row Count:** 110 | **Columns:** 30

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type |
| `client_id` | STRING | YES | Client identifier |
| `client_name` | STRING | YES | Client name |
| `domain` | STRING | YES | Industry domain |
| `experience_id` | STRING | YES | Experience ID |
| `experience_title` | STRING | YES | Job title |
| `company` | STRING | YES | Company name |
| `time_spent_seconds` | INT64 | YES | Time spent |
| `scroll_depth_percent` | INT64 | YES | Scroll depth % |
| `read_time_seconds` | INT64 | YES | Reading time |
| `contribution_index` | INT64 | YES | Contribution index |
| `technology` | STRING | YES | Technology |
| `is_first_view` | STRING | YES | First view flag |
| `clients_viewed_before` | INT64 | YES | Prior clients viewed |
| `is_deep_read` | STRING | YES | Deep read flag |
| `completion_rate` | INT64 | YES | Completion % |
| `was_recommended` | STRING | YES | From recommendation |
| `contributions_read_count` | INT64 | YES | Contributions read |
| `time_since_session_start` | INT64 | YES | Time since session start |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `city` | STRING | YES | City |
| `traffic_source` | STRING | YES | Source |
| `traffic_medium` | STRING | YES | Medium |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.8 `recommendation_events`

**Description:** Project recommendation interactions.

**Row Count:** 0 (No events yet) | **Columns:** 22

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type |
| `recommended_project_id` | STRING | YES | Recommended project ID |
| `recommended_project_title` | STRING | YES | Recommended project title |
| `source_project_id` | STRING | YES | Source project ID |
| `position` | INT64 | YES | Display position |
| `recommendation_algorithm` | STRING | YES | Algorithm type |
| `context_category` | STRING | YES | Context category |
| `user_viewed_similar` | STRING | YES | Viewed similar flag |
| `total_recommendations_shown` | INT64 | YES | Total recs shown |
| `time_since_shown_sec` | INT64 | YES | Time since shown |
| `was_above_fold` | STRING | YES | Above fold flag |
| `is_above_fold` | STRING | YES | Above fold flag |
| `projects_viewed_before` | INT64 | YES | Prior projects viewed |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `traffic_source` | STRING | YES | Source |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 1.9 `certification_events`

**Description:** Certification section interactions.

**Row Count:** 0 (No events yet) | **Columns:** 17

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Event date |
| `event_timestamp` | TIMESTAMP | YES | Event timestamp |
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `event_name` | STRING | YES | Event type |
| `cert_title` | STRING | YES | Certification title |
| `cert_issuer` | STRING | YES | Issuing organization |
| `cert_year` | INT64 | YES | Certification year |
| `is_expired` | STRING | YES | Expired flag |
| `cert_category` | STRING | YES | Certification category |
| `time_on_site_sec` | INT64 | YES | Time on site |
| `current_section` | STRING | YES | Current section |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `country` | STRING | YES | Country |
| `traffic_source` | STRING | YES | Source |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

## Layer 2: Aggregated Views

> Daily aggregations of event-level data for trend analysis.

### 2.1 `daily_metrics`

**Description:** Overall site-wide daily metrics.

**Row Count:** 5 | **Columns:** 30

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `session_date` | DATE | YES | Metric date |
| `total_sessions` | INT64 | YES | Session count |
| `unique_visitors` | INT64 | YES | Unique visitors |
| `total_page_views` | INT64 | YES | Page views |
| `avg_pages_per_session` | FLOAT64 | YES | Pages/session |
| `engaged_sessions` | INT64 | YES | Engaged session count |
| `engagement_rate` | FLOAT64 | YES | Engagement % |
| `bounces` | INT64 | YES | Bounce count |
| `bounce_rate` | FLOAT64 | YES | Bounce % |
| `avg_session_duration_sec` | FLOAT64 | YES | Avg duration |
| `avg_engagement_time_sec` | FLOAT64 | YES | Avg engagement time |
| `desktop_sessions` | INT64 | YES | Desktop sessions |
| `mobile_sessions` | INT64 | YES | Mobile sessions |
| `tablet_sessions` | INT64 | YES | Tablet sessions |
| `avg_session_hour` | FLOAT64 | YES | Avg session hour |
| `avg_engagement_score` | FLOAT64 | YES | Avg engagement score |
| `very_high_engagement_sessions` | INT64 | YES | Very high engagement |
| `high_engagement_sessions` | INT64 | YES | High engagement |
| `medium_engagement_sessions` | INT64 | YES | Medium engagement |
| `low_engagement_sessions` | INT64 | YES | Low engagement |
| `returning_visitor_sessions` | INT64 | YES | Return visitor sessions |
| `returning_visitor_rate` | FLOAT64 | YES | Return visitor % |
| `avg_visit_count_returning` | FLOAT64 | YES | Avg visits (returning) |
| `dark_mode_sessions` | INT64 | YES | Dark mode users |
| `light_mode_sessions` | INT64 | YES | Light mode users |
| `dark_mode_percentage` | FLOAT64 | YES | Dark mode % |
| `sessions_4g` | INT64 | YES | 4G sessions |
| `sessions_wifi` | INT64 | YES | WiFi sessions |
| `sessions_slow_connection` | INT64 | YES | Slow connection sessions |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.2 `project_daily_stats`

**Description:** Daily statistics for each project.

**Row Count:** 22 | **Columns:** 35

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `project_id` | STRING | YES | Project identifier |
| `project_title` | STRING | YES | Project name |
| `project_category` | STRING | YES | Category |
| `views` | INT64 | YES | View count |
| `unique_viewers` | INT64 | YES | Unique viewers |
| `unique_sessions` | INT64 | YES | Unique sessions |
| `clicks` | INT64 | YES | Click count |
| `expands` | INT64 | YES | Expand count |
| `link_clicks` | INT64 | YES | Link click count |
| `case_study_engagements` | INT64 | YES | Case study engagements |
| `avg_view_duration_ms` | FLOAT64 | YES | Avg view duration (ms) |
| `avg_time_on_page_sec` | FLOAT64 | YES | Avg time on page |
| `click_through_rate` | FLOAT64 | YES | CTR |
| `technologies_clicked` | ARRAY\<STRING\> | **NO** | Clicked technologies |
| `github_clicks` | INT64 | YES | GitHub clicks |
| `demo_clicks` | INT64 | YES | Demo clicks |
| `external_clicks` | INT64 | YES | External clicks |
| `avg_display_position` | FLOAT64 | YES | Avg display position |
| `desktop_interactions` | INT64 | YES | Desktop interactions |
| `mobile_interactions` | INT64 | YES | Mobile interactions |
| `first_time_views` | INT64 | YES | First time views |
| `avg_projects_viewed_before` | FLOAT64 | YES | Avg prior views |
| `recommended_project_views` | INT64 | YES | Recommended views |
| `recommended_view_rate` | FLOAT64 | YES | Recommended view % |
| `avg_hover_duration_sec` | FLOAT64 | YES | Avg hover duration |
| `first_project_clicks` | INT64 | YES | First project clicks |
| `skill_driven_clicks` | INT64 | YES | From skill clicks |
| `skill_driven_click_rate` | FLOAT64 | YES | Skill driven % |
| `source_skills` | ARRAY\<STRING\> | **NO** | Source skills |
| `deep_reads` | INT64 | YES | Deep reads |
| `avg_case_study_scroll_depth` | FLOAT64 | YES | Avg scroll depth |
| `avg_case_study_completion_rate` | FLOAT64 | YES | Avg completion |
| `avg_sections_read` | FLOAT64 | YES | Avg sections read |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.3 `section_daily_stats`

**Description:** Daily engagement metrics per section.

**Row Count:** 32 | **Columns:** 26

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `section_id` | STRING | YES | Section ID |
| `views` | INT64 | YES | View count |
| `unique_viewers` | INT64 | YES | Unique viewers |
| `unique_sessions` | INT64 | YES | Unique sessions |
| `engaged_views` | INT64 | YES | Engaged view count |
| `engagement_rate` | FLOAT64 | YES | Engagement % |
| `avg_time_spent_seconds` | FLOAT64 | YES | Avg time spent |
| `max_time_threshold_reached` | INT64 | YES | Max time threshold |
| `avg_scroll_depth_percent` | FLOAT64 | YES | Avg scroll depth |
| `max_scroll_milestone` | INT64 | YES | Max scroll milestone |
| `exits` | INT64 | YES | Exit count |
| `exit_rate` | FLOAT64 | YES | Exit % |
| `desktop_views` | INT64 | YES | Desktop views |
| `mobile_views` | INT64 | YES | Mobile views |
| `entries_from_above` | INT64 | YES | Entries from above |
| `entries_from_below` | INT64 | YES | Entries from below |
| `continued_to_next` | INT64 | YES | Continued to next |
| `went_back_up` | INT64 | YES | Went back up |
| `continue_rate` | FLOAT64 | YES | Continue % |
| `avg_section_position` | FLOAT64 | YES | Avg section position |
| `avg_scroll_velocity` | FLOAT64 | YES | Avg scroll velocity |
| `avg_time_to_scroll_depth` | FLOAT64 | YES | Avg time to depth |
| `bouncing_sessions` | INT64 | YES | Bouncing sessions |
| `bounce_rate_from_section` | FLOAT64 | YES | Section bounce % |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.4 `skill_daily_stats`

**Description:** Daily statistics for skill clicks.

**Row Count:** 10 | **Columns:** 19

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `skill_name` | STRING | YES | Skill name |
| `skill_category` | STRING | YES | Category |
| `clicks` | INT64 | YES | Click count |
| `hovers` | INT64 | YES | Hover count |
| `unique_users` | INT64 | YES | Unique users |
| `unique_sessions` | INT64 | YES | Unique sessions |
| `category_views` | INT64 | YES | Category views |
| `weighted_interest_score` | INT64 | YES | Interest score |
| `avg_position` | FLOAT64 | YES | Avg position |
| `advanced_skill_clicks` | INT64 | YES | Advanced clicks |
| `intermediate_skill_clicks` | INT64 | YES | Intermediate clicks |
| `beginner_skill_clicks` | INT64 | YES | Beginner clicks |
| `avg_related_projects` | FLOAT64 | YES | Avg related projects |
| `avg_time_on_site_before_click` | FLOAT64 | YES | Avg time before click |
| `avg_projects_viewed_before_click` | FLOAT64 | YES | Avg projects before |
| `avg_sections_viewed_before_click` | FLOAT64 | YES | Avg sections before |
| `clicks_while_in_viewport` | INT64 | YES | Viewport clicks |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.5 `traffic_daily_stats`

**Description:** Daily traffic source analysis.

**Row Count:** 25 | **Columns:** 20

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | DATE | YES | Stat date |
| `traffic_source` | STRING | YES | Source |
| `traffic_medium` | STRING | YES | Medium |
| `campaign_name` | STRING | YES | Campaign |
| `sessions` | INT64 | YES | Session count |
| `unique_visitors` | INT64 | YES | Unique visitors |
| `total_page_views` | INT64 | YES | Page views |
| `avg_pages_per_session` | FLOAT64 | YES | Pages/session |
| `avg_session_duration_sec` | FLOAT64 | YES | Avg duration |
| `engagement_rate` | FLOAT64 | YES | Engagement % |
| `bounce_rate` | FLOAT64 | YES | Bounce % |
| `desktop_sessions` | INT64 | YES | Desktop sessions |
| `mobile_sessions` | INT64 | YES | Mobile sessions |
| `avg_engagement_score` | FLOAT64 | YES | Avg engagement |
| `high_engagement_sessions` | INT64 | YES | High engagement |
| `high_engagement_rate` | FLOAT64 | YES | High engagement % |
| `returning_visitors` | INT64 | YES | Return visitors |
| `returning_visitor_rate` | FLOAT64 | YES | Return visitor % |
| `avg_scroll_depth` | FLOAT64 | YES | Avg scroll depth |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.6 `conversion_funnel`

**Description:** Daily conversion funnel metrics.

**Row Count:** 2 | **Columns:** 32

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | DATE | YES | Funnel date |
| `total_sessions` | INT64 | YES | Session count |
| `unique_visitors` | INT64 | YES | Unique visitors |
| `total_cta_views` | INT64 | YES | CTA views |
| `total_cta_clicks` | INT64 | YES | CTA clicks |
| `cta_click_rate` | FLOAT64 | YES | CTA click % |
| `contact_form_starts` | INT64 | YES | Form starts |
| `contact_form_field_focuses` | INT64 | YES | Field focuses |
| `contact_form_submissions` | INT64 | YES | Form submissions |
| `form_completion_rate` | FLOAT64 | YES | Form completion % |
| `social_clicks` | INT64 | YES | Social clicks |
| `social_click_rate` | FLOAT64 | YES | Social click % |
| `outbound_clicks` | INT64 | YES | Outbound clicks |
| `outbound_click_rate` | FLOAT64 | YES | Outbound click % |
| `resume_downloads` | INT64 | YES | Resume downloads |
| `file_downloads` | INT64 | YES | File downloads |
| `publication_clicks` | INT64 | YES | Publication clicks |
| `content_copies` | INT64 | YES | Content copies |
| `exit_intent_rate` | FLOAT64 | YES | Exit intent % |
| `avg_conversion_score` | FLOAT64 | YES | Avg conversion score |
| `avg_time_to_conversion_start` | FLOAT64 | YES | Avg time to start |
| `avg_sections_before_conversion` | FLOAT64 | YES | Avg sections |
| `avg_projects_before_conversion` | FLOAT64 | YES | Avg projects |
| `avg_projects_clicked_before_conversion` | FLOAT64 | YES | Avg projects clicked |
| `avg_scroll_depth_at_conversion` | FLOAT64 | YES | Avg scroll depth |
| `avg_contact_message_length` | FLOAT64 | YES | Avg message length |
| `avg_form_completion_time_sec` | FLOAT64 | YES | Avg form time |
| `returning_visitor_conversions` | INT64 | YES | Return conversions |
| `returning_visitor_conversion_share` | FLOAT64 | YES | Return conversion % |
| `idle_exits` | INT64 | YES | Idle exits |
| `idle_exit_rate` | FLOAT64 | YES | Idle exit % |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.7 `client_daily_stats`

**Description:** Daily client/experience section metrics.

**Row Count:** 0 (No data yet) | **Columns:** 32

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `client_id` | STRING | YES | Client ID |
| `client_name` | STRING | YES | Client name |
| `domain` | STRING | YES | Industry domain |
| `views` | INT64 | YES | View count |
| `unique_viewers` | INT64 | YES | Unique viewers |
| `unique_sessions` | INT64 | YES | Unique sessions |
| `clicks` | INT64 | YES | Click count |
| `case_study_opens` | INT64 | YES | Case study opens |
| `case_study_engagements` | INT64 | YES | Case study engagements |
| `avg_case_study_time_sec` | FLOAT64 | YES | Avg case study time |
| `avg_case_study_scroll_depth` | FLOAT64 | YES | Avg scroll depth |
| `problem_reads` | INT64 | YES | Problem reads |
| `solution_reads` | INT64 | YES | Solution reads |
| `avg_problem_read_time_sec` | FLOAT64 | YES | Avg problem time |
| `avg_solution_read_time_sec` | FLOAT64 | YES | Avg solution time |
| `contribution_views` | INT64 | YES | Contribution views |
| `contributions_viewed` | ARRAY\<INT64\> | **NO** | Contributions viewed |
| `tech_stack_clicks` | INT64 | YES | Tech stack clicks |
| `technologies_clicked` | ARRAY\<STRING\> | **NO** | Technologies clicked |
| `case_study_open_rate` | FLOAT64 | YES | Open rate |
| `desktop_views` | INT64 | YES | Desktop views |
| `mobile_views` | INT64 | YES | Mobile views |
| `first_time_views` | INT64 | YES | First time views |
| `avg_clients_viewed_before` | FLOAT64 | YES | Avg prior clients |
| `deep_reads` | INT64 | YES | Deep reads |
| `deep_read_rate` | FLOAT64 | YES | Deep read % |
| `avg_completion_rate` | FLOAT64 | YES | Avg completion |
| `recommended_client_views` | INT64 | YES | Recommended views |
| `avg_contributions_read` | FLOAT64 | YES | Avg contributions |
| `avg_time_into_session` | FLOAT64 | YES | Avg time into session |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.8 `domain_daily_stats`

**Description:** Daily metrics by industry domain.

**Row Count:** 14 | **Columns:** 19

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `domain` | STRING | YES | Industry domain |
| `explicit_interest_signals` | INT64 | YES | Explicit signals |
| `implicit_interest_from_views` | INT64 | YES | Implicit signals |
| `total_domain_interactions` | INT64 | YES | Total interactions |
| `unique_interested_users` | INT64 | YES | Unique users |
| `unique_sessions` | INT64 | YES | Unique sessions |
| `domain_interest_score` | INT64 | YES | Interest score |
| `desktop_interactions` | INT64 | YES | Desktop interactions |
| `mobile_interactions` | INT64 | YES | Mobile interactions |
| `first_time_domain_views` | INT64 | YES | First time views |
| `first_time_view_rate` | FLOAT64 | YES | First time % |
| `deep_reads` | INT64 | YES | Deep reads |
| `deep_read_rate` | FLOAT64 | YES | Deep read % |
| `avg_completion_rate` | FLOAT64 | YES | Avg completion |
| `recommended_views` | INT64 | YES | Recommended views |
| `recommendation_driven_rate` | FLOAT64 | YES | Recommendation % |
| `avg_time_into_session` | FLOAT64 | YES | Avg session time |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.9 `experience_daily_stats`

**Description:** Daily metrics for experience entries.

**Row Count:** 8 | **Columns:** 14

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `experience_id` | STRING | YES | Experience ID |
| `experience_title` | STRING | YES | Job title |
| `company` | STRING | YES | Company |
| `total_interactions` | INT64 | YES | Total interactions |
| `unique_interested_users` | INT64 | YES | Unique users |
| `unique_sessions` | INT64 | YES | Unique sessions |
| `desktop_views` | INT64 | YES | Desktop views |
| `mobile_views` | INT64 | YES | Mobile views |
| `first_time_views` | INT64 | YES | First time views |
| `deep_reads` | INT64 | YES | Deep reads |
| `avg_completion_rate` | FLOAT64 | YES | Avg completion |
| `avg_time_into_session` | FLOAT64 | YES | Avg session time |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.10 `recommendation_daily_stats`

**Description:** Daily recommendation system performance.

**Row Count:** 0 (No data yet) | **Columns:** 20

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `total_impressions` | INT64 | YES | Impressions |
| `total_clicks` | INT64 | YES | Clicks |
| `unique_users_shown_recs` | INT64 | YES | Users shown |
| `unique_users_clicked` | INT64 | YES | Users clicked |
| `overall_ctr` | FLOAT64 | YES | Overall CTR |
| `position_1_ctr` | FLOAT64 | YES | Position 1 CTR |
| `position_2_ctr` | FLOAT64 | YES | Position 2 CTR |
| `position_3_ctr` | FLOAT64 | YES | Position 3 CTR |
| `desktop_clicks` | INT64 | YES | Desktop clicks |
| `mobile_clicks` | INT64 | YES | Mobile clicks |
| `category_match_ctr` | FLOAT64 | YES | Category match CTR |
| `tech_stack_ctr` | FLOAT64 | YES | Tech stack CTR |
| `popularity_ctr` | FLOAT64 | YES | Popularity CTR |
| `above_fold_ctr` | FLOAT64 | YES | Above fold CTR |
| `below_fold_ctr` | FLOAT64 | YES | Below fold CTR |
| `avg_time_to_click_sec` | FLOAT64 | YES | Avg time to click |
| `avg_projects_viewed_before_rec` | FLOAT64 | YES | Avg projects before |
| `clicks_after_viewing_similar` | INT64 | YES | Similar view clicks |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 2.11 `content_reading_stats`

**Description:** Content reading behavior metrics.

**Row Count:** 0 (No data yet) | **Columns:** 18

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `event_date` | STRING | YES | Stat date |
| `problem_reads` | INT64 | YES | Problem reads |
| `solution_reads` | INT64 | YES | Solution reads |
| `sessions_read_problem` | INT64 | YES | Sessions reading problem |
| `sessions_read_solution` | INT64 | YES | Sessions reading solution |
| `avg_problem_read_time_sec` | FLOAT64 | YES | Avg problem time |
| `avg_solution_read_time_sec` | FLOAT64 | YES | Avg solution time |
| `problem_to_solution_time_ratio` | FLOAT64 | YES | Time ratio |
| `first_time_readers` | INT64 | YES | First time readers |
| `first_time_reader_rate` | FLOAT64 | YES | First time % |
| `deep_read_events` | INT64 | YES | Deep read events |
| `avg_content_completion_rate` | FLOAT64 | YES | Avg completion |
| `reads_from_recommendations` | INT64 | YES | Recommended reads |
| `recommended_vs_organic_read_time_ratio` | FLOAT64 | YES | Rec vs organic ratio |
| `avg_time_into_session_at_read` | FLOAT64 | YES | Avg session time |
| `avg_desktop_read_time` | FLOAT64 | YES | Desktop read time |
| `avg_mobile_read_time` | FLOAT64 | YES | Mobile read time |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

## Layer 3: Rankings & Insights

> Computed rankings and actionable insights derived from aggregated data.

### 3.1 `project_rankings`

**Description:** Project performance rankings with engagement scores.

**Row Count:** 10 | **Columns:** 21

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `project_id` | STRING | YES | Project ID |
| `project_title` | STRING | YES | Project name |
| `project_category` | STRING | YES | Category |
| `total_views` | INT64 | YES | All-time views |
| `total_unique_viewers` | INT64 | YES | Unique viewers |
| `total_clicks` | INT64 | YES | All-time clicks |
| `total_expands` | INT64 | YES | All-time expands |
| `total_link_clicks` | INT64 | YES | Link clicks |
| `total_github_clicks` | INT64 | YES | GitHub clicks |
| `total_demo_clicks` | INT64 | YES | Demo clicks |
| `avg_view_duration_sec` | FLOAT64 | YES | Avg view duration |
| `avg_ctr_percent` | FLOAT64 | YES | Avg CTR % |
| `engagement_score` | FLOAT64 | YES | Engagement score |
| `overall_rank` | INT64 | YES | Overall rank |
| `category_rank` | INT64 | YES | Category rank |
| `engagement_percentile` | FLOAT64 | YES | Engagement percentile |
| `performance_tier` | STRING | YES | Performance tier |
| `all_technologies_clicked` | ARRAY\<STRING\> | **NO** | Technologies clicked |
| `recommended_position` | STRING | YES | Recommended position |
| `ranked_at` | TIMESTAMP | YES | Ranking timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.2 `skill_rankings`

**Description:** Skill interest rankings based on user clicks.

**Row Count:** 10 | **Columns:** 14

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `skill_name` | STRING | YES | Skill name |
| `skill_category` | STRING | YES | Category |
| `total_clicks` | INT64 | YES | All-time clicks |
| `total_hovers` | INT64 | YES | All-time hovers |
| `total_unique_users` | INT64 | YES | Unique users |
| `total_unique_sessions` | INT64 | YES | Unique sessions |
| `total_interest_score` | INT64 | YES | Interest score |
| `overall_rank` | INT64 | YES | Overall rank |
| `category_rank` | INT64 | YES | Category rank |
| `interest_percentile` | FLOAT64 | YES | Interest percentile |
| `demand_tier` | STRING | YES | Demand tier |
| `recommendation` | STRING | YES | Recommendation |
| `ranked_at` | TIMESTAMP | YES | Ranking timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.3 `section_rankings`

**Description:** Section engagement health scores.

**Row Count:** 8 | **Columns:** 19

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `section_id` | STRING | YES | Section ID |
| `total_views` | INT64 | YES | All-time views |
| `total_unique_viewers` | INT64 | YES | Unique viewers |
| `total_engaged_views` | INT64 | YES | Engaged views |
| `avg_engagement_rate` | FLOAT64 | YES | Avg engagement % |
| `avg_time_spent_seconds` | FLOAT64 | YES | Avg time spent |
| `avg_scroll_depth_percent` | FLOAT64 | YES | Avg scroll depth |
| `max_scroll_milestone` | INT64 | YES | Max milestone |
| `total_exits` | INT64 | YES | Total exits |
| `avg_exit_rate` | FLOAT64 | YES | Avg exit % |
| `health_score` | FLOAT64 | YES | Health score |
| `engagement_rank` | INT64 | YES | Engagement rank |
| `view_rank` | INT64 | YES | View rank |
| `retention_rank` | INT64 | YES | Retention rank |
| `health_tier` | STRING | YES | Health tier |
| `dropoff_indicator` | STRING | YES | Dropoff indicator |
| `optimization_hint` | STRING | YES | Optimization hint |
| `ranked_at` | TIMESTAMP | YES | Ranking timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.4 `visitor_insights`

**Description:** Per-visitor behavioral segmentation and scoring.

**Row Count:** 117 | **Columns:** 31

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `total_sessions` | INT64 | YES | Session count |
| `first_visit` | TIMESTAMP | YES | First visit |
| `last_visit` | TIMESTAMP | YES | Last visit |
| `visitor_tenure_days` | INT64 | YES | Tenure in days |
| `total_page_views` | INT64 | YES | Page view count |
| `avg_session_duration_sec` | FLOAT64 | YES | Avg session duration |
| `engaged_sessions` | INT64 | YES | Engaged sessions |
| `engagement_rate` | FLOAT64 | YES | Engagement % |
| `primary_device` | STRING | YES | Primary device |
| `primary_country` | STRING | YES | Primary country |
| `primary_traffic_source` | STRING | YES | Primary source |
| `landing_pages` | ARRAY\<STRING\> | **NO** | Landing pages |
| `exit_pages` | ARRAY\<STRING\> | **NO** | Exit pages |
| `projects_viewed` | INT64 | YES | Projects viewed |
| `project_ids_viewed` | ARRAY\<STRING\> | **NO** | Project IDs |
| `project_categories_viewed` | ARRAY\<STRING\> | **NO** | Categories |
| `technologies_explored` | ARRAY\<STRING\> | **NO** | Technologies |
| `skills_clicked` | ARRAY\<STRING\> | **NO** | Skills clicked |
| `skill_categories` | ARRAY\<STRING\> | **NO** | Skill categories |
| `cta_clicks` | INT64 | YES | CTA clicks |
| `form_submissions` | INT64 | YES | Form submissions |
| `social_clicks` | INT64 | YES | Social clicks |
| `resume_downloads` | INT64 | YES | Resume downloads |
| `outbound_clicks` | INT64 | YES | Outbound clicks |
| `publication_clicks` | INT64 | YES | Publication clicks |
| `content_copies` | INT64 | YES | Content copies |
| `visitor_value_score` | INT64 | YES | Value score |
| `visitor_segment` | STRING | YES | Segment |
| `interest_profile` | STRING | YES | Interest profile |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.5 `recommendations`

**Description:** Pre-computed project recommendations per user.

**Row Count:** 580 | **Columns:** 9

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `recommended_project_id` | STRING | YES | Project ID |
| `recommendation_type` | STRING | YES | Algorithm type |
| `recommendation_score` | FLOAT64 | YES | Relevance score |
| `recommending_users` | INT64 | YES | Users recommending |
| `recommendation_rank` | INT64 | YES | Rank |
| `recommendation_reason` | STRING | YES | Reason |
| `generated_at` | TIMESTAMP | YES | Generation time |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.6 `client_rankings`

**Description:** Client/company interest rankings.

**Row Count:** 0 (No data yet) | **Columns:** 23

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `client_id` | STRING | YES | Client ID |
| `client_name` | STRING | YES | Client name |
| `domain` | STRING | YES | Industry domain |
| `total_views` | INT64 | YES | View count |
| `total_unique_viewers` | INT64 | YES | Unique viewers |
| `total_clicks` | INT64 | YES | Click count |
| `total_case_study_opens` | INT64 | YES | Case study opens |
| `total_case_study_engagements` | INT64 | YES | Case study engagements |
| `avg_case_study_time_sec` | FLOAT64 | YES | Avg case study time |
| `avg_case_study_scroll_depth` | FLOAT64 | YES | Avg scroll depth |
| `total_problem_reads` | INT64 | YES | Problem reads |
| `total_solution_reads` | INT64 | YES | Solution reads |
| `total_contribution_views` | INT64 | YES | Contribution views |
| `total_tech_stack_clicks` | INT64 | YES | Tech clicks |
| `avg_case_study_open_rate` | FLOAT64 | YES | Open rate |
| `engagement_score` | FLOAT64 | YES | Engagement score |
| `overall_rank` | INT64 | YES | Overall rank |
| `domain_rank` | INT64 | YES | Domain rank |
| `engagement_percentile` | FLOAT64 | YES | Engagement percentile |
| `engagement_tier` | STRING | YES | Engagement tier |
| `reader_behavior` | STRING | YES | Reader behavior |
| `ranked_at` | TIMESTAMP | YES | Ranking timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.7 `domain_rankings`

**Description:** Industry domain interest rankings.

**Row Count:** 7 | **Columns:** 12

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `domain` | STRING | YES | Industry domain |
| `total_explicit_interest` | INT64 | YES | Explicit interest |
| `total_implicit_interest` | INT64 | YES | Implicit interest |
| `total_interactions` | INT64 | YES | Total interactions |
| `total_unique_users` | INT64 | YES | Unique users |
| `total_interest_score` | INT64 | YES | Interest score |
| `interest_rank` | INT64 | YES | Rank |
| `interest_percentile` | FLOAT64 | YES | Percentile |
| `demand_tier` | STRING | YES | Demand tier |
| `portfolio_recommendation` | STRING | YES | Recommendation |
| `ranked_at` | TIMESTAMP | YES | Ranking timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.8 `experience_rankings`

**Description:** Work experience entry rankings.

**Row Count:** 2 | **Columns:** 12

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `experience_id` | STRING | YES | Experience ID |
| `experience_title` | STRING | YES | Job title |
| `company` | STRING | YES | Company |
| `total_interactions` | INT64 | YES | Total interactions |
| `total_unique_users` | INT64 | YES | Unique users |
| `total_sessions` | INT64 | YES | Total sessions |
| `interest_rank` | INT64 | YES | Rank |
| `interest_percentile` | FLOAT64 | YES | Percentile |
| `role_attractiveness` | STRING | YES | Role attractiveness |
| `positioning_suggestion` | STRING | YES | Positioning suggestion |
| `ranked_at` | TIMESTAMP | YES | Ranking timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

### 3.9 `recommendation_performance`

**Description:** Recommendation system effectiveness metrics.

**Row Count:** 1 | **Columns:** 15

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `total_impressions` | INT64 | YES | Total impressions |
| `total_clicks` | INT64 | YES | Total clicks |
| `overall_ctr` | FLOAT64 | YES | Overall CTR |
| `total_users_shown` | INT64 | YES | Users shown |
| `total_users_clicked` | INT64 | YES | Users clicked |
| `user_conversion_rate` | FLOAT64 | YES | User conversion % |
| `position_1_ctr` | FLOAT64 | YES | Position 1 CTR |
| `position_2_ctr` | FLOAT64 | YES | Position 2 CTR |
| `position_3_ctr` | FLOAT64 | YES | Position 3 CTR |
| `best_position_insight` | STRING | YES | Best position insight |
| `top_performing_recommendations` | ARRAY\<STRUCT\<...\>\> | **NO** | Top recommendations* |
| `top_recommendation_drivers` | ARRAY\<STRUCT\<...\>\> | **NO** | Top drivers* |
| `system_health` | STRING | YES | System health |
| `generated_at` | TIMESTAMP | YES | Generation timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

*`top_performing_recommendations` struct: `<recommended_project_id STRING, recommended_project_title STRING, impressions INT64, clicks INT64, ctr FLOAT64>`

*`top_recommendation_drivers` struct: `<source_project_id STRING, clicks_generated INT64, unique_projects_clicked INT64>`

---

### 3.10 `tech_demand_insights`

**Description:** Technology demand signals based on user interest.

**Row Count:** 10 | **Columns:** 9

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `technology` | STRING | YES | Technology name |
| `total_interactions` | INT64 | YES | Interaction count |
| `total_unique_users` | INT64 | YES | Unique users |
| `demand_rank` | INT64 | YES | Demand rank |
| `demand_percentile` | FLOAT64 | YES | Demand percentile |
| `demand_tier` | STRING | YES | Demand tier |
| `learning_priority` | STRING | YES | Learning priority |
| `generated_at` | TIMESTAMP | YES | Generation timestamp |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

## ML Layer

> Training data for machine learning models.

### `ml_training_data`

**Description:** Feature-engineered dataset for ML model training with session-level features and target variables.

**Row Count:** 231 | **Columns:** 80

#### Session Context Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `user_pseudo_id` | STRING | YES | Visitor ID |
| `session_id` | INT64 | YES | Session ID |
| `session_date` | DATE | YES | Session date |
| `device_category` | STRING | YES | Device type |
| `browser` | STRING | YES | Browser |
| `os` | STRING | YES | Operating system |
| `country` | STRING | YES | Country |
| `traffic_source` | STRING | YES | Source |
| `traffic_medium` | STRING | YES | Medium |
| `session_hour` | INT64 | YES | Session hour |
| `session_day_of_week` | INT64 | YES | Day of week |
| `session_time_of_day` | STRING | YES | Time of day |
| `session_day_type` | STRING | YES | Day type |

#### Session Behavior Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `session_duration_seconds` | INT64 | YES | Session duration |
| `page_views` | INT64 | YES | Page views |
| `total_events` | INT64 | YES | Total events |
| `scroll_events` | INT64 | YES | Scroll events |
| `click_events` | INT64 | YES | Click events |
| `is_bounce` | BOOL | YES | Bounce flag |
| `is_engaged` | BOOL | YES | Engaged flag |

#### Project Interaction Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `projects_viewed` | INT64 | YES | Projects viewed |
| `total_project_views` | INT64 | YES | Total views |
| `total_project_clicks` | INT64 | YES | Total clicks |
| `total_project_expands` | INT64 | YES | Total expands |
| `total_project_link_clicks` | INT64 | YES | Link clicks |
| `avg_project_engagement` | FLOAT64 | YES | Avg engagement |
| `max_project_engagement` | INT64 | YES | Max engagement |
| `high_interest_projects` | INT64 | YES | High interest count |

#### Section Engagement Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `sections_viewed` | INT64 | YES | Sections viewed |
| `total_section_views` | INT64 | YES | Total views |
| `total_sections_engaged` | INT64 | YES | Engaged sections |
| `avg_time_spent_seconds` | FLOAT64 | YES | Avg time spent |
| `max_scroll_depth_percent` | INT64 | YES | Max scroll depth |
| `max_scroll_milestone` | INT64 | YES | Max milestone |

#### Skill Interest Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `unique_skills_clicked` | INT64 | YES | Skills clicked |
| `unique_skill_categories` | INT64 | YES | Skill categories |
| `skills_clicked_list` | STRING | YES | Skills list (comma-separated) |
| `skill_categories_list` | STRING | YES | Categories list |

#### Client/Experience Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `unique_clients_viewed` | INT64 | YES | Clients viewed |
| `client_views` | INT64 | YES | Client views |
| `client_clicks` | INT64 | YES | Client clicks |
| `case_study_opens` | INT64 | YES | Case study opens |
| `case_study_engagements` | INT64 | YES | Case study engagements |
| `unique_domains_explored` | INT64 | YES | Domains explored |
| `domain_interest_signals` | INT64 | YES | Domain signals |
| `domains_explored` | STRING | YES | Domains list |
| `problem_reads` | INT64 | YES | Problem reads |
| `solution_reads` | INT64 | YES | Solution reads |
| `avg_problem_read_time` | FLOAT64 | YES | Avg problem time |
| `avg_solution_read_time` | FLOAT64 | YES | Avg solution time |
| `contribution_views` | INT64 | YES | Contribution views |
| `client_tech_clicks` | INT64 | YES | Client tech clicks |
| `client_technologies_clicked` | STRING | YES | Technologies list |
| `experience_interest_signals` | INT64 | YES | Experience signals |

#### Recommendation Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `recs_shown` | INT64 | YES | Recs shown |
| `recs_clicked` | INT64 | YES | Recs clicked |
| `avg_clicked_position` | FLOAT64 | YES | Avg position |
| `first_clicked_position` | INT64 | YES | First position |
| `unique_recs_shown` | INT64 | YES | Unique recs shown |
| `unique_recs_clicked` | INT64 | YES | Unique recs clicked |
| `recommendation_ctr` | FLOAT64 | YES | Rec CTR |

#### Certification Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `cert_clicks` | INT64 | YES | Cert clicks |
| `unique_certs_clicked` | INT64 | YES | Unique certs |
| `certs_clicked` | STRING | YES | Certs list |

#### Conversion Signal Features

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `cta_clicks` | INT64 | YES | CTA clicks |
| `form_starts` | INT64 | YES | Form starts |
| `form_submissions` | INT64 | YES | Form submissions |
| `social_clicks` | INT64 | YES | Social clicks |
| `resume_downloads` | INT64 | YES | Resume downloads |
| `outbound_clicks` | INT64 | YES | Outbound clicks |
| `content_copies` | INT64 | YES | Content copies |
| `exit_intents` | INT64 | YES | Exit intents |

#### Target Variables

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `target_contact_conversion` | INT64 | YES | Contact conversion (0/1) |
| `target_resume_conversion` | INT64 | YES | Resume conversion (0/1) |
| `target_external_conversion` | INT64 | YES | External conversion (0/1) |
| `target_engagement_score` | FLOAT64 | YES | Engagement score |
| `target_high_value_visitor` | INT64 | YES | High value (0/1) |
| `target_likely_recruiter` | INT64 | YES | Likely recruiter (0/1) |
| `target_deep_explorer` | INT64 | YES | Deep explorer (0/1) |
| `materialized_at` | TIMESTAMP | YES | Table refresh timestamp |

---

## Appendix

### Data Types Reference

| BigQuery Type | Description | Example |
|--------------|-------------|---------|
| STRING | Text values | `"desktop"`, `"Python"` |
| INT64 | 64-bit integers | `42`, `1736285077` |
| FLOAT64 | 64-bit floating point | `0.7805`, `603.5` |
| BOOL | Boolean | `true`, `false` |
| DATE | Date without time | `2026-01-11` |
| TIMESTAMP | Date with time | `2026-01-11 14:32:15 UTC` |
| ARRAY\<T\> | Array of type T | `["Python", "Airflow"]` |
| STRUCT\<...\> | Structured type | Complex nested fields |

### Data Refresh Schedule

| Layer | Refresh Frequency | Typical Delay |
|-------|-------------------|---------------|
| Layer 1 (Base Views) | Daily at 2 PM IST | ~5 minutes |
| Layer 2 (Daily Stats) | Daily at 2 PM IST | ~15 minutes |
| Layer 3 (Rankings) | Daily at 2 PM IST | ~30 minutes |
| ML Layer | Daily at 2 PM IST | ~45 minutes |

### Common Query Patterns

```sql
-- Get daily engagement trend
SELECT session_date, engagement_rate, bounce_rate
FROM `portfolio-483605.analytics_materialized.daily_metrics`
ORDER BY session_date DESC LIMIT 7;

-- Top projects by engagement
SELECT project_title, engagement_score, overall_rank
FROM `portfolio-483605.analytics_materialized.project_rankings`
WHERE overall_rank <= 5;

-- Visitor segment breakdown
SELECT visitor_segment, COUNT(*) as count
FROM `portfolio-483605.analytics_materialized.visitor_insights`
GROUP BY visitor_segment;

-- Traffic source performance
SELECT traffic_source, sessions, engagement_rate
FROM `portfolio-483605.analytics_materialized.traffic_daily_stats`
WHERE event_date = CURRENT_DATE();

-- Working with ARRAY columns
SELECT project_id, tech
FROM `portfolio-483605.analytics_materialized.project_daily_stats`,
UNNEST(technologies_clicked) as tech
WHERE event_date = '2026-01-11';
```

### Notes

- **Nullable Columns:** All columns are nullable (YES) except ARRAY types which are NOT NULL (empty array `[]` for no data)
- **ARRAY Fields:** Use `UNNEST()` to work with array columns like `technologies_clicked`
- **Timestamps:** All timestamps are in UTC
- **materialized_at:** Every table has this column indicating when the data was last refreshed
