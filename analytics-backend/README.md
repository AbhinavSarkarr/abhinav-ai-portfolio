# Portfolio Analytics Backend

BigQuery-based analytics pipeline for processing GA4 data and generating insights for portfolio optimization.

## Architecture

```
GA4 (Google Analytics 4)
         │
         ▼ (Auto-export, Daily)
┌─────────────────────────────────────────────────────────┐
│                    BigQuery                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Raw Data (analytics_XXXXXXXXX)                 │   │
│  │  - events_YYYYMMDD tables                       │   │
│  │  - Auto-populated by GA4                        │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Layer 1: Base Views                            │   │
│  │  - v_sessions                                   │   │
│  │  - v_page_views                                 │   │
│  │  - v_project_events                             │   │
│  │  - v_section_events                             │   │
│  │  - v_skill_events                               │   │
│  │  - v_conversion_events                          │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Layer 2: Aggregated Views                      │   │
│  │  - v_daily_metrics                              │   │
│  │  - v_project_daily_stats                        │   │
│  │  - v_section_daily_stats                        │   │
│  │  - v_skill_daily_stats                          │   │
│  │  - v_traffic_daily_stats                        │   │
│  │  - v_conversion_funnel                          │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Layer 3: Rankings & Insights                   │   │
│  │  - v_project_rankings (7-day rolling)           │   │
│  │  - v_skill_rankings                             │   │
│  │  - v_section_rankings                           │   │
│  │  - v_visitor_insights                           │   │
│  │  - v_recommendations (collaborative filtering)  │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ML: Training Data                              │   │
│  │  - ml_training_data (feature engineering)       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Consumers                                              │
│  - Looker Studio Dashboard                              │
│  - Portfolio API (Cloud Functions / Cloud Run)          │
│  - ML Training Pipeline                                 │
│  - Scheduled Reports                                    │
└─────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Prerequisites
- GA4 property linked to BigQuery (completed)
- BigQuery project: `portfolio-483605`
- Wait 24-48 hours for first data export

### Step 1: Find Your Dataset Name
After GA4 exports data, check BigQuery console for a dataset named:
```
analytics_XXXXXXXXX
```
Where `XXXXXXXXX` is your GA4 property ID.

### Step 2: Update SQL Files
Replace `analytics_*` in all SQL files with your actual dataset name:
```sql
-- Change this:
FROM `portfolio-483605.analytics_*.events_*`

-- To this (example):
FROM `portfolio-483605.analytics_123456789.events_*`
```

### Step 3: Create Views
Run SQL files in order:

```bash
# Option 1: Run individually in BigQuery console
# 1. Run setup/00_create_dataset.sql
# 2. Run each layer1_base/*.sql file
# 3. Run each layer2_aggregated/*.sql file
# 4. Run each layer3_rankings/*.sql file
# 5. Run ml/*.sql

# Option 2: Concatenate and run all
cat sql/setup/00_create_dataset.sql \
    sql/layer1_base/*.sql \
    sql/layer2_aggregated/*.sql \
    sql/layer3_rankings/*.sql \
    sql/ml/*.sql > all_views.sql
# Then run all_views.sql in BigQuery console
```

## SQL Views Reference

### Layer 1: Base Views
| View | Description | Key Fields |
|------|-------------|------------|
| `v_sessions` | Session-level data | user_id, session_id, duration, bounce, engagement |
| `v_page_views` | Page view events | page_url, referrer, section_hash |
| `v_project_events` | Project interactions | project_id, action, view_duration, link_clicks |
| `v_section_events` | Section engagement | section_id, scroll_depth, time_threshold |
| `v_skill_events` | Skill interest | skill_name, category, clicks |
| `v_conversion_events` | Conversion actions | cta, form, social, resume, outbound |

### Layer 2: Aggregated Views
| View | Description | Aggregation |
|------|-------------|-------------|
| `v_daily_metrics` | Overall site metrics | By day |
| `v_project_daily_stats` | Project engagement | By day + project |
| `v_section_daily_stats` | Section performance | By day + section |
| `v_skill_daily_stats` | Skill interest | By day + skill |
| `v_traffic_daily_stats` | Traffic sources | By day + source |
| `v_conversion_funnel` | Conversion funnel | By day |

### Layer 3: Rankings & Insights
| View | Description | Use Case |
|------|-------------|----------|
| `v_project_rankings` | 7-day project rankings | Portfolio reordering |
| `v_skill_rankings` | Skill demand analysis | Learning priorities |
| `v_section_rankings` | Section health scores | UX optimization |
| `v_visitor_insights` | Visitor segmentation | Audience understanding |
| `v_recommendations` | Content recommendations | Personalization |

### ML Views
| View | Description | Features |
|------|-------------|----------|
| `ml_training_data` | Training dataset | 40+ features, 4 target variables |

## Key Metrics

### Engagement Score (Projects)
```
score = views * 1
      + unique_viewers * 2
      + clicks * 3
      + expands * 4
      + link_clicks * 5
      + github_clicks * 6
      + demo_clicks * 7
      + (view_duration_sec * 0.5)
      + (ctr * 2)
```

### Visitor Value Score
```
score = sessions * 1
      + engaged_sessions * 3
      + projects_viewed * 2
      + form_submissions * 20
      + resume_downloads * 15
      + social_clicks * 5
      + content_copies * 8
```

### Section Health Score
```
score = (engagement_rate * 2)
      + (scroll_depth * 0.5)
      + ((100 - exit_rate) * 0.3)
```

## Scheduled Queries (Optional)

For materialized tables (better performance), set up BigQuery scheduled queries:

1. Go to BigQuery Console
2. Click "Scheduled Queries"
3. Create new scheduled query
4. Set schedule: Daily at 6:00 AM UTC
5. Query: `SELECT * FROM analytics_processed.v_project_rankings`
6. Destination: `analytics_processed.t_project_rankings`

## Dashboard Connection

### Looker Studio
1. Open [Looker Studio](https://lookerstudio.google.com)
2. Create new report
3. Add BigQuery data source
4. Select project: `portfolio-483605`
5. Select dataset: `analytics_processed`
6. Add views as needed

## API Integration

Use Cloud Functions or Cloud Run to expose data:

```python
from google.cloud import bigquery

def get_project_rankings():
    client = bigquery.Client()
    query = """
        SELECT project_id, project_title, engagement_score, overall_rank
        FROM `portfolio-483605.analytics_processed.v_project_rankings`
        ORDER BY overall_rank
        LIMIT 10
    """
    return [dict(row) for row in client.query(query)]
```

## Cost Optimization

- All views use 90-day lookback (configurable)
- Daily export is FREE
- Queries on views only process data when accessed
- For high-traffic dashboards, consider materialized tables
