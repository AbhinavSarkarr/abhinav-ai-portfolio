# Portfolio Analytics Dashboard - Looker Studio Blueprint

Complete step-by-step guide to create your analytics dashboard.

---

## Dashboard Overview

**Total Pages:** 8
**Data Sources:** 15 BigQuery Views
**Project:** portfolio-483605
**Dataset:** analytics_processed

---

## Quick Setup (5 Minutes)

### Step 1: Open Looker Studio
1. Go to https://lookerstudio.google.com/
2. Click **Create** → **Report**

### Step 2: Add Data Sources
Add these BigQuery tables (you'll add more per page):
1. Click **Add data** → **BigQuery**
2. Select Project: `portfolio-483605`
3. Select Dataset: `analytics_processed`
4. Add tables one by one (list below per page)

### Step 3: Set Theme
- Click **Theme and layout** → Choose dark theme for professional look
- Font: Inter or Roboto
- Primary color: #6366F1 (indigo)
- Secondary: #10B981 (green)

---

## PAGE 1: Executive Overview

**Purpose:** High-level KPIs at a glance

### Data Sources
- `v_daily_metrics`
- `v_section_rankings`
- `v_conversion_funnel`

### Layout (Top Row - Scorecards)

| Chart Type | Metric | Field | Comparison |
|------------|--------|-------|------------|
| Scorecard | Total Visitors | `total_users` from v_daily_metrics (SUM) | vs last 7 days |
| Scorecard | Engagement Rate | `engagement_rate` from v_daily_metrics (AVG) | vs last 7 days |
| Scorecard | Bounce Rate | `bounce_rate` from v_daily_metrics (AVG) | vs last 7 days |
| Scorecard | Conversions | `form_submissions` from v_conversion_funnel (SUM) | vs last 7 days |
| Scorecard | Resume Downloads | `resume_downloads` from v_conversion_funnel (SUM) | vs last 7 days |

### Layout (Middle - Time Series)

**Chart 1: Traffic Trend (Time Series)**
```
Data Source: v_daily_metrics
Dimension: event_date
Metrics: total_users, engaged_users
Date Range: Last 30 days
Style: Line chart with area fill
```

**Chart 2: Engagement Trend (Time Series)**
```
Data Source: v_daily_metrics
Dimension: event_date
Metrics: engagement_rate, bounce_rate
Date Range: Last 30 days
Style: Combo chart (line + line)
```

### Layout (Bottom Row)

**Chart 3: Section Health Overview (Table)**
```
Data Source: v_section_rankings
Dimensions: section_id
Metrics: health_score, avg_engagement_rate, avg_exit_rate
Sort: health_score DESC
Conditional formatting:
  - health_tier = 'excellent' → Green
  - health_tier = 'good' → Blue
  - health_tier = 'needs_attention' → Yellow
  - health_tier = 'critical' → Red
```

**Chart 4: Quick Actions (Table)**
```
Data Source: v_section_rankings
Columns: section_id, optimization_hint, dropoff_indicator
Filter: optimization_hint != 'performing_well'
Purpose: Shows what needs immediate attention
```

---

## PAGE 2: Visitor Behavior

**Purpose:** Understand who visits and how they behave

### Data Sources
- `v_sessions`
- `v_daily_metrics`
- `v_page_views`

### Row 1: Traffic Sources

**Chart 1: Traffic Source Breakdown (Pie Chart)**
```
Data Source: v_sessions
Dimension: traffic_source
Metric: COUNT(*) as sessions
Style: Donut chart
Show: Top 5 sources
```

**Chart 2: Traffic Quality by Source (Bar Chart)**
```
Data Source: v_sessions
Dimension: traffic_source
Metrics: AVG(engagement_rate), AVG(bounce_rate)
Sort: sessions DESC
```

**Chart 3: Device Distribution (Pie Chart)**
```
Data Source: v_sessions
Dimension: device_category
Metric: COUNT(*) as sessions
Style: Donut chart
Colors: desktop=#6366F1, mobile=#10B981, tablet=#F59E0B
```

### Row 2: Geography

**Chart 4: Visitors by Country (Geo Map)**
```
Data Source: v_sessions
Geo Dimension: country
Metric: COUNT(*) as visitors
Style: Filled map
Color: Gradient from light to dark indigo
```

**Chart 5: Top Countries Table**
```
Data Source: v_sessions
Dimension: country
Metrics: sessions, AVG(engagement_rate), AVG(session_duration_seconds)
Sort: sessions DESC
Limit: 10
```

### Row 3: Session Behavior

**Chart 6: Session Duration Distribution (Histogram)**
```
Data Source: v_sessions
Dimension: session_duration_bucket (create calculated field)
Metric: COUNT(*)
Buckets: 0-10s, 10-30s, 30-60s, 1-2min, 2-5min, 5min+
```

**Chart 7: Pages Per Session (Bar Chart)**
```
Data Source: v_sessions
Dimension: page_views (bucketed)
Metric: COUNT(*)
```

**Chart 8: Time of Day Analysis (Heatmap)**
```
Data Source: v_sessions
Rows: day_of_week (Mon-Sun)
Columns: hour_of_day (create calculated field)
Metric: COUNT(*) as sessions
Style: Heatmap with color intensity
```

---

## PAGE 3: Section Performance

**Purpose:** Identify which sections need optimization

### Data Sources
- `v_section_rankings`
- `v_section_daily_stats`

### Row 1: Section Rankings

**Chart 1: Section Performance Matrix (Scatter Plot)**
```
Data Source: v_section_rankings
X-axis: avg_engagement_rate
Y-axis: avg_exit_rate (inverted - lower is better)
Bubble size: total_views
Color: health_tier
Labels: section_id
Purpose: Visualize engagement vs retention per section
```

**Chart 2: Section Health Scores (Bar Chart)**
```
Data Source: v_section_rankings
Dimension: section_id
Metric: health_score
Sort: health_score DESC
Conditional coloring by health_tier
```

### Row 2: Detailed Metrics

**Chart 3: Complete Section Metrics (Table)**
```
Data Source: v_section_rankings
Columns:
  - section_id
  - total_views (data bar)
  - avg_engagement_rate (data bar, %)
  - avg_time_spent_seconds
  - avg_scroll_depth_percent (data bar, %)
  - avg_exit_rate (conditional: red if >50%)
  - health_tier (conditional formatting)
  - optimization_hint
Sort: engagement_rank ASC
```

### Row 3: Trends

**Chart 4: Section Views Over Time (Time Series)**
```
Data Source: v_section_daily_stats
Dimension: event_date
Breakdown: section_id
Metric: views
Style: Stacked area chart
```

**Chart 5: Engagement Rate Trend (Line Chart)**
```
Data Source: v_section_daily_stats
Dimension: event_date
Breakdown: section_id
Metric: engagement_rate
Style: Multi-line chart
```

### Row 4: Drop-off Analysis

**Chart 6: Exit Rate by Section (Funnel-style Bar)**
```
Data Source: v_section_rankings
Dimension: section_id
Metric: avg_exit_rate
Sort: avg_exit_rate DESC
Conditional: Red bars for >50%
Purpose: Identify where visitors leave
```

---

## PAGE 4: Project Rankings

**Purpose:** Data-driven project ordering recommendations

### Data Sources
- `v_project_rankings`
- `v_project_daily_stats`

### Row 1: Top Projects

**Chart 1: Project Leaderboard (Table)**
```
Data Source: v_project_rankings
Columns:
  - engagement_rank (as #1, #2, #3 badges)
  - project_id
  - total_views
  - total_clicks
  - click_rate (data bar, %)
  - avg_view_duration_seconds
  - interest_tier (conditional formatting)
  - recommended_action
Sort: engagement_rank ASC
Purpose: Shows optimal project ordering
```

**Chart 2: Project Engagement Matrix (Scatter)**
```
Data Source: v_project_rankings
X-axis: total_views
Y-axis: click_rate
Bubble size: total_clicks
Labels: project_id
Purpose: Identify high-view/low-click projects to optimize
```

### Row 2: Interaction Analysis

**Chart 3: Project Interactions Breakdown (Stacked Bar)**
```
Data Source: v_project_daily_stats
Dimension: project_id
Metrics: views, clicks, expansions, link_clicks
Style: Stacked horizontal bar
Sort: total_engagement DESC
```

**Chart 4: Link Type Performance (Grouped Bar)**
```
Data Source: v_project_daily_stats
Dimension: project_id
Metrics: github_clicks, demo_clicks, whatsapp_clicks
Purpose: Which link types perform best per project
```

### Row 3: Trends

**Chart 5: Project Views Trend (Time Series)**
```
Data Source: v_project_daily_stats
Dimension: event_date
Breakdown: project_id (top 5)
Metric: views
```

**Chart 6: Click Rate Trend (Line)**
```
Data Source: v_project_daily_stats
Dimension: event_date
Metric: AVG(click_rate)
Reference line: Overall average CTR
```

---

## PAGE 5: Skills & Tech Demand

**Purpose:** Understand what technologies visitors are interested in

### Data Sources
- `v_skill_rankings`
- `v_tech_demand_insights`
- `v_skill_daily_stats`

### Row 1: Skill Rankings

**Chart 1: Top Skills by Interest (Bar Chart)**
```
Data Source: v_skill_rankings
Dimension: skill_name
Metric: total_clicks
Sort: total_clicks DESC
Limit: 15
Color: demand_tier mapping
```

**Chart 2: Skill Category Breakdown (Treemap)**
```
Data Source: v_skill_rankings
Hierarchy: skill_category → skill_name
Size: total_clicks
Color: avg_interest_score
```

### Row 2: Tech Demand Intelligence

**Chart 3: Technology Demand Matrix (Table)**
```
Data Source: v_tech_demand_insights
Columns:
  - technology
  - total_interest_signals
  - unique_interested_visitors
  - demand_tier (conditional: high_demand=green, niche=purple)
  - learning_priority
  - correlated_technologies
Sort: demand_score DESC
Purpose: What tech to learn/highlight
```

**Chart 4: Demand Tier Distribution (Pie)**
```
Data Source: v_tech_demand_insights
Dimension: demand_tier
Metric: COUNT(*)
Purpose: Overview of tech portfolio balance
```

### Row 3: Domain-Tech Correlation

**Chart 5: Tech by Industry (Heatmap Table)**
```
Data Source: v_tech_demand_insights
Rows: technology
Columns: top_interested_domains
Values: interest count
Purpose: Which tech is popular per industry
```

**Chart 6: Skill Interest Trend (Time Series)**
```
Data Source: v_skill_daily_stats
Dimension: event_date
Breakdown: skill_name (top 5)
Metric: clicks
```

---

## PAGE 6: Client & Experience

**Purpose:** Optimize client work showcase and experience section

### Data Sources
- `v_client_rankings`
- `v_domain_rankings`
- `v_experience_rankings`
- `v_content_reading_stats`

### Row 1: Client Work Performance

**Chart 1: Client Leaderboard (Table)**
```
Data Source: v_client_rankings
Columns:
  - engagement_rank
  - client_name
  - total_views
  - case_study_opens
  - case_study_completion_rate (data bar)
  - conversion_rate
  - recommendation
Sort: engagement_rank ASC
```

**Chart 2: Client Case Study Depth (Bar)**
```
Data Source: v_client_rankings
Dimension: client_name
Metrics: avg_case_study_time, avg_scroll_depth
Sort: avg_case_study_time DESC
```

### Row 2: Domain/Industry Interest

**Chart 3: Domain Interest Rankings (Bar)**
```
Data Source: v_domain_rankings
Dimension: domain
Metric: total_interest_signals
Sort: interest_rank ASC
Conditional: interest_tier coloring
```

**Chart 4: Domain Conversion Correlation (Scatter)**
```
Data Source: v_domain_rankings
X-axis: total_interest_signals
Y-axis: conversion_rate
Labels: domain
Purpose: Which industries convert
```

### Row 3: Experience/Role Interest

**Chart 5: Role Interest (Horizontal Bar)**
```
Data Source: v_experience_rankings
Dimension: role_title
Metric: total_clicks
Sort: interest_rank ASC
```

**Chart 6: Company Brand Interest (Bar)**
```
Data Source: v_experience_rankings
Dimension: company_name
Metric: total_clicks
Purpose: Which company names draw interest
```

### Row 4: Reading Patterns

**Chart 7: Problem vs Solution Reading (Stacked Bar)**
```
Data Source: v_content_reading_stats
Dimension: client_name
Metrics: problem_read_time, solution_read_time
Style: Stacked bar
Purpose: Do visitors skip to solutions?
```

**Chart 8: Reading Pattern Summary (Scorecards)**
```
Data Source: v_content_reading_stats
Scorecards:
  - AVG problem_to_solution_ratio
  - % who read full problem statement
  - Most engaging problem statement
```

---

## PAGE 7: Recommendations & Conversions

**Purpose:** Track recommendation system and conversion funnel

### Data Sources
- `v_recommendation_performance`
- `v_recommendations`
- `v_conversion_funnel`

### Row 1: Recommendation System Health

**Chart 1: Recommendation KPIs (Scorecards)**
```
Data Source: v_recommendation_performance
Scorecards:
  - overall_ctr (large number with target comparison)
  - total_clicks / total_impressions
  - unique_users_clicked / unique_users_shown = user_conversion_rate
  - system_health_status (text with conditional icon)
```

**Chart 2: Position Performance (Bar)**
```
Data Source: v_recommendation_performance
Dimension: position (1, 2, 3)
Metric: position_ctr
Purpose: Which position gets most clicks
```

### Row 2: Project Recommendation Performance

**Chart 3: Best Performing Recommendations (Table)**
```
Data Source: v_recommendations
Columns:
  - source_project
  - recommended_project
  - times_shown
  - times_clicked
  - ctr (data bar)
  - performance_tier
Filter: performance_tier IN ('high_performer', 'good')
Sort: ctr DESC
```

**Chart 4: Recommendation Pairs Heatmap**
```
Data Source: v_recommendations
Rows: source_project
Columns: recommended_project
Values: ctr
Style: Heatmap
Purpose: What to recommend together
```

### Row 3: Conversion Funnel

**Chart 5: Conversion Funnel (Funnel Chart)**
```
Data Source: v_conversion_funnel
Stages:
  1. cta_views
  2. cta_clicks
  3. form_starts
  4. form_submissions
Style: Funnel with drop-off percentages
```

**Chart 6: Conversion Metrics (Scorecards)**
```
Data Source: v_conversion_funnel
Scorecards:
  - form_conversion_rate
  - resume_downloads
  - cta_click_rate
  - social_clicks
```

### Row 4: Conversion Breakdown

**Chart 7: Social Platform Clicks (Donut)**
```
Data Source: v_conversion_funnel
Dimension: social_platform (from breakdown)
Metric: clicks
```

**Chart 8: Outbound Link Clicks (Bar)**
```
Data Source: v_conversion_funnel
Dimension: outbound_domain
Metric: clicks
Purpose: Where visitors go after portfolio
```

---

## PAGE 8: Visitor Intelligence

**Purpose:** Understand visitor segments and identify recruiters

### Data Sources
- `v_visitor_insights`
- `ml_training_data`

### Row 1: Visitor Segmentation

**Chart 1: Visitor Segment Distribution (Donut)**
```
Data Source: v_visitor_insights
Dimension: visitor_segment
Metric: COUNT(*)
Segments: converter, engaged_explorer, high_intent, casual_browser
```

**Chart 2: Segment Behavior Comparison (Grouped Bar)**
```
Data Source: v_visitor_insights
Dimension: visitor_segment
Metrics: avg_session_duration, avg_pages_viewed, avg_scroll_depth
Purpose: How segments behave differently
```

### Row 2: Value Analysis

**Chart 3: Visitor Value Distribution (Histogram)**
```
Data Source: v_visitor_insights
Dimension: value_score (bucketed)
Metric: COUNT(*)
Purpose: Distribution of visitor quality
```

**Chart 4: High-Value Visitor Table**
```
Data Source: v_visitor_insights
Columns:
  - user_pseudo_id (anonymized)
  - value_score
  - visitor_segment
  - interest_profile
  - likely_recruiter (boolean indicator)
  - total_sessions
  - last_visit
Filter: value_score > 70
Sort: value_score DESC
```

### Row 3: Recruiter Detection

**Chart 5: Likely Recruiters KPI (Scorecard)**
```
Data Source: v_visitor_insights
Metric: COUNTIF(likely_recruiter = true)
Comparison: % of total visitors
```

**Chart 6: Recruiter Behavior Pattern (Table)**
```
Data Source: v_visitor_insights
Filter: likely_recruiter = true
Columns:
  - domains_explored
  - roles_viewed
  - resume_downloaded
  - case_studies_read
  - time_on_experience_section
Purpose: What recruiters do
```

### Row 4: Interest Profiles

**Chart 7: Interest Profile Distribution (Treemap)**
```
Data Source: v_visitor_insights
Dimension: interest_profile
Size: COUNT(*)
Categories: tech_enthusiast, portfolio_explorer, skills_focused, research_interested
```

**Chart 8: Profile Conversion Rate (Bar)**
```
Data Source: v_visitor_insights
Dimension: interest_profile
Metric: conversion_rate
Purpose: Which profiles convert best
```

---

## Filters (Add to All Pages)

### Global Filters (in header)

1. **Date Range**
   - Type: Date range control
   - Default: Last 30 days
   - Apply to: All charts

2. **Device Category**
   - Type: Drop-down list
   - Options: All, Desktop, Mobile, Tablet
   - Field: device_category

3. **Traffic Source**
   - Type: Drop-down list
   - Options: All, google, linkedin, direct, twitter, github
   - Field: traffic_source

4. **Country**
   - Type: Drop-down list
   - Field: country
   - Default: All

---

## Calculated Fields to Create

Add these calculated fields in Looker Studio:

### 1. Session Duration Bucket
```sql
CASE
  WHEN session_duration_seconds < 10 THEN '0-10s'
  WHEN session_duration_seconds < 30 THEN '10-30s'
  WHEN session_duration_seconds < 60 THEN '30-60s'
  WHEN session_duration_seconds < 120 THEN '1-2min'
  WHEN session_duration_seconds < 300 THEN '2-5min'
  ELSE '5min+'
END
```

### 2. Hour of Day
```sql
EXTRACT(HOUR FROM event_timestamp)
```

### 3. Day of Week
```sql
FORMAT_DATE('%A', event_date)
```

### 4. Health Tier Color
```sql
CASE health_tier
  WHEN 'excellent' THEN '#10B981'
  WHEN 'good' THEN '#6366F1'
  WHEN 'needs_attention' THEN '#F59E0B'
  WHEN 'critical' THEN '#EF4444'
END
```

### 5. Is Recruiter Indicator
```sql
IF(likely_recruiter = true, '🎯 Likely Recruiter', 'Regular Visitor')
```

---

## Styling Guide

### Color Palette
- Primary: #6366F1 (Indigo)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Danger: #EF4444 (Red)
- Neutral: #6B7280 (Gray)

### Chart Defaults
- Bar charts: Rounded corners, horizontal preferred
- Tables: Alternating row colors, freeze header
- Scorecards: Large font, comparison arrows
- Time series: Smooth lines, area fill for single metric

### Data Bars in Tables
- Enable for numeric columns
- Green for positive metrics (engagement, clicks)
- Red for negative metrics (exit rate, bounce rate)

---

## Quick Reference: Views for Each Question

| Question | View to Use | Key Field |
|----------|-------------|-----------|
| Project order? | v_project_rankings | engagement_rank |
| Skills to learn? | v_tech_demand_insights | learning_priority |
| Industries interested? | v_domain_rankings | interest_rank |
| Recommendations working? | v_recommendation_performance | system_health_status |
| Drop-off points? | v_section_rankings | dropoff_indicator |
| What converts? | v_conversion_funnel | form_conversion_rate |
| Valuable visitors? | v_visitor_insights | value_score |
| Likely recruiters? | v_visitor_insights | likely_recruiter |
| Feature which client? | v_client_rankings | recommendation |
| Traffic quality? | v_sessions | engagement_rate per source |

---

## Next Steps After Dashboard

1. **Share Dashboard**
   - Click Share → Get link
   - Set permissions for stakeholders

2. **Schedule Email**
   - Click Schedule email delivery
   - Set weekly summary to your inbox

3. **Embed in Portfolio**
   - File → Embed report
   - Get iframe code for portfolio admin page

4. **Set Up Alerts**
   - Use BigQuery scheduled queries to detect anomalies
   - Email alerts for significant drops in engagement

---

## Estimated Setup Time

| Page | Charts | Time |
|------|--------|------|
| Executive Overview | 4 | 15 min |
| Visitor Behavior | 8 | 25 min |
| Section Performance | 6 | 20 min |
| Project Rankings | 6 | 20 min |
| Skills & Tech | 6 | 20 min |
| Client & Experience | 8 | 25 min |
| Recommendations & Conversions | 8 | 25 min |
| Visitor Intelligence | 8 | 25 min |
| **Total** | **54 charts** | **~3 hours** |

---

## Troubleshooting

**No data showing?**
- Check date range filter
- Verify view exists: Run `SELECT * FROM view_name LIMIT 1` in BigQuery

**Slow dashboard?**
- Use date filters to limit data
- Consider materializing views as tables

**Missing fields?**
- Check view schema in BigQuery
- Ensure column names match exactly

---

*Blueprint created for portfolio-483605.analytics_processed*
