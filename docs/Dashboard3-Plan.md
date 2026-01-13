# Dashboard3: Comprehensive Analytics Dashboard Plan

## Overview
Build a production-grade analytics dashboard (`Dashboard3.tsx`) that extracts and visualizes **every possible insight** from all 31 BigQuery materialized tables, with flexible date range selection including single-day view.

## User Preferences (Confirmed)
- **Layout:** Single Scrollable Page - all 12 sections visible on one page
- **Geographic:** Full World Map with country/region/city drill-down
- **ML Insights:** Full ML features - recruiter detection, conversion probability, high-value scoring
- **Comparisons:** Full comparison suite - WoW, MoM, trend indicators, anomaly alerts

---

## Data Sources: All 31 Tables

### Layer 1: Base Events (9 tables)
| Table | Rows | Key Insights |
|-------|------|--------------|
| `sessions` | 231 | 51 columns - Device, geo, engagement, returning visitors |
| `page_views` | 814 | Navigation flow, time on page, entrance/exit |
| `project_events` | 176 | Project interactions, deep reads, case studies |
| `section_events` | 6,073 | Scroll depth, section flow, engagement |
| `skill_events` | 27 | Skill clicks, categories, context |
| `conversion_events` | 20 | CTAs, forms, downloads, social clicks |
| `client_events` | 110 | Client interest, domains, experience |
| `recommendation_events` | 0 | Recommendation interactions |
| `certification_events` | 0 | Certification engagement |

### Layer 2: Daily Aggregates (11 tables)
| Table | Key Metrics |
|-------|-------------|
| `daily_metrics` | Sessions, visitors, engagement/bounce rates, device split, dark mode % |
| `project_daily_stats` | Views, clicks, CTR, GitHub/demo clicks, technologies |
| `section_daily_stats` | Views, engagement rate, scroll depth, exit rate |
| `skill_daily_stats` | Clicks, hovers, interest score, skill levels |
| `traffic_daily_stats` | Source/medium performance, engagement by source |
| `conversion_funnel` | Full funnel: CTA → form → submit, time to convert |
| `client_daily_stats` | Client engagement, case study opens |
| `domain_daily_stats` | Industry interest signals |
| `experience_daily_stats` | Role/company interest |
| `recommendation_daily_stats` | Position CTR, algorithm performance |
| `content_reading_stats` | Problem/solution read times |

### Layer 3: Rankings & Insights (10 tables)
| Table | Insights |
|-------|----------|
| `project_rankings` | Engagement scores, performance tiers, recommended positions |
| `skill_rankings` | Demand tiers, learning priorities |
| `section_rankings` | Health scores, optimization hints |
| `visitor_insights` | Segments, value scores, interest profiles |
| `recommendations` | Pre-computed recommendations per user |
| `client_rankings` | Client engagement rankings |
| `domain_rankings` | Industry demand tiers |
| `experience_rankings` | Role attractiveness |
| `recommendation_performance` | System health, top performers |
| `tech_demand_insights` | Technology demand ranking |

### ML Layer (1 table)
| Table | Features |
|-------|----------|
| `ml_training_data` | 80 features - Conversion predictions, visitor scoring |

---

## Dashboard3 Structure: 12 Sections

### Section 1: Executive Command Center
**Purpose:** At-a-glance KPIs with period comparison

**Components:**
- `CommandCenterHeader` - Date range picker with presets + single day
- `KPIGrid` - 8 key metrics with trend indicators (↑↓)
- `HealthScoreGauge` - Overall portfolio health (0-100)
- `AlertBanner` - Anomaly detection alerts

**Data Sources:** `daily_metrics`, `conversion_funnel`, `sessions`

**Metrics:**
- Total Sessions / Unique Visitors
- Engagement Rate / Bounce Rate
- Avg Session Duration
- Conversions (Form + Resume)
- Period-over-Period Change (%)

---

### Section 2: Traffic Acquisition Hub
**Purpose:** Where visitors come from and quality analysis

**Components:**
- `TrafficTrendChart` - Sessions over time (area chart)
- `SourceMediumMatrix` - Bubble chart (sessions vs engagement)
- `CampaignPerformanceTable` - Campaign breakdown
- `ReferrerAnalysis` - Top referrers list
- `LandingPagePerformance` - Entry page analysis
- `NewVsReturningTrend` - Stacked area chart

**Data Sources:** `traffic_daily_stats`, `sessions`, `page_views`

**Metrics:**
- Traffic by Source (direct, google, linkedin, github, etc.)
- Traffic by Medium (organic, referral, social)
- Campaign performance
- Landing page conversion rates
- New vs Returning visitor ratio trend

---

### Section 3: Geographic Intelligence
**Purpose:** Global visitor distribution and regional insights

**Components:**
- `WorldMapVisualization` - Interactive choropleth map
- `TopCountriesRanking` - Bar chart with flags
- `ContinentBreakdown` - Pie/donut chart
- `CityHeatmap` - Top cities list
- `RegionDrilldown` - Expandable country → region → city

**Data Sources:** `sessions` (country, region, city, continent)

**Metrics:**
- Visitors by country
- Engagement rate by region
- Top 10 cities
- Continent distribution

---

### Section 4: Visitor Intelligence Center
**Purpose:** Deep visitor segmentation and behavior analysis

**Components:**
- `VisitorSegmentSunburst` - Hierarchical segment visualization
- `VisitorValueDistribution` - Histogram of value scores
- `InterestProfileCards` - Top interest profiles
- `HighValueVisitorTable` - Detailed high-value visitor list
- `RecruiterDetectionPanel` - Likely recruiter indicators
- `VisitorJourneyFlow` - Sankey diagram of user paths

**Data Sources:** `visitor_insights`, `ml_training_data`, `sessions`

**Segments:**
- Converters
- High Intent
- Engaged Explorers
- Returning Visitors
- Casual Browsers

**ML Insights:**
- `target_high_value_visitor` detection
- `target_likely_recruiter` signals
- `target_deep_explorer` identification

---

### Section 5: Engagement Deep Dive
**Purpose:** How visitors interact with the site

**Components:**
- `EngagementScoreDistribution` - Histogram
- `EngagementTierBreakdown` - Stacked bar (very_high/high/medium/low)
- `ScrollDepthAnalysis` - Funnel visualization
- `TimeOnSiteTrend` - Average session duration over time
- `EventsPerSession` - Distribution chart
- `BounceRateAnalysis` - By source/device/page

**Data Sources:** `sessions`, `daily_metrics`, `section_events`

**Metrics:**
- Engagement score distribution
- Max scroll depth analysis
- Click events per session
- Scroll events per session
- Engaged vs bounced sessions

---

### Section 6: Content Performance Matrix
**Purpose:** Project and content effectiveness analysis

**Components:**
- `ProjectPerformanceMatrix` - Bubble chart (views × engagement × clicks)
- `ProjectRankingTable` - Sortable table with all metrics
- `CategoryPerformance` - Performance by project category
- `CaseStudyCompletion` - Completion rate analysis
- `DeepReadAnalysis` - Deep read tracking
- `TechnologyClickHeatmap` - Which tech tags get clicked
- `GitHubVsDemoRatio` - Action intent analysis

**Data Sources:** `project_rankings`, `project_daily_stats`, `project_events`

**Metrics:**
- Total views, unique viewers
- Click-through rate
- Expand rate
- GitHub clicks vs Demo clicks
- Case study scroll depth & completion
- Technologies clicked
- Skill-driven clicks
- Recommended position effectiveness

---

### Section 7: Section Flow Analysis
**Purpose:** How users navigate through page sections

**Components:**
- `SectionSankeyDiagram` - Flow from section to section
- `SectionHealthRadar` - Radar chart of all sections
- `DropoffHeatmap` - Where users leave
- `SectionEngagementTimeline` - Time-based section performance
- `ScrollVelocityChart` - Reading speed analysis
- `EntryExitAnalysis` - Entry/exit direction patterns
- `OptimizationRecommendations` - Auto-generated hints

**Data Sources:** `section_rankings`, `section_daily_stats`, `section_events`

**Metrics:**
- Section views and engagement rate
- Avg time spent per section
- Scroll depth per section
- Exit rate per section
- Health score (0-100)
- Continue rate (% going to next section)
- Bouncing sessions per section
- Entry direction (scroll up/down)
- Navigation method analysis

---

### Section 8: Skills & Technology Demand
**Purpose:** What technologies attract visitor interest

**Components:**
- `TechDemandTreemap` - Hierarchical tech visualization
- `SkillCategorySunburst` - Category breakdown
- `DemandTierDistribution` - High/Moderate/Emerging/Niche
- `LearningPriorityMatrix` - What to learn next
- `SkillToProjectCorrelation` - Which skills drive project views
- `SkillLevelInterest` - Advanced/Intermediate/Beginner clicks

**Data Sources:** `skill_rankings`, `skill_daily_stats`, `tech_demand_insights`, `skill_events`

**Metrics:**
- Skill clicks and hovers
- Interest score (weighted)
- Demand rank and tier
- Learning priority recommendations
- Related projects count
- Time on site before skill click
- Skill category distribution

---

### Section 9: Experience & Domain Analytics
**Purpose:** Professional interest and industry vertical analysis

**Components:**
- `DomainInterestFunnel` - Industry vertical performance
- `ExperienceAttractivenessChart` - Role interest comparison
- `ClientEngagementRanking` - Which companies attract interest
- `ProblemSolutionReadingRatio` - Technical depth preference
- `ContributionViewsAnalysis` - What work matters
- `DomainRecommendations` - Portfolio positioning advice

**Data Sources:** `domain_rankings`, `experience_rankings`, `client_rankings`, `client_events`, `domain_daily_stats`, `experience_daily_stats`

**Metrics:**
- Domain interest scores
- Explicit vs implicit interest signals
- Experience/role attractiveness
- Client views and engagement
- Case study open rates
- Problem vs solution read time ratio
- Contribution views

---

### Section 10: Conversion Intelligence
**Purpose:** Full conversion funnel and CTA analysis

**Components:**
- `FullFunnelVisualization` - CTA View → Click → Form Start → Submit
- `CTAPerformanceMatrix` - CTA effectiveness by name/location
- `FormAnalyticsDashboard` - Field-level form analysis
- `TimeToConversionChart` - How long before conversion
- `PreConversionPath` - What content drives conversions
- `SocialPlatformBreakdown` - LinkedIn vs GitHub vs others
- `ResumeDownloadAnalysis` - Download source and timing
- `MicroConversionTracking` - Small conversion signals

**Data Sources:** `conversion_funnel`, `conversion_events`

**Metrics:**
- CTA views and clicks
- CTA click rate
- Form starts, field focuses, submissions
- Form completion rate
- Social clicks by platform
- Resume downloads
- Outbound clicks
- Content copies
- Exit intent rate
- Avg time to conversion
- Avg sections/projects before conversion
- Returning visitor conversion share

---

### Section 11: Recommendation Engine Analytics
**Purpose:** Recommendation system effectiveness

**Components:**
- `SystemHealthGauge` - Overall recommendation health
- `PositionCTRComparison` - Position 1/2/3 effectiveness
- `TopPerformingRecommendations` - Best rec pairs
- `AlgorithmEffectiveness` - Which algo works best
- `AboveBelowFoldImpact` - Visibility impact analysis
- `RecommendationDrivers` - What drives rec clicks

**Data Sources:** `recommendation_performance`, `recommendation_daily_stats`, `recommendations`

**Metrics:**
- Overall CTR
- Position-based CTR (1, 2, 3)
- Total impressions and clicks
- User conversion rate
- Above/below fold CTR
- Top performing recommendations
- Top recommendation drivers
- System health status

---

### Section 12: Temporal & Technical Analysis
**Purpose:** Time-based patterns and technical insights

**Components:**
- `HourOfDayHeatmap` - Best times for visits (calendar heatmap)
- `DayOfWeekPerformance` - Weekday vs weekend
- `VisitFrequencyDistribution` - Return patterns
- `DevicePerformanceComparison` - Mobile vs Desktop engagement
- `BrowserAnalysis` - Browser-specific insights
- `ConnectionTypeImpact` - Slow connection performance
- `DarkLightModeUsage` - Theme preferences
- `LanguageDistribution` - User language preferences

**Data Sources:** `sessions`, `daily_metrics`, `ml_training_data`

**Metrics:**
- Hour of day distribution
- Day of week performance
- Visit count distribution
- Days since last visit
- Session time of day (morning/afternoon/evening)
- Device category breakdown
- OS distribution
- Browser distribution
- Mobile brand/model analysis
- Connection type (4G, WiFi, slow)
- Dark mode percentage
- Device/browser language

---

## Enhanced Date Range Picker

**Features:**
- Preset options: Today, Yesterday, Last 7/14/30/90 days
- Custom date range with calendar
- **Single day selection mode**
- Compare periods (vs previous period)
- Keyboard shortcuts

**Component:** `AdvancedDateRangePicker`

---

## New API Endpoints Needed

```python
# Additional endpoints for Dashboard3
GET /api/hourly-distribution      # Hour of day breakdown
GET /api/geographic-details       # Full geo with cities
GET /api/page-flow               # Navigation paths
GET /api/section-flow            # Section-to-section flow
GET /api/visitor-journeys        # User journey paths
GET /api/ml-predictions          # ML model predictions
GET /api/anomalies               # Anomaly detection
```

---

## New Dashboard Components to Create

### Container Components
1. `Dashboard3.tsx` - Main page component
2. `AdvancedDateRangePicker.tsx` - Enhanced date picker
3. `DashboardTab.tsx` - Tab navigation wrapper
4. `CollapsibleSection.tsx` - Expandable sections

### Visualization Components
1. `WorldMapChart.tsx` - Choropleth map (using react-simple-maps)
2. `SankeyDiagram.tsx` - Flow visualization
3. `CalendarHeatmap.tsx` - Time-based heatmap
4. `TreemapChart.tsx` - Hierarchical data
5. `SunburstChart.tsx` - Nested categories
6. `GaugeChart.tsx` - Health score gauge
7. `FunnelChart.tsx` - Enhanced funnel
8. `WaterfallChart.tsx` - Period comparison

### Data Components
1. `KPICard.tsx` - Enhanced metric card with sparkline
2. `RankingTable.tsx` - Sortable data table
3. `InsightCard.tsx` - Auto-generated insight
4. `AnomalyAlert.tsx` - Anomaly notification
5. `ComparisonBadge.tsx` - Period comparison badge

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create `Dashboard3.tsx` shell
- [ ] Implement `AdvancedDateRangePicker` with single-day support
- [ ] Create new TypeScript types for all data
- [ ] Add new API endpoints to backend

### Phase 2: Core Sections (1-4)
- [ ] Executive Command Center
- [ ] Traffic Acquisition Hub
- [ ] Geographic Intelligence
- [ ] Visitor Intelligence Center

### Phase 3: Engagement Sections (5-8)
- [ ] Engagement Deep Dive
- [ ] Content Performance Matrix
- [ ] Section Flow Analysis
- [ ] Skills & Technology Demand

### Phase 4: Conversion & Analytics (9-12)
- [ ] Experience & Domain Analytics
- [ ] Conversion Intelligence
- [ ] Recommendation Engine Analytics
- [ ] Temporal & Technical Analysis

### Phase 5: Polish
- [ ] Anomaly detection
- [ ] Period comparison
- [ ] Export functionality
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## Files to Create/Modify

### New Files
```
src/pages/Dashboard3.tsx
src/components/dashboard3/
├── index.ts
├── AdvancedDateRangePicker.tsx
├── CommandCenter/
│   ├── KPIGrid.tsx
│   ├── HealthScoreGauge.tsx
│   └── AlertBanner.tsx
├── Traffic/
│   ├── SourceMediumMatrix.tsx
│   ├── NewVsReturningTrend.tsx
│   └── LandingPageTable.tsx
├── Geographic/
│   ├── WorldMapChart.tsx
│   ├── TopCountriesRanking.tsx
│   └── ContinentBreakdown.tsx
├── Visitors/
│   ├── VisitorSegmentSunburst.tsx
│   ├── VisitorJourneyFlow.tsx
│   └── HighValueVisitorTable.tsx
├── Engagement/
│   ├── EngagementDistribution.tsx
│   ├── ScrollDepthFunnel.tsx
│   └── BounceRateAnalysis.tsx
├── Content/
│   ├── ProjectMatrix.tsx
│   ├── TechnologyHeatmap.tsx
│   └── CaseStudyCompletion.tsx
├── Sections/
│   ├── SectionSankey.tsx
│   ├── SectionHealthRadar.tsx
│   └── DropoffHeatmap.tsx
├── Skills/
│   ├── TechDemandTreemap.tsx
│   ├── SkillCategorySunburst.tsx
│   └── LearningPriorityMatrix.tsx
├── Experience/
│   ├── DomainInterestChart.tsx
│   ├── ExperienceRanking.tsx
│   └── ClientEngagement.tsx
├── Conversions/
│   ├── FullFunnel.tsx
│   ├── CTAPerformanceMatrix.tsx
│   └── FormAnalytics.tsx
├── Recommendations/
│   ├── SystemHealthGauge.tsx
│   ├── PositionCTRChart.tsx
│   └── TopRecommendations.tsx
├── Temporal/
│   ├── HourOfDayHeatmap.tsx
│   ├── DayOfWeekChart.tsx
│   └── DeviceBrowserAnalysis.tsx
└── shared/
    ├── ComparisonBadge.tsx
    ├── TrendIndicator.tsx
    └── DataTable.tsx

src/hooks/useDashboard3Data.ts
src/types/dashboard3.ts
```

### Backend Modifications
```
analytics-backend/functions/main.py
  - Add new endpoints for Dashboard3
```

---

## Verification Plan

1. **Unit Tests:** Test data transformation functions
2. **API Tests:** Verify all endpoints return correct data
3. **Visual Tests:** Check all charts render correctly
4. **Date Range Tests:** Verify single day, ranges, comparisons work
5. **Responsive Tests:** Mobile/tablet/desktop layouts
6. **Performance Tests:** Load time under 3 seconds

---

## UI Design Requirements (Match Portfolio Style)

### Color Scheme
```
Primary Neon: #7B42F6 (Purple)
Bright Cyan: #00E0FF (Tech Accent)
Glow Purple: #9D41FB
Highlight Pink: #FF3DDB
Deep Background: #0A0426
Glass Effect: rgba(44, 31, 97, 0.35)
```

### Core Visual Patterns
1. **Glassmorphism:** `backdrop-blur-xl` + semi-transparent backgrounds + subtle borders
2. **Gradient Text:** `bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight`
3. **Hover Effects:** Consistent `y: -4` elevation with enhanced shadow
4. **Neon Glow:** Box shadows using tech colors with 0.3-0.5 opacity
5. **Animated Backgrounds:** Large blurred orbs with 8-25s infinite animations

### Component Styling
- Use existing `GlassCard`, `MetricCard`, `DashboardSection` components
- Maintain dark/light mode support
- Apply `glass` and `glass-card` CSS classes
- Use Framer Motion for animations (stagger: 0.1s)

### Typography
- Headings: Poppins
- Body: Inter
- Code: JetBrains Mono

---

## Summary

Dashboard3 will be a **comprehensive analytics command center** with:
- **12 major sections** covering every aspect of portfolio analytics
- **50+ visualization components**
- **All 31 BigQuery tables** utilized
- **Flexible date selection** including single day
- **Period comparison** for trend analysis
- **ML-powered insights** for visitor scoring
- **Auto-generated recommendations** for optimization
