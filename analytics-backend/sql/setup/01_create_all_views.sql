-- Master Setup Script: Create All Analytics Views
-- Run this after GA4 data is available in BigQuery (24-48 hours after linking)
-- Project: portfolio-483605

-- ============================================
-- IMPORTANT: Update these placeholders before running
-- ============================================
-- 1. Replace 'analytics_*' with your actual dataset name
--    Format: analytics_XXXXXXXXX (where X is your GA4 property ID)
--    Find it in BigQuery console after export completes

-- ============================================
-- LAYER 1: Base Views (Extract & Clean)
-- ============================================

-- View 1: Sessions
-- See: layer1_base/01_v_sessions.sql

-- View 2: Page Views
-- See: layer1_base/02_v_page_views.sql

-- View 3: Project Events
-- See: layer1_base/03_v_project_events.sql

-- View 4: Section Events
-- See: layer1_base/04_v_section_events.sql

-- View 5: Skill Events
-- See: layer1_base/05_v_skill_events.sql

-- View 6: Conversion Events
-- See: layer1_base/06_v_conversion_events.sql


-- ============================================
-- LAYER 2: Aggregated Views (Daily Metrics)
-- ============================================

-- View 7: Daily Metrics
-- See: layer2_aggregated/01_v_daily_metrics.sql

-- View 8: Project Daily Stats
-- See: layer2_aggregated/02_v_project_daily_stats.sql

-- View 9: Section Daily Stats
-- See: layer2_aggregated/03_v_section_daily_stats.sql

-- View 10: Skill Daily Stats
-- See: layer2_aggregated/04_v_skill_daily_stats.sql

-- View 11: Traffic Daily Stats
-- See: layer2_aggregated/05_v_traffic_daily_stats.sql

-- View 12: Conversion Funnel
-- See: layer2_aggregated/06_v_conversion_funnel.sql


-- ============================================
-- LAYER 3: Rankings & Insights
-- ============================================

-- View 13: Project Rankings
-- See: layer3_rankings/01_v_project_rankings.sql

-- View 14: Skill Rankings
-- See: layer3_rankings/02_v_skill_rankings.sql

-- View 15: Section Rankings
-- See: layer3_rankings/03_v_section_rankings.sql

-- View 16: Visitor Insights
-- See: layer3_rankings/04_v_visitor_insights.sql

-- View 17: Recommendations
-- See: layer3_rankings/05_v_recommendations.sql


-- ============================================
-- ML: Training Data
-- ============================================

-- View 18: ML Training Data
-- See: ml/01_ml_training_data.sql


-- ============================================
-- Execution Order (Dependencies)
-- ============================================
-- 1. Create dataset (00_create_dataset.sql)
-- 2. Layer 1 views (no dependencies)
-- 3. Layer 2 views (depend on Layer 1)
-- 4. Layer 3 views (depend on Layer 1 & 2)
-- 5. ML views (depend on Layer 1)

-- To run all at once, concatenate the SQL files in order:
-- cat setup/00_create_dataset.sql \
--     layer1_base/*.sql \
--     layer2_aggregated/*.sql \
--     layer3_rankings/*.sql \
--     ml/*.sql > all_views.sql
