# Looker Studio Quick Start - 15 Minutes

Get your dashboard running in 15 minutes with just the essentials.

---

## Step 1: Create Report (2 min)

1. Go to https://lookerstudio.google.com/
2. Click **Create** → **Report**
3. Name it: "Portfolio Analytics Dashboard"

---

## Step 2: Add Your First Data Source (3 min)

1. Click **Add data**
2. Select **BigQuery**
3. Navigate to:
   - Project: `portfolio-483605`
   - Dataset: `analytics_processed`
   - Table: `v_section_rankings`
4. Click **Add**

---

## Step 3: Create Executive Scorecards (5 min)

### Add These 4 Scorecards Across the Top:

**Scorecard 1: Best Section**
- Click **Add a chart** → **Scorecard**
- Metric: `section_id` (first value, sorted by health_score DESC)
- Label: "Top Performing Section"

**Scorecard 2: Average Health Score**
- Metric: `health_score` (AVG)
- Label: "Avg Health Score"

**Scorecard 3: Sections Needing Work**
- Add filter: `optimization_hint != 'performing_well'`
- Metric: Record Count
- Label: "Sections to Improve"

**Scorecard 4: Avg Engagement Rate**
- Metric: `avg_engagement_rate` (AVG)
- Label: "Engagement Rate %"

---

## Step 4: Section Rankings Table (3 min)

1. Click **Add a chart** → **Table**
2. Configure:
   - Dimension: `section_id`
   - Metrics:
     - `health_score`
     - `avg_engagement_rate`
     - `avg_exit_rate`
     - `total_views`
   - Sort: `health_score` DESC
3. Style:
   - Enable row numbers
   - Add data bars to metrics

---

## Step 5: Add Optimization Hints (2 min)

1. Click **Add a chart** → **Table**
2. Configure:
   - Dimensions: `section_id`, `optimization_hint`, `dropoff_indicator`
   - Filter: `optimization_hint` does not equal `performing_well`
3. This shows you exactly what to fix!

---

## You Now Have a Working Dashboard!

Your dashboard shows:
- Which sections are performing well
- Which need improvement
- Specific optimization suggestions
- Drop-off indicators

---

## Next: Add More Pages

Once the basics work, add data sources for these views and create new pages:

| Page | Data Source | Key Charts |
|------|-------------|------------|
| Projects | `v_project_rankings` | Project leaderboard, click rates |
| Skills | `v_skill_rankings` | Top skills, demand tiers |
| Conversions | `v_conversion_funnel` | Funnel, resume downloads |
| Visitors | `v_visitor_insights` | Segments, recruiter detection |

---

## Verify Data First

Before building complex charts, run these in BigQuery to verify data exists:

```sql
-- Check section rankings
SELECT * FROM `portfolio-483605.analytics_processed.v_section_rankings` LIMIT 5;

-- Check project rankings
SELECT * FROM `portfolio-483605.analytics_processed.v_project_rankings` LIMIT 5;

-- Check daily metrics
SELECT * FROM `portfolio-483605.analytics_processed.v_daily_metrics`
ORDER BY event_date DESC LIMIT 5;
```

If views return empty, you need more visitor data first (wait 24-48 hours).

---

## Troubleshooting

**"No data" in charts?**
- Your views might be empty because GA4 just started collecting
- Run the verification queries above
- Wait for more traffic data

**Can't find views?**
- Make sure you ran ALL_VIEWS_COMBINED.sql in BigQuery
- Check dataset is `analytics_processed` not `analytics_518701756`

**Permission denied?**
- Ensure you're logged into the same Google account
- Check BigQuery IAM permissions

---

See `LOOKER_DASHBOARD_BLUEPRINT.md` for the complete 8-page dashboard specification.
