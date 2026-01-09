# Page 2: Section Performance - Complete Guide

## Overview

**Purpose:** Understand how each section of your portfolio performs so you can optimize the visitor experience and increase conversions.

**Why This Matters:**
Your portfolio is a single-page application with multiple sections (Hero, Experience, Projects, Skills, Contact). Visitors scroll through these sections, and understanding WHERE they engage, WHERE they drop off, and WHAT content keeps them interested is crucial for:
- Improving weak sections
- Doubling down on strong sections
- Reducing bounce/exit rates
- Increasing time on site
- Ultimately: Getting more job inquiries

---

## Data Source Setup

### Primary Data Source: `v_section_rankings`

**How to Add:**
1. In Looker Studio, click **Resource** → **Manage added data sources**
2. Click **Add a data source**
3. Select **BigQuery**
4. Navigate: `portfolio-483605` → `analytics_processed` → `v_section_rankings`
5. Click **Connect** → **Add to report**

### Secondary Data Source: `v_section_daily_stats`

Repeat the above for `v_section_daily_stats` (for trend charts)

### Available Fields in `v_section_rankings`:

| Field | Type | Description |
|-------|------|-------------|
| `section_id` | STRING | Section name (hero, experience, projects, skills, contact) |
| `total_views` | INTEGER | Total times section was viewed |
| `unique_viewers` | INTEGER | Unique visitors who saw this section |
| `total_engagements` | INTEGER | Times visitors actively engaged (not just scrolled past) |
| `total_exits` | INTEGER | Times visitors left the site from this section |
| `avg_time_spent_seconds` | FLOAT | Average time spent in section |
| `avg_scroll_depth_percent` | FLOAT | How far visitors scrolled within section |
| `avg_engagement_rate` | FLOAT | % of viewers who engaged |
| `avg_exit_rate` | FLOAT | % of viewers who left from this section |
| `health_score` | FLOAT | Composite score (higher = better) |
| `engagement_rank` | INTEGER | Rank by engagement (1 = best) |
| `health_tier` | STRING | excellent / good / needs_attention / critical |
| `optimization_hint` | STRING | What to improve |
| `dropoff_indicator` | STRING | normal / moderate_dropoff / high_dropoff |
| `ranked_at` | TIMESTAMP | When rankings were calculated |

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE TITLE: Section Performance                                │
├─────────────────────────────────────────────────────────────────┤
│  [Scorecard 1]  [Scorecard 2]  [Scorecard 3]  [Scorecard 4]    │
│  Best Section   Worst Section  Avg Health     Needs Work        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │  CHART 1                 │  │  CHART 2                     ││
│  │  Health Score Bar Chart  │  │  Engagement Funnel           ││
│  │                          │  │                              ││
│  └──────────────────────────┘  └──────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHART 3: Complete Section Metrics Table                 │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │  CHART 4                 │  │  CHART 5                     ││
│  │  Exit Rate Analysis      │  │  Time Spent Analysis         ││
│  │                          │  │                              ││
│  └──────────────────────────┘  └──────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHART 6: Optimization Recommendations Table             │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHART 7: Section Performance Trend (Time Series)        │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Element 1: Scorecards (Top Row)

### Scorecard 1: Best Performing Section

**What it shows:** The section with the highest health score

**Why it matters:**
- Identifies your strongest content
- Shows what's working that you can replicate
- Gives you confidence about what to keep

**How to create:**
1. Click **Add a chart** → **Scorecard**
2. Data source: `v_section_rankings`
3. Metric: `section_id`
4. Sort: `health_score` Descending
5. Show only 1 row (this gets the top section)

**Alternative method (more reliable):**
1. Create a calculated field:
   ```
   Name: best_section
   Formula: CASE WHEN engagement_rank = 1 THEN section_id ELSE NULL END
   ```
2. Use this as the metric

**Styling:**
- Label: "Best Section"
- Font size: Large
- Color: Green (#10B981)

**How to interpret:**
- This section is your star performer
- Study what makes it work (content, design, CTAs)
- Use similar patterns in weaker sections

---

### Scorecard 2: Section Needing Most Work

**What it shows:** The section with the lowest health score

**Why it matters:**
- Identifies your biggest opportunity for improvement
- Prioritizes where to focus optimization efforts
- Prevents visitors from dropping off

**How to create:**
1. Click **Add a chart** → **Scorecard**
2. Data source: `v_section_rankings`
3. Metric: `section_id`
4. Sort: `health_score` Ascending (lowest first)
5. Show only 1 row

**Styling:**
- Label: "Needs Most Work"
- Font size: Large
- Color: Red (#EF4444)

**How to interpret:**
- This section is losing visitors
- Check the `optimization_hint` for this section
- Prioritize improving this section

---

### Scorecard 3: Average Health Score

**What it shows:** Overall health across all sections

**Why it matters:**
- Single number to track overall portfolio performance
- Baseline for measuring improvement over time
- Quick health check

**How to create:**
1. Click **Add a chart** → **Scorecard**
2. Data source: `v_section_rankings`
3. Metric: `health_score`
4. Aggregation: AVG

**Styling:**
- Label: "Avg Health Score"
- Add comparison to previous period (if available)
- Conditional coloring:
  - Green if > 150
  - Yellow if 100-150
  - Red if < 100

**How to interpret:**
- Score > 150: Excellent overall performance
- Score 100-150: Good, but room for improvement
- Score < 100: Needs attention

---

### Scorecard 4: Sections Needing Attention

**What it shows:** Count of sections with `health_tier` not "excellent"

**Why it matters:**
- Quick count of problem areas
- Progress tracker as you improve sections
- Alert system for degradation

**How to create:**
1. Click **Add a chart** → **Scorecard**
2. Data source: `v_section_rankings`
3. Metric: Record Count
4. Add Filter: `health_tier` NOT IN (`excellent`)

**Alternative - Count specific tiers:**
Create calculated field:
```
Name: needs_attention_flag
Formula: CASE WHEN health_tier IN ('needs_attention', 'critical') THEN 1 ELSE 0 END
```
Use SUM of this field.

**Styling:**
- Label: "Sections to Improve"
- Color: Orange (#F59E0B)
- Target: 0 (all sections excellent)

**How to interpret:**
- 0: All sections performing well
- 1-2: Focus on these specific sections
- 3+: Systematic issues, review overall UX

---

## Element 2: Health Score Bar Chart

**What it shows:** Visual comparison of health scores across all sections

**Why it matters:**
- Instant visual of relative performance
- Identifies gaps between sections
- Shows distribution of quality

**Questions answered:**
- Which section has the highest engagement?
- How do sections compare to each other?
- Is there a big gap between best and worst?

**How to create:**
1. Click **Add a chart** → **Bar chart** (horizontal)
2. Data source: `v_section_rankings`
3. Dimension: `section_id`
4. Metric: `health_score`
5. Sort: `health_score` Descending

**Styling:**
1. Click on chart → **Style** tab
2. Enable **Data labels** (show values on bars)
3. Bar color: Use `health_tier` for conditional coloring
   - Go to **Style** → **Color** → **Dimension value**
   - Or create calculated field for color:
     ```
     Name: health_color
     Formula: CASE
       WHEN health_tier = 'excellent' THEN '#10B981'
       WHEN health_tier = 'good' THEN '#6366F1'
       WHEN health_tier = 'needs_attention' THEN '#F59E0B'
       ELSE '#EF4444'
     END
     ```
4. Add reference line at average health score

**How to interpret:**
- Bars should ideally be similar length (balanced performance)
- Large gaps indicate problem sections
- Green bars = good, Red bars = fix immediately

**Actions to take:**
- If one section is much lower: Focus all optimization there
- If all sections similar but low: Systemic issue (overall UX, load time, etc.)
- If hero is low: Critical - first impression is failing

---

## Element 3: Engagement Flow/Funnel

**What it shows:** How visitors flow through sections (views → engagements → exits)

**Why it matters:**
- Visualizes the visitor journey
- Shows where the "leaky bucket" is
- Identifies conversion bottlenecks

**Questions answered:**
- What percentage of viewers actually engage?
- Where do most exits happen?
- Which section has the best view-to-engagement ratio?

**How to create:**
1. Click **Add a chart** → **Bar chart** (grouped)
2. Data source: `v_section_rankings`
3. Dimension: `section_id`
4. Metrics (in order):
   - `total_views`
   - `total_engagements`
   - `total_exits`
5. Sort by `total_views` Descending

**Styling:**
- Views bar: Blue (#6366F1)
- Engagements bar: Green (#10B981)
- Exits bar: Red (#EF4444)
- Enable data labels

**How to interpret:**
- Healthy section: High views, high engagements, low exits
- Problem section: High views, low engagements (content not resonating)
- Exit section: High exits relative to views (need better CTA or transition)

**Example interpretation:**
```
Hero:    Views=100, Engagements=80, Exits=5  → Great! 80% engage
Skills:  Views=50,  Engagements=10, Exits=20 → Problem! Only 20% engage, 40% exit
```

---

## Element 4: Complete Section Metrics Table

**What it shows:** All metrics for all sections in one comprehensive table

**Why it matters:**
- Single source of truth for section performance
- Enables detailed analysis
- Supports data-driven decisions

**Questions answered:**
- All Section 2 questions from our list
- Which section gets most views?
- Which has highest engagement rate?
- Time spent per section?
- Scroll depth per section?
- Which sections have high exit rate?

**How to create:**
1. Click **Add a chart** → **Table**
2. Data source: `v_section_rankings`
3. Dimensions: `section_id`
4. Metrics (in this order):
   - `total_views`
   - `unique_viewers`
   - `avg_engagement_rate`
   - `avg_time_spent_seconds`
   - `avg_scroll_depth_percent`
   - `avg_exit_rate`
   - `health_score`
   - `health_tier`
5. Sort: `engagement_rank` Ascending

**Styling:**
1. **Data bars:** Enable for numeric columns
   - `total_views`: Blue bar
   - `avg_engagement_rate`: Green bar
   - `avg_exit_rate`: Red bar (inverted - lower is better)
   - `health_score`: Green bar

2. **Conditional formatting for `health_tier`:**
   - Right-click column → Conditional formatting
   - excellent = Green background
   - good = Blue background
   - needs_attention = Yellow background
   - critical = Red background

3. **Number formatting:**
   - `avg_engagement_rate`: Percent, 1 decimal
   - `avg_scroll_depth_percent`: Percent, 1 decimal
   - `avg_exit_rate`: Percent, 1 decimal
   - `avg_time_spent_seconds`: Number, 1 decimal, suffix "s"

4. **Column headers:** Make them readable
   - Rename `avg_engagement_rate` → "Engagement %"
   - Rename `avg_time_spent_seconds` → "Avg Time (s)"
   - Rename `avg_scroll_depth_percent` → "Scroll Depth %"
   - Rename `avg_exit_rate` → "Exit Rate %"

**How to interpret each column:**

| Column | Good Value | Bad Value | What It Means |
|--------|------------|-----------|---------------|
| total_views | High | Low | How many saw this section |
| unique_viewers | High | Low | Unique people who reached section |
| avg_engagement_rate | >50% | <30% | % who actively interacted |
| avg_time_spent_seconds | >30s | <10s | Time reading/viewing |
| avg_scroll_depth_percent | >75% | <50% | How much content they consumed |
| avg_exit_rate | <20% | >40% | % who left from this section |
| health_score | >150 | <100 | Composite performance score |

---

## Element 5: Exit Rate Analysis Chart

**What it shows:** Which sections lose the most visitors

**Why it matters:**
- Exits = lost opportunities
- High exit on non-Contact sections = problem
- Helps prioritize retention improvements

**Questions answered:**
- Which sections have the highest exit rate?
- Where do visitors drop off?
- Which sections need better CTAs or transitions?

**How to create:**
1. Click **Add a chart** → **Bar chart** (horizontal)
2. Data source: `v_section_rankings`
3. Dimension: `section_id`
4. Metric: `avg_exit_rate`
5. Sort: `avg_exit_rate` Descending (highest exits first)

**Styling:**
- Color: Red gradient (darker = worse)
- Add reference line at 30% (threshold for "concerning")
- Enable data labels with percentage

**Conditional bar coloring:**
```
Create calculated field:
Name: exit_severity
Formula: CASE
  WHEN avg_exit_rate > 50 THEN 'Critical'
  WHEN avg_exit_rate > 30 THEN 'Warning'
  ELSE 'Normal'
END
```
Use this for bar colors.

**How to interpret:**
- **Contact section high exit:** GOOD - they're supposed to leave after contacting
- **Hero section high exit:** BAD - first impression failing
- **Middle sections high exit:** BAD - losing visitors before conversion

**Actions to take:**
| Section with High Exit | Action |
|------------------------|--------|
| Hero | Improve hook, add clearer value proposition |
| Experience | Make it more scannable, add visuals |
| Projects | Add clearer CTAs, improve descriptions |
| Skills | Make interactive, add context |
| Contact | This is OK - expected exit point |

---

## Element 6: Time Spent Analysis

**What it shows:** How long visitors spend in each section

**Why it matters:**
- Time = interest and engagement
- Too little time = content not engaging
- Too much time might indicate confusion (context dependent)

**Questions answered:**
- How long do visitors spend on each section?
- Which sections hold attention longest?
- Which sections are being skipped?

**How to create:**
1. Click **Add a chart** → **Bar chart** (horizontal)
2. Data source: `v_section_rankings`
3. Dimension: `section_id`
4. Metric: `avg_time_spent_seconds`
5. Sort: `avg_time_spent_seconds` Descending

**Styling:**
- Color: Purple (#8B5CF6)
- Data labels: Show seconds with "s" suffix
- Add reference line at 30 seconds (target minimum)

**How to interpret:**

| Section | Expected Time | If Lower | If Higher |
|---------|---------------|----------|-----------|
| Hero | 5-15s | OK, it's just intro | They might be confused |
| Experience | 30-60s | Not reading details | Great! Engaged |
| Projects | 45-90s | Scanning only | Deeply interested |
| Skills | 15-30s | Quick scan OK | Very interested in tech |
| Contact | 20-60s | Might not fill form | Likely converting |

**Actions to take:**
- Low time + low engagement = Content not interesting
- Low time + high exit = Need better hook
- High time + low conversion = Content confusing or no clear CTA

---

## Element 7: Scroll Depth Analysis

**What it shows:** How far visitors scroll within each section

**Why it matters:**
- Scroll depth = content consumption
- Low scroll = visitors not reading everything
- Critical for long sections (Experience, Projects)

**Questions answered:**
- What's the scroll depth within each section?
- Are visitors reading all the content?
- Which sections need content restructuring?

**How to create:**
1. Click **Add a chart** → **Gauge chart** OR **Bar chart**
2. Data source: `v_section_rankings`
3. Dimension: `section_id`
4. Metric: `avg_scroll_depth_percent`

**For Gauge chart (per section):**
- Create one gauge per section
- Range: 0-100%
- Green zone: 75-100%
- Yellow zone: 50-75%
- Red zone: 0-50%

**For Bar chart (all sections):**
1. Horizontal bar chart
2. Sort by `avg_scroll_depth_percent` Descending
3. Add reference line at 75% (target)

**Styling:**
- Color by scroll depth:
  - >75%: Green
  - 50-75%: Yellow
  - <50%: Red

**How to interpret:**
- **>75%:** Excellent - visitors consuming most content
- **50-75%:** OK - some content being missed
- **<50%:** Problem - visitors leaving before seeing key content

**Actions to take:**
| Scroll Depth | Action |
|--------------|--------|
| <50% | Move important content higher ("above the fold") |
| 50-75% | Add visual breaks, improve scannability |
| >75% | Great! Consider adding more content |

---

## Element 8: Optimization Recommendations Table

**What it shows:** Specific actions to improve each section

**Why it matters:**
- Removes guesswork from optimization
- Prioritized action items
- Data-driven improvement roadmap

**Questions answered:**
- What should I improve first?
- What specific optimization does each section need?
- Which sections are performing well vs need attention?

**How to create:**
1. Click **Add a chart** → **Table**
2. Data source: `v_section_rankings`
3. Dimensions:
   - `section_id`
   - `health_tier`
   - `optimization_hint`
   - `dropoff_indicator`
4. Metrics:
   - `health_score`
5. Sort: `health_score` Ascending (worst first = priority)

**Add Filter (optional):** Show only sections needing work
- Filter: `health_tier` NOT EQUAL TO `excellent`

**Styling:**
1. Conditional formatting for `health_tier` (same as before)
2. Conditional formatting for `optimization_hint`:
   - `performing_well`: Green
   - `improve_content`: Yellow
   - `add_cta_or_navigation`: Orange
   - `hook_earlier`: Orange
   - `make_more_engaging`: Red
3. Conditional formatting for `dropoff_indicator`:
   - `normal`: Green
   - `moderate_dropoff`: Yellow
   - `high_dropoff`: Red

**Understanding `optimization_hint` values:**

| Hint | Meaning | Action to Take |
|------|---------|----------------|
| `performing_well` | No issues | Maintain current approach |
| `improve_content` | Low engagement despite views | Rewrite content, add visuals, make more compelling |
| `add_cta_or_navigation` | High exit rate | Add clear next steps, buttons, links to other sections |
| `hook_earlier` | Low scroll depth | Move key content up, add engaging hook at top |
| `make_more_engaging` | Low time spent | Add interactive elements, improve content quality |

**Understanding `dropoff_indicator` values:**

| Indicator | Meaning | Urgency |
|-----------|---------|---------|
| `normal` | Expected exit rate | No action needed |
| `moderate_dropoff` | Slightly high exits | Monitor and improve |
| `high_dropoff` | Many visitors leaving | Urgent fix needed |

---

## Element 9: Section Performance Trend (Time Series)

**What it shows:** How section performance changes over time

**Why it matters:**
- Track improvement/degradation
- See impact of changes you make
- Identify patterns (weekday vs weekend)

**Questions answered:**
- Is engagement improving or declining?
- Did recent changes help or hurt?
- Are there patterns in section performance?

**How to create:**
1. Click **Add a chart** → **Time series chart**
2. Data source: `v_section_daily_stats` (need to add this data source)
3. Dimension: Date field (likely `event_date` or first column)
4. Breakdown dimension: `section_id`
5. Metric: Choose one:
   - `views` (volume trend)
   - `engagement_rate` (quality trend)
   - `avg_time_spent` (depth trend)

**Styling:**
- Line chart with different color per section
- Enable data points
- Add trend line (optional)
- Show legend

**Alternative: Multiple small charts**
Create 5 small time series charts, one per section, showing multiple metrics each.

**How to interpret:**
- **Upward trend:** Your optimizations are working
- **Downward trend:** Something changed negatively
- **Flat line:** Stable, but might need innovation
- **Spikes:** Check what happened on those days

---

## Element 10: Section Comparison Scatter Plot

**What it shows:** Two-dimensional view of section performance

**Why it matters:**
- Identifies sections that are "hidden gems" or "problem areas"
- Shows relationship between metrics
- Visual quadrant analysis

**Questions answered:**
- Which sections have high views but low engagement?
- Which sections convert well despite low traffic?
- Where should I focus efforts?

**How to create:**
1. Click **Add a chart** → **Scatter chart**
2. Data source: `v_section_rankings`
3. Dimension: `section_id`
4. X-axis metric: `avg_engagement_rate`
5. Y-axis metric: `total_views`
6. Bubble size: `health_score`

**Styling:**
- Enable data labels (show section names)
- Color by `health_tier`
- Add quadrant lines at median values

**Quadrant interpretation:**
```
                    HIGH VIEWS
                        │
    "Fix These"         │      "Stars"
    High views,         │      High views,
    Low engagement      │      High engagement
                        │
  ──────────────────────┼────────────────────── HIGH ENGAGEMENT
                        │
    "Deprioritize"      │      "Hidden Gems"
    Low views,          │      Low views,
    Low engagement      │      High engagement
                        │
                    LOW VIEWS
```

**Actions by quadrant:**
- **Stars (top-right):** Maintain, replicate approach elsewhere
- **Fix These (top-left):** High priority - lots of visitors, low conversion
- **Hidden Gems (bottom-right):** Drive more traffic here
- **Deprioritize (bottom-left):** Fix only after other quadrants

---

## Summary: Complete Element List for Page 2

| # | Element Type | What It Shows | Data Source |
|---|--------------|---------------|-------------|
| 1 | Scorecard | Best Section | v_section_rankings |
| 2 | Scorecard | Worst Section | v_section_rankings |
| 3 | Scorecard | Avg Health Score | v_section_rankings |
| 4 | Scorecard | Sections to Improve | v_section_rankings |
| 5 | Bar Chart | Health Scores | v_section_rankings |
| 6 | Grouped Bar | Views/Engagements/Exits | v_section_rankings |
| 7 | Table | Complete Metrics | v_section_rankings |
| 8 | Bar Chart | Exit Rate Analysis | v_section_rankings |
| 9 | Bar Chart | Time Spent Analysis | v_section_rankings |
| 10 | Bar/Gauge | Scroll Depth | v_section_rankings |
| 11 | Table | Optimization Recommendations | v_section_rankings |
| 12 | Time Series | Performance Trend | v_section_daily_stats |
| 13 | Scatter Plot | Quadrant Analysis | v_section_rankings |

---

## Questions Answered by This Page

From our original questions list:

### Section 2.1 - Section Engagement
- [x] Which section gets the most views? → Table, sorted by views
- [x] Which section has the highest engagement rate? → Bar chart, table
- [x] How long do visitors spend on each section? → Time spent bar chart
- [x] What's the scroll depth within each section? → Scroll depth chart
- [x] Which sections have the highest exit rate? → Exit rate bar chart
- [x] Which sections need improvement? → Optimization table

### Section 2.2 - Section Health
- [x] What's the health score of each section? → Health score bar chart
- [x] Which sections are performing well vs need attention? → Health tier in table
- [x] Which sections should I improve first? → Table sorted by health score ASC
- [x] What optimization should I do for each section? → Optimization hints table

### Section 10.2 - Drop-off Analysis
- [x] Where do visitors lose interest? → Exit rate chart
- [x] What sections have high exit rates? → Exit rate chart, dropoff indicator
- [x] What content should I improve? → Optimization hints

### Section 11.1 - Trends
- [x] Is engagement improving or declining? → Time series chart

---

## Actionable Insights Framework

After building this page, use this framework weekly:

### 1. Check Scorecards (30 seconds)
- Is avg health score improving?
- Are fewer sections needing work?

### 2. Review Problem Sections (2 minutes)
- Look at optimization hints table
- Note the top priority section

### 3. Deep Dive Problem Section (5 minutes)
- Check its specific metrics in main table
- Identify the root cause:
  - Low engagement rate → Content issue
  - Low time spent → Not compelling
  - Low scroll depth → Hook issue
  - High exit rate → No clear next step

### 4. Plan Action (5 minutes)
- Based on optimization hint, plan specific change
- Document what you'll change

### 5. Monitor Next Week
- Check if metrics improved for that section
- Repeat for next priority section

---

## Pro Tips

1. **Add date filter** to the page so you can compare time periods

2. **Create a "Section" filter** dropdown so you can drill into one section

3. **Add annotations** to time series when you make changes to the site

4. **Set up scheduled email** of this page to yourself weekly

5. **Bookmark "needs work" filter** to quickly see problem areas

---

*Page 2 complete. This page alone answers 15+ questions about section performance.*
