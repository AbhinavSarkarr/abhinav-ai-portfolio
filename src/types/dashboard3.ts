// Dashboard3 - Comprehensive Analytics Types
// Covers all 31 BigQuery materialized tables

// ============================================
// Date & Period Types
// ============================================
export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodComparison {
  current: DateRange;
  previous: DateRange;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
}

// ============================================
// Layer 1: Base Event Types
// ============================================

export interface Session {
  user_pseudo_id: string;
  session_id: number;
  session_start: string;
  session_end: string;
  device_category: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  mobile_brand?: string;
  mobile_model?: string;
  device_language: string;
  country: string;
  region: string;
  city: string;
  continent: string;
  traffic_source: string;
  traffic_medium: string;
  campaign_name?: string;
  total_events: number;
  page_views: number;
  scroll_events: number;
  click_events: number;
  engaged_session: number;
  max_engagement_time_msec: number;
  landing_page: string;
  exit_page: string;
  visit_count: number;
  days_since_last_visit: number;
  is_returning: boolean;
  engagement_score: number;
  engagement_level: string;
  max_scroll_depth: number;
  sections_viewed_count: number;
  projects_clicked_count: number;
  conversions_count: number;
  day_of_week_name: string;
  hour_of_day: number;
  local_timezone: string;
  color_scheme: 'dark' | 'light';
  user_language: string;
  connection_type: string;
  session_duration_seconds: number;
  session_date: string;
  is_bounce: boolean;
  is_engaged: boolean;
  engagement_tier: 'very_high' | 'high' | 'medium' | 'low';
  visitor_type: string;
  has_conversion: boolean;
}

export interface PageView {
  event_date: string;
  event_timestamp: string;
  user_pseudo_id: string;
  session_id: number;
  page_url: string;
  page_title: string;
  page_referrer: string;
  section_hash: string;
  previous_page: string;
  page_type: string;
  page_number: number;
  time_on_previous_page_sec: number;
  time_since_session_start_sec: number;
  engagement_time_msec: number;
  is_entrance: number;
  device_category: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  traffic_source: string;
  traffic_medium: string;
}

export interface ProjectEvent {
  event_date: string;
  event_timestamp: string;
  user_pseudo_id: string;
  session_id: number;
  event_name: string;
  project_id: string;
  project_title: string;
  project_category: string;
  action_type: string;
  technology: string;
  display_position: number;
  view_duration_ms: number;
  time_on_page_sec: number;
  is_first_view: boolean;
  projects_viewed_before: number;
  was_recommended: boolean;
  hover_duration_sec: number;
  is_from_skill_click: boolean;
  source_skill: string;
  scroll_depth_percent: number;
  sections_read_count: number;
  completion_rate: number;
  is_deep_read: boolean;
  link_type: string;
  link_url: string;
  device_category: string;
  country: string;
}

export interface SectionEvent {
  event_date: string;
  event_timestamp: string;
  user_pseudo_id: string;
  session_id: number;
  event_name: string;
  section_id: string;
  section_name: string;
  time_spent_seconds: number;
  scroll_depth_percent: number;
  engagement_value: number;
  scroll_milestone: number;
  time_threshold_sec: number;
  entry_direction: 'scroll_down' | 'scroll_up';
  previous_section: string;
  section_position: number;
  exit_direction: string;
  scroll_velocity: number;
  time_to_reach_depth_sec: number;
  is_bouncing: boolean;
  from_section: string;
  to_section: string;
  navigation_method: string;
  device_category: string;
  browser: string;
  country: string;
}

export interface SkillEvent {
  event_date: string;
  event_timestamp: string;
  user_pseudo_id: string;
  session_id: number;
  event_name: string;
  skill_name: string;
  skill_category: string;
  interaction_context: string;
  skill_position: number;
  skill_level: 'advanced' | 'intermediate' | 'beginner';
  related_projects_count: number;
  time_on_site_sec: number;
  projects_viewed_before: number;
  sections_viewed: number;
  was_in_viewport: boolean;
  device_category: string;
  country: string;
}

export interface ConversionEvent {
  event_date: string;
  event_timestamp: string;
  user_pseudo_id: string;
  session_id: number;
  event_name: string;
  cta_name: string;
  cta_location: string;
  cta_text: string;
  form_name: string;
  form_step: string;
  form_field: string;
  submission_status: string;
  link_url: string;
  link_text: string;
  link_domain: string;
  file_name: string;
  file_type: string;
  social_platform: string;
  exit_last_section: string;
  exit_time_on_page: number;
  exit_scroll_depth: number;
  copied_content_type: string;
  time_on_site_before_start: number;
  sections_viewed: number;
  projects_viewed: number;
  projects_clicked_before: number;
  scroll_depth_at_start: number;
  message_length: number;
  time_to_submit_sec: number;
  is_returning_visitor: boolean;
  download_source: string;
  device_category: string;
  country: string;
  traffic_source: string;
}

export interface ClientEvent {
  event_date: string;
  event_timestamp: string;
  user_pseudo_id: string;
  session_id: number;
  event_name: string;
  client_id: string;
  client_name: string;
  domain: string;
  experience_id: string;
  experience_title: string;
  company: string;
  time_spent_seconds: number;
  scroll_depth_percent: number;
  read_time_seconds: number;
  contribution_index: number;
  technology: string;
  is_first_view: boolean;
  clients_viewed_before: number;
  is_deep_read: boolean;
  completion_rate: number;
  was_recommended: boolean;
  contributions_read_count: number;
  time_since_session_start: number;
  device_category: string;
  country: string;
}

// ============================================
// Layer 2: Daily Aggregate Types
// ============================================

export interface DailyMetrics {
  session_date: string;
  total_sessions: number;
  unique_visitors: number;
  total_page_views: number;
  avg_pages_per_session: number;
  engaged_sessions: number;
  engagement_rate: number;
  bounces: number;
  bounce_rate: number;
  avg_session_duration_sec: number;
  avg_engagement_time_sec: number;
  desktop_sessions: number;
  mobile_sessions: number;
  tablet_sessions: number;
  avg_session_hour: number;
  avg_engagement_score: number;
  very_high_engagement_sessions: number;
  high_engagement_sessions: number;
  medium_engagement_sessions: number;
  low_engagement_sessions: number;
  returning_visitor_sessions: number;
  returning_visitor_rate: number;
  avg_visit_count_returning: number;
  dark_mode_sessions: number;
  light_mode_sessions: number;
  dark_mode_percentage: number;
  sessions_4g: number;
  sessions_wifi: number;
  sessions_slow_connection: number;
}

export interface ProjectDailyStats {
  event_date: string;
  project_id: string;
  project_title: string;
  project_category: string;
  views: number;
  unique_viewers: number;
  unique_sessions: number;
  clicks: number;
  expands: number;
  link_clicks: number;
  case_study_engagements: number;
  avg_view_duration_ms: number;
  avg_time_on_page_sec: number;
  click_through_rate: number;
  technologies_clicked: string[];
  github_clicks: number;
  demo_clicks: number;
  external_clicks: number;
  avg_display_position: number;
  desktop_interactions: number;
  mobile_interactions: number;
  first_time_views: number;
  avg_projects_viewed_before: number;
  recommended_project_views: number;
  recommended_view_rate: number;
  avg_hover_duration_sec: number;
  skill_driven_clicks: number;
  skill_driven_click_rate: number;
  source_skills: string[];
  deep_reads: number;
  avg_case_study_scroll_depth: number;
  avg_case_study_completion_rate: number;
  avg_sections_read: number;
}

export interface SectionDailyStats {
  event_date: string;
  section_id: string;
  views: number;
  unique_viewers: number;
  unique_sessions: number;
  engaged_views: number;
  engagement_rate: number;
  avg_time_spent_seconds: number;
  max_time_threshold_reached: number;
  avg_scroll_depth_percent: number;
  max_scroll_milestone: number;
  exits: number;
  exit_rate: number;
  desktop_views: number;
  mobile_views: number;
  entries_from_above: number;
  entries_from_below: number;
  continued_to_next: number;
  went_back_up: number;
  continue_rate: number;
  avg_section_position: number;
  avg_scroll_velocity: number;
  avg_time_to_scroll_depth: number;
  bouncing_sessions: number;
  bounce_rate_from_section: number;
}

export interface SkillDailyStats {
  event_date: string;
  skill_name: string;
  skill_category: string;
  clicks: number;
  hovers: number;
  unique_users: number;
  unique_sessions: number;
  category_views: number;
  weighted_interest_score: number;
  avg_position: number;
  advanced_skill_clicks: number;
  intermediate_skill_clicks: number;
  beginner_skill_clicks: number;
  avg_related_projects: number;
  avg_time_on_site_before_click: number;
  avg_projects_viewed_before_click: number;
  avg_sections_viewed_before_click: number;
  clicks_while_in_viewport: number;
}

export interface TrafficDailyStats {
  event_date: string;
  traffic_source: string;
  traffic_medium: string;
  campaign_name: string;
  sessions: number;
  unique_visitors: number;
  total_page_views: number;
  avg_pages_per_session: number;
  avg_session_duration_sec: number;
  engagement_rate: number;
  bounce_rate: number;
  desktop_sessions: number;
  mobile_sessions: number;
  avg_engagement_score: number;
  high_engagement_sessions: number;
  high_engagement_rate: number;
  returning_visitors: number;
  returning_visitor_rate: number;
  avg_scroll_depth: number;
}

export interface ConversionFunnel {
  event_date: string;
  total_sessions: number;
  unique_visitors: number;
  total_cta_views: number;
  total_cta_clicks: number;
  cta_click_rate: number;
  contact_form_starts: number;
  contact_form_field_focuses: number;
  contact_form_submissions: number;
  form_completion_rate: number;
  social_clicks: number;
  social_click_rate: number;
  outbound_clicks: number;
  outbound_click_rate: number;
  resume_downloads: number;
  file_downloads: number;
  publication_clicks: number;
  content_copies: number;
  exit_intent_rate: number;
  avg_conversion_score: number;
  avg_time_to_conversion_start: number;
  avg_sections_before_conversion: number;
  avg_projects_before_conversion: number;
  avg_projects_clicked_before_conversion: number;
  avg_scroll_depth_at_conversion: number;
  avg_contact_message_length: number;
  avg_form_completion_time_sec: number;
  returning_visitor_conversions: number;
  returning_visitor_conversion_share: number;
  idle_exits: number;
  idle_exit_rate: number;
}

export interface DomainDailyStats {
  event_date: string;
  domain: string;
  explicit_interest_signals: number;
  implicit_interest_from_views: number;
  total_domain_interactions: number;
  unique_interested_users: number;
  unique_sessions: number;
  domain_interest_score: number;
  desktop_interactions: number;
  mobile_interactions: number;
  first_time_domain_views: number;
  first_time_view_rate: number;
  deep_reads: number;
  deep_read_rate: number;
  avg_completion_rate: number;
  recommended_views: number;
  recommendation_driven_rate: number;
  avg_time_into_session: number;
}

export interface ExperienceDailyStats {
  event_date: string;
  experience_id: string;
  experience_title: string;
  company: string;
  total_interactions: number;
  unique_interested_users: number;
  unique_sessions: number;
  desktop_views: number;
  mobile_views: number;
  first_time_views: number;
  deep_reads: number;
  avg_completion_rate: number;
  avg_time_into_session: number;
}

// ============================================
// Layer 3: Rankings & Insights Types
// ============================================

export interface ProjectRanking {
  project_id: string;
  project_title: string;
  project_category: string;
  total_views: number;
  total_unique_viewers: number;
  total_clicks: number;
  total_expands: number;
  total_link_clicks: number;
  total_github_clicks: number;
  total_demo_clicks: number;
  avg_view_duration_sec: number;
  avg_ctr_percent: number;
  engagement_score: number;
  overall_rank: number;
  category_rank: number;
  engagement_percentile: number;
  performance_tier: 'above_average' | 'average' | 'below_average';
  all_technologies_clicked: string[];
  recommended_position: 'featured' | 'primary' | 'secondary';
}

export interface SkillRanking {
  skill_name: string;
  skill_category: string;
  total_clicks: number;
  total_hovers: number;
  total_unique_users: number;
  total_unique_sessions: number;
  total_interest_score: number;
  overall_rank: number;
  category_rank: number;
  interest_percentile: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'emerging_interest' | 'niche';
  recommendation: string;
}

export interface SectionRanking {
  section_id: string;
  // Unique metrics (for funnel analysis - each session counts once)
  total_unique_views: number;
  total_unique_exits: number;
  total_unique_viewers: number;
  avg_exit_rate: number;  // Based on unique, always <=100%
  // Total metrics (for engagement analysis - includes revisits)
  total_views: number;
  total_exits: number;
  avg_total_exit_rate: number;
  avg_revisits_per_session: number;
  // Engagement metrics
  total_engaged_views: number;
  avg_engagement_rate: number;
  avg_time_spent_seconds: number;
  avg_scroll_depth_percent: number;
  max_scroll_milestone: number;
  // Scores and rankings
  health_score: number;
  engagement_rank: number;
  view_rank: number;
  retention_rank: number;
  health_tier: 'excellent' | 'good' | 'needs_attention' | 'critical';
  dropoff_indicator: string;
  optimization_hint: string;
}

export interface VisitorInsight {
  user_pseudo_id: string;
  total_sessions: number;
  first_visit: string;
  last_visit: string;
  visitor_tenure_days: number;
  total_page_views: number;
  avg_session_duration_sec: number;
  engaged_sessions: number;
  engagement_rate: number;
  primary_device: string;
  primary_country: string;
  primary_traffic_source: string;
  landing_pages: string[];
  exit_pages: string[];
  projects_viewed: number;
  project_ids_viewed: string[];
  project_categories_viewed: string[];
  technologies_explored: string[];
  skills_clicked: string[];
  skill_categories: string[];
  cta_clicks: number;
  form_submissions: number;
  social_clicks: number;
  resume_downloads: number;
  outbound_clicks: number;
  publication_clicks: number;
  content_copies: number;
  visitor_value_score: number;
  visitor_segment: 'converter' | 'high_intent' | 'engaged_explorer' | 'returning' | 'casual_browser';
  interest_profile: string;
}

export interface DomainRanking {
  domain: string;
  total_explicit_interest: number;
  total_implicit_interest: number;
  total_interactions: number;
  total_unique_users: number;
  total_interest_score: number;
  interest_rank: number;
  interest_percentile: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'emerging_interest' | 'niche_interest';
  portfolio_recommendation: string;
}

export interface ExperienceRanking {
  experience_id: string;
  experience_title: string;
  company: string;
  total_interactions: number;
  total_unique_users: number;
  total_sessions: number;
  interest_rank: number;
  interest_percentile: number;
  role_attractiveness: string;
  positioning_suggestion: string;
}

export interface RecommendationPerformance {
  total_impressions: number;
  total_clicks: number;
  overall_ctr: number;
  total_users_shown: number;
  total_users_clicked: number;
  user_conversion_rate: number;
  position_1_ctr: number;
  position_2_ctr: number;
  position_3_ctr: number;
  best_position_insight: string;
  top_performing_recommendations: {
    recommended_project_id: string;
    recommended_project_title: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
  top_recommendation_drivers: {
    source_project_id: string;
    clicks_generated: number;
    unique_projects_clicked: number;
  }[];
  system_health: 'excellent' | 'good' | 'needs_improvement' | 'underperforming';
}

export interface TechDemandInsight {
  technology: string;
  total_interactions: number;
  total_unique_users: number;
  demand_rank: number;
  demand_percentile: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'emerging_interest' | 'niche';
  learning_priority: string;
}

// ============================================
// ML Layer Types
// ============================================

export interface MLTrainingData {
  user_pseudo_id: string;
  session_id: number;
  session_date: string;
  device_category: string;
  browser: string;
  os: string;
  country: string;
  traffic_source: string;
  traffic_medium: string;
  session_hour: number;
  session_day_of_week: number;
  session_time_of_day: string;
  session_day_type: string;
  session_duration_seconds: number;
  page_views: number;
  total_events: number;
  scroll_events: number;
  click_events: number;
  is_bounce: boolean;
  is_engaged: boolean;
  projects_viewed: number;
  total_project_views: number;
  total_project_clicks: number;
  total_project_expands: number;
  total_project_link_clicks: number;
  avg_project_engagement: number;
  max_project_engagement: number;
  high_interest_projects: number;
  sections_viewed: number;
  total_section_views: number;
  total_sections_engaged: number;
  avg_time_spent_seconds: number;
  max_scroll_depth_percent: number;
  max_scroll_milestone: number;
  unique_skills_clicked: number;
  unique_skill_categories: number;
  skills_clicked_list: string;
  skill_categories_list: string;
  // Target variables
  target_contact_conversion: number;
  target_resume_conversion: number;
  target_external_conversion: number;
  target_engagement_score: number;
  target_high_value_visitor: number;
  target_likely_recruiter: number;
  target_deep_explorer: number;
}

// ============================================
// Dashboard3 Aggregate Types
// ============================================

export interface OverviewKPIs {
  totalSessions: number;
  uniqueVisitors: number;
  engagementRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  totalConversions: number;
  resumeDownloads: number;
  socialClicks: number;
  // Comparison with previous period
  sessionsTrend: PeriodComparison;
  visitorsTrend: PeriodComparison;
  engagementTrend: PeriodComparison;
  conversionTrend: PeriodComparison;
}

export interface GeographicData {
  countries: { country: string; visitors: number; sessions: number; engagement_rate: number }[];
  continents: { continent: string; visitors: number }[];
  cities: { city: string; country: string; visitors: number }[];
  regions: { region: string; country: string; visitors: number }[];
}

export interface TemporalData {
  hourlyDistribution: { hour: number; sessions: number; engagement_rate: number }[];
  dayOfWeekDistribution: { day: string; sessions: number; engagement_rate: number }[];
  visitFrequency: { visit_count: number; users: number }[];
}

export interface DeviceData {
  categories: { device: string; sessions: number; engagement_rate: number }[];
  browsers: { browser: string; sessions: number }[];
  operatingSystems: { os: string; sessions: number }[]; 
  connectionTypes: { type: string; sessions: number }[];
  colorSchemes: { scheme: string; sessions: number }[];
}

export interface SectionFlowData {
  flows: { from: string; to: string; count: number }[];
  entryPoints: { section: string; count: number }[];
  exitPoints: { section: string; count: number }[];
}

// ============================================
// Dashboard3 Complete Data Structure
// ============================================

export interface Dashboard3Data {
  // Date range
  dateRange: DateRange;

  // Executive Overview
  overview: OverviewKPIs;

  // Traffic & Acquisition
  dailyMetrics: DailyMetrics[];
  trafficSources: TrafficDailyStats[];

  // Geographic
  geographic: GeographicData;

  // Visitors
  visitorInsights: VisitorInsight[];
  visitorSegments: {
    converters: number;
    high_intent: number;
    engaged_explorers: number;
    returning: number;
    casual_browsers: number;
  };

  // ML Predictions
  mlPredictions: {
    highValueVisitors: number;
    likelyRecruiters: number;
    deepExplorers: number;
  };

  // Projects
  projectRankings: ProjectRanking[];
  projectDailyStats: ProjectDailyStats[];

  // Sections
  sectionRankings: SectionRanking[];
  sectionDailyStats: SectionDailyStats[];
  sectionFlow: SectionFlowData;

  // Skills
  skillRankings: SkillRanking[];
  techDemandInsights: TechDemandInsight[];

  // Experience & Domains
  domainRankings: DomainRanking[];
  experienceRankings: ExperienceRanking[];

  // Conversions
  conversionFunnel: ConversionFunnel[];
  conversionEvents: ConversionEvent[];

  // Recommendations
  recommendationPerformance: RecommendationPerformance;

  // Temporal & Technical
  temporal: TemporalData;
  devices: DeviceData;

  // Metadata
  lastUpdated: string;
}

// ============================================
// API Response Types
// ============================================

export interface APIResponse<T> {
  data: T;
  dateRange: { start: string; end: string };
  source: string;
  updated_at: string;
}

export interface Dashboard3APIEndpoints {
  sessions: '/api/sessions';
  pageViews: '/api/page-views';
  projectEvents: '/api/project-events';
  sectionEvents: '/api/section-events';
  skillEvents: '/api/skill-events';
  conversionEvents: '/api/conversion-events';
  clientEvents: '/api/client-events';
  dailyMetrics: '/api/daily-metrics';
  projectDailyStats: '/api/project-daily-stats';
  sectionDailyStats: '/api/section-daily-stats';
  skillDailyStats: '/api/skill-daily-stats';
  trafficDailyStats: '/api/traffic-daily-stats';
  conversionFunnel: '/api/conversion-funnel';
  projectRankings: '/api/project-rankings';
  skillRankings: '/api/skill-rankings';
  sectionRankings: '/api/section-rankings';
  visitorInsights: '/api/visitor-insights';
  domainRankings: '/api/domain-rankings';
  experienceRankings: '/api/experience-rankings';
  recommendationPerformance: '/api/recommendation-performance';
  techDemandInsights: '/api/tech-demand-insights';
  // New endpoints for Dashboard3
  hourlyDistribution: '/api/hourly-distribution';
  geographicDetails: '/api/geographic-details';
  sectionFlow: '/api/section-flow';
  mlPredictions: '/api/ml-predictions';
}
