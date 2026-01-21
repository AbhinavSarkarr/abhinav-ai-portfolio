-- Supabase Schema for Portfolio Analytics Dashboard
-- Tables mirror BigQuery materialized tables for fast API reads

-- ============================================================================
-- LAYER 1: Sessions (main table for session-level data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_pseudo_id TEXT,
    session_id BIGINT,
    session_start TIMESTAMPTZ,
    session_end TIMESTAMPTZ,
    device_category TEXT,
    os TEXT,
    browser TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    continent TEXT,
    traffic_source TEXT,
    traffic_medium TEXT,
    campaign_name TEXT,
    total_events INT,
    page_views INT,
    scroll_events INT,
    click_events INT,
    engaged_session INT,
    landing_page TEXT,
    exit_page TEXT,
    is_returning BOOLEAN,
    engagement_score INT,
    engagement_level TEXT,
    max_scroll_depth INT,
    sections_viewed_count INT,
    projects_clicked_count INT,
    conversions_count INT,
    day_of_week_name TEXT,
    hour_of_day INT,
    session_duration_seconds INT,
    session_date DATE,
    session_hour INT,
    session_day_of_week INT,
    is_bounce BOOLEAN,
    is_engaged BOOLEAN,
    engagement_tier TEXT,
    visitor_type TEXT,
    has_conversion BOOLEAN,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_pseudo_id);

-- ============================================================================
-- LAYER 2: Daily Metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY,
    session_date DATE,
    total_sessions INT,
    unique_visitors INT,
    total_page_views INT,
    avg_pages_per_session FLOAT,
    engaged_sessions INT,
    engagement_rate FLOAT,
    bounces INT,
    bounce_rate FLOAT,
    avg_session_duration_sec FLOAT,
    avg_engagement_time_sec FLOAT,
    desktop_sessions INT,
    mobile_sessions INT,
    tablet_sessions INT,
    avg_engagement_score FLOAT,
    returning_visitor_sessions INT,
    returning_visitor_rate FLOAT,
    dark_mode_sessions INT,
    light_mode_sessions INT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(session_date);

-- ============================================================================
-- LAYER 2: Traffic Daily Stats
-- ============================================================================
CREATE TABLE IF NOT EXISTS traffic_daily_stats (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    traffic_source TEXT,
    traffic_medium TEXT,
    campaign_name TEXT,
    sessions INT,
    unique_visitors INT,
    total_page_views INT,
    avg_pages_per_session FLOAT,
    avg_session_duration_sec FLOAT,
    engagement_rate FLOAT,
    bounce_rate FLOAT,
    desktop_sessions INT,
    mobile_sessions INT,
    avg_engagement_score FLOAT,
    high_engagement_sessions INT,
    high_engagement_rate FLOAT,
    returning_visitors INT,
    returning_visitor_rate FLOAT,
    avg_scroll_depth FLOAT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_traffic_date ON traffic_daily_stats(event_date);

-- ============================================================================
-- LAYER 2: Conversion Funnel
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversion_funnel (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    total_sessions INT,
    unique_visitors INT,
    total_cta_views INT,
    total_cta_clicks INT,
    cta_click_rate FLOAT,
    contact_form_starts INT,
    contact_form_submissions INT,
    form_completion_rate FLOAT,
    social_clicks INT,
    social_click_rate FLOAT,
    outbound_clicks INT,
    outbound_click_rate FLOAT,
    resume_downloads INT,
    file_downloads INT,
    publication_clicks INT,
    content_copies INT,
    avg_conversion_score FLOAT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conversion_date ON conversion_funnel(event_date);

-- ============================================================================
-- LAYER 2: Project Daily Stats (for date-filtered rankings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_daily_stats (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    project_id TEXT,
    project_title TEXT,
    project_category TEXT,
    views INT,
    unique_viewers INT,
    unique_sessions INT,
    clicks INT,
    expands INT,
    link_clicks INT,
    github_clicks INT,
    demo_clicks INT,
    external_clicks INT,
    avg_view_duration_ms FLOAT,
    click_through_rate FLOAT,
    desktop_interactions INT,
    mobile_interactions INT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_daily_date ON project_daily_stats(event_date);
CREATE INDEX IF NOT EXISTS idx_project_daily_project ON project_daily_stats(project_id);

-- ============================================================================
-- LAYER 2: Section Daily Stats (for date-filtered rankings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS section_daily_stats (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    section_id TEXT,
    unique_views INT,
    unique_exits INT,
    unique_viewers INT,
    unique_sessions INT,
    unique_exit_rate FLOAT,
    total_views INT,
    total_exits INT,
    total_exit_rate FLOAT,
    avg_revisits_per_session FLOAT,
    engaged_sessions INT,
    engagement_rate FLOAT,
    avg_time_spent_seconds FLOAT,
    avg_scroll_depth_percent FLOAT,
    max_scroll_milestone INT,
    desktop_views INT,
    mobile_views INT,
    continue_rate FLOAT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_section_daily_date ON section_daily_stats(event_date);
CREATE INDEX IF NOT EXISTS idx_section_daily_section ON section_daily_stats(section_id);

-- ============================================================================
-- LAYER 2: Skill Daily Stats (for date-filtered tech demand)
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_daily_stats (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    skill_name TEXT,
    skill_category TEXT,
    clicks INT,
    hovers INT,
    unique_users INT,
    unique_sessions INT,
    weighted_interest_score INT,
    avg_position FLOAT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_skill_daily_date ON skill_daily_stats(event_date);
CREATE INDEX IF NOT EXISTS idx_skill_daily_skill ON skill_daily_stats(skill_name);

-- ============================================================================
-- LAYER 2: Domain Daily Stats (for date-filtered domain rankings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS domain_daily_stats (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    domain TEXT,
    explicit_interest_signals INT,
    implicit_interest_from_views INT,
    total_domain_interactions INT,
    unique_interested_users INT,
    unique_sessions INT,
    domain_interest_score INT,
    desktop_interactions INT,
    mobile_interactions INT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_domain_daily_date ON domain_daily_stats(event_date);
CREATE INDEX IF NOT EXISTS idx_domain_daily_domain ON domain_daily_stats(domain);

-- ============================================================================
-- LAYER 2: Experience Daily Stats (for date-filtered experience rankings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS experience_daily_stats (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    experience_id TEXT,
    experience_title TEXT,
    company TEXT,
    total_interactions INT,
    unique_interested_users INT,
    unique_sessions INT,
    desktop_views INT,
    mobile_views INT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_experience_daily_date ON experience_daily_stats(event_date);
CREATE INDEX IF NOT EXISTS idx_experience_daily_exp ON experience_daily_stats(experience_id);

-- ============================================================================
-- LAYER 3: Project Rankings
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_rankings (
    id SERIAL PRIMARY KEY,
    project_id TEXT,
    project_title TEXT,
    project_category TEXT,
    total_views INT,
    total_unique_viewers INT,
    total_clicks INT,
    total_expands INT,
    total_link_clicks INT,
    total_github_clicks INT,
    total_demo_clicks INT,
    avg_view_duration_sec FLOAT,
    avg_ctr_percent FLOAT,
    engagement_score FLOAT,
    overall_rank INT,
    category_rank INT,
    engagement_percentile FLOAT,
    performance_tier TEXT,
    recommended_position TEXT,
    ranked_at TIMESTAMPTZ,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_rank ON project_rankings(overall_rank);

-- ============================================================================
-- LAYER 3: Section Rankings
-- Now includes BOTH unique (funnel) and total (engagement) metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS section_rankings (
    id SERIAL PRIMARY KEY,
    section_id TEXT,
    -- Unique metrics (for funnel analysis - each session counts once)
    total_unique_views INT,
    total_unique_exits INT,
    total_unique_viewers INT,
    avg_exit_rate FLOAT,  -- Based on unique, always <=100%
    -- Total metrics (for engagement analysis - includes revisits)
    total_views INT,
    total_exits INT,
    avg_total_exit_rate FLOAT,
    avg_revisits_per_session FLOAT,
    -- Engagement metrics
    total_engaged_sessions INT,
    avg_engagement_rate FLOAT,
    avg_time_spent_seconds FLOAT,
    avg_scroll_depth_percent FLOAT,
    max_scroll_milestone INT,
    -- Scores and rankings
    health_score FLOAT,
    engagement_rank INT,
    view_rank INT,
    retention_rank INT,
    health_tier TEXT,
    dropoff_indicator TEXT,
    optimization_hint TEXT,
    ranked_at TIMESTAMPTZ,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_section_health ON section_rankings(health_score DESC);

-- ============================================================================
-- LAYER 3: Visitor Insights
-- ============================================================================
CREATE TABLE IF NOT EXISTS visitor_insights (
    id SERIAL PRIMARY KEY,
    user_pseudo_id TEXT,
    total_sessions INT,
    first_visit TIMESTAMPTZ,
    last_visit TIMESTAMPTZ,
    visitor_tenure_days INT,
    total_page_views INT,
    avg_session_duration_sec FLOAT,
    engaged_sessions INT,
    engagement_rate FLOAT,
    primary_device TEXT,
    primary_country TEXT,
    primary_traffic_source TEXT,
    projects_viewed INT,
    cta_clicks INT,
    form_submissions INT,
    social_clicks INT,
    resume_downloads INT,
    outbound_clicks INT,
    visitor_value_score INT,
    visitor_segment TEXT,
    interest_profile TEXT,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_visitor_segment ON visitor_insights(visitor_segment);

-- ============================================================================
-- LAYER 3: Tech Demand Insights
-- ============================================================================
CREATE TABLE IF NOT EXISTS tech_demand_insights (
    id SERIAL PRIMARY KEY,
    technology TEXT,
    total_interactions INT,
    total_unique_users INT,
    demand_rank INT,
    demand_percentile FLOAT,
    demand_tier TEXT,
    learning_priority TEXT,
    generated_at TIMESTAMPTZ,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tech_rank ON tech_demand_insights(demand_rank);

-- ============================================================================
-- LAYER 3: Domain Rankings
-- ============================================================================
CREATE TABLE IF NOT EXISTS domain_rankings (
    id SERIAL PRIMARY KEY,
    domain TEXT,
    total_explicit_interest INT,
    total_implicit_interest INT,
    total_interactions INT,
    total_unique_users INT,
    total_interest_score INT,
    interest_rank INT,
    interest_percentile FLOAT,
    demand_tier TEXT,
    portfolio_recommendation TEXT,
    ranked_at TIMESTAMPTZ,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_domain_rank ON domain_rankings(interest_rank);

-- ============================================================================
-- LAYER 3: Experience Rankings
-- ============================================================================
CREATE TABLE IF NOT EXISTS experience_rankings (
    id SERIAL PRIMARY KEY,
    experience_id TEXT,
    experience_title TEXT,
    company TEXT,
    total_interactions INT,
    total_unique_users INT,
    total_sessions INT,
    interest_rank INT,
    interest_percentile FLOAT,
    role_attractiveness TEXT,
    positioning_suggestion TEXT,
    ranked_at TIMESTAMPTZ,
    materialized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_experience_rank ON experience_rankings(interest_rank);

-- ============================================================================
-- LAYER 3: Recommendation Performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendation_performance (
    id SERIAL PRIMARY KEY,
    total_impressions INT,
    total_clicks INT,
    overall_ctr FLOAT,
    total_users_shown INT,
    total_users_clicked INT,
    user_conversion_rate FLOAT,
    position_1_ctr FLOAT,
    position_2_ctr FLOAT,
    position_3_ctr FLOAT,
    best_position_insight TEXT,
    system_health TEXT,
    generated_at TIMESTAMPTZ,
    materialized_at TIMESTAMPTZ
);

-- ============================================================================
-- Sync Metadata Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_metadata (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL,
    rows_synced INT,
    sync_duration_seconds FLOAT,
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_table ON sync_metadata(table_name);
