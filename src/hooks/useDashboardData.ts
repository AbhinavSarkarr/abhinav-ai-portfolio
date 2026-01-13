import { useState, useEffect, useCallback } from 'react';

// ==================== TYPE DEFINITIONS ====================

export type DateRangePreset = 'yesterday' | 'last_7_days' | 'last_14_days' | 'last_30_days' | 'all_time' | 'custom';

export type DailyMetric = {
  date: string;
  visitors: number;
  sessions: number;
  engagement_rate: number;
  bounce_rate: number;
  avg_duration: number;
  desktop_sessions: number;
  mobile_sessions: number;
  tablet_sessions: number;
};

export type TrafficSource = {
  traffic_source: string;
  traffic_medium: string;
  sessions: number;
  unique_visitors: number;
  engagement_rate: number;
  bounce_rate: number;
  avg_duration: number;
};

export type GeographicData = {
  country: string;
  city: string;
  sessions: number;
  unique_visitors: number;
  engagement_rate: number;
};

export type VisitorSegmentData = {
  count: number;
  avg_value_score: number;
  avg_sessions: number;
  avg_engagement_rate: number;
};

export type VisitorSegments = {
  [key: string]: VisitorSegmentData;
};

export type ConversionSummary = {
  cta_views: number;
  cta_clicks: number;
  form_starts: number;
  form_submissions: number;
  resume_downloads: number;
  social_clicks: number;
  outbound_clicks: number;
  publication_clicks: number;
  content_copies: number;
};

export type TopVisitor = {
  user_pseudo_id: string;
  total_sessions: number;
  visitor_tenure_days: number;
  total_page_views: number;
  avg_session_duration_sec: number;
  engagement_rate: number;
  primary_device: string;
  primary_country: string;
  primary_traffic_source: string;
  projects_viewed: number;
  cta_clicks: number;
  form_submissions: number;
  social_clicks: number;
  resume_downloads: number;
  visitor_value_score: number;
  visitor_segment: string;
  interest_profile: string;
};

export type ProjectRanking = {
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
  engagement_score: number;
  overall_rank: number;
  performance_tier: string;
  recommended_position: string;
  engagement_percentile: number;
};

export type SectionRanking = {
  section_id: string;
  total_views: number;
  total_unique_viewers: number;
  total_engaged_views: number;
  avg_engagement_rate: number;
  avg_time_spent_seconds: number;
  avg_scroll_depth_percent: number;
  total_exits: number;
  avg_exit_rate: number;
  health_score: number;
  engagement_rank: number;
  health_tier: string;
  dropoff_indicator: string;
  optimization_hint: string;
};

export type TechDemand = {
  skill_name: string;
  total_interactions: number;
  total_unique_users: number;
  demand_rank: number;
  demand_percentile: number;
  demand_tier: string;
  learning_priority: string;
};

export type DomainRanking = {
  domain: string;
  total_explicit_interest: number;
  total_implicit_interest: number;
  total_interactions: number;
  total_unique_users: number;
  total_interest_score: number;
  interest_rank: number;
  interest_percentile: number;
  demand_tier: string;
  portfolio_recommendation: string;
};

export type ExperienceRanking = {
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
};

export type HourlyData = {
  hour: number;
  sessions: number;
  unique_visitors: number;
  avg_engagement: number;
  engagement_rate: number;
};

export type DayOfWeekData = {
  day_name: string;
  day_number: number;
  sessions: number;
  unique_visitors: number;
  avg_engagement: number;
  engagement_rate: number;
};

export type DeviceCategory = {
  device_category: string;
  sessions: number;
  unique_visitors: number;
  engagement_rate: number;
  avg_duration: number;
};

export type BrowserData = {
  browser: string;
  sessions: number;
  unique_visitors: number;
};

export type OSData = {
  operating_system: string;
  sessions: number;
  unique_visitors: number;
};

export type OverviewMetrics = {
  totalSessions: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  bounceRate: number;
  engagementRate: number;
  avgEngagementScore: number;
  totalConversions: number;
};

export type DashboardData = {
  overview: OverviewMetrics;
  dailyMetrics: DailyMetric[];
  trafficSources: TrafficSource[];
  conversionSummary: ConversionSummary;
  projectRankings: ProjectRanking[];
  sectionRankings: SectionRanking[];
  visitorSegments: VisitorSegments;
  topVisitors: TopVisitor[];
  techDemand: TechDemand[];
  domainRankings: DomainRanking[];
  experienceRankings: ExperienceRanking[];
  recommendationPerformance: Record<string, unknown>[];
  temporal: {
    hourlyDistribution: HourlyData[];
    dayOfWeekDistribution: DayOfWeekData[];
  };
  devices: {
    categories: DeviceCategory[];
    browsers: BrowserData[];
    operatingSystems: OSData[];
  };
  geographic: GeographicData[];
  dateRange: { start: string; end: string };
};

export type GistData = {
  metadata: {
    updated_at: string;
    data_start_date: string;
    data_end_date: string;
  };
  yesterday: DashboardData;
  last_7_days: DashboardData;
  last_14_days: DashboardData;
  last_30_days: DashboardData;
  all_time: DashboardData;
};

// ==================== CONFIG ====================

const DASHBOARD_GIST_URL = 'https://gist.githubusercontent.com/AbhinavSarkarr/dedbbf6ebcb32542e7b724b86f2b214f/raw/dashboard-analytics.json';
const BACKEND_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'https://portfolio-analytics-api.onrender.com';

// ==================== DATA NORMALIZATION ====================

function toNumber(val: unknown, defaultVal = 0): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultVal : parsed;
  }
  return defaultVal;
}

function normalizeOverview(raw: Record<string, unknown>): OverviewMetrics {
  return {
    totalSessions: toNumber(raw.totalSessions),
    uniqueVisitors: toNumber(raw.uniqueVisitors),
    avgSessionDuration: toNumber(raw.avgSessionDuration),
    avgPagesPerSession: toNumber(raw.avgPagesPerSession),
    bounceRate: toNumber(raw.bounceRate),
    engagementRate: toNumber(raw.engagementRate),
    avgEngagementScore: toNumber(raw.avgEngagementScore),
    totalConversions: toNumber(raw.totalConversions),
  };
}

function normalizeDashboardData(raw: Record<string, unknown>): DashboardData {
  const data = raw as Record<string, unknown>;

  // Normalize overview
  const overview = normalizeOverview((data.overview || {}) as Record<string, unknown>);

  // Normalize dailyMetrics
  const dailyMetrics = ((data.dailyMetrics || []) as Record<string, unknown>[]).map(d => ({
    date: String(d.date || ''),
    visitors: toNumber(d.visitors),
    sessions: toNumber(d.sessions),
    engagement_rate: toNumber(d.engagement_rate),
    bounce_rate: toNumber(d.bounce_rate),
    avg_duration: toNumber(d.avg_duration),
    desktop_sessions: toNumber(d.desktop_sessions),
    mobile_sessions: toNumber(d.mobile_sessions),
    tablet_sessions: toNumber(d.tablet_sessions),
  }));

  // Normalize trafficSources
  const trafficSources = ((data.trafficSources || []) as Record<string, unknown>[]).map(d => ({
    traffic_source: String(d.traffic_source || 'direct'),
    traffic_medium: String(d.traffic_medium || 'none'),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
    engagement_rate: toNumber(d.engagement_rate),
    bounce_rate: toNumber(d.bounce_rate),
    avg_duration: toNumber(d.avg_duration),
  }));

  // Normalize conversionSummary
  const conv = (data.conversionSummary || {}) as Record<string, unknown>;
  const conversionSummary: ConversionSummary = {
    cta_views: toNumber(conv.cta_views),
    cta_clicks: toNumber(conv.cta_clicks),
    form_starts: toNumber(conv.form_starts),
    form_submissions: toNumber(conv.form_submissions),
    resume_downloads: toNumber(conv.resume_downloads),
    social_clicks: toNumber(conv.social_clicks),
    outbound_clicks: toNumber(conv.outbound_clicks),
    publication_clicks: toNumber(conv.publication_clicks),
    content_copies: toNumber(conv.content_copies),
  };

  // Normalize projectRankings
  const projectRankings = ((data.projectRankings || []) as Record<string, unknown>[]).map(d => ({
    project_id: String(d.project_id || ''),
    project_title: String(d.project_title || ''),
    project_category: String(d.project_category || ''),
    total_views: toNumber(d.total_views),
    total_unique_viewers: toNumber(d.total_unique_viewers),
    total_clicks: toNumber(d.total_clicks),
    total_expands: toNumber(d.total_expands),
    total_link_clicks: toNumber(d.total_link_clicks),
    total_github_clicks: toNumber(d.total_github_clicks),
    total_demo_clicks: toNumber(d.total_demo_clicks),
    engagement_score: toNumber(d.engagement_score),
    overall_rank: toNumber(d.overall_rank),
    performance_tier: String(d.performance_tier || ''),
    recommended_position: String(d.recommended_position || ''),
    engagement_percentile: toNumber(d.engagement_percentile),
  }));

  // Normalize sectionRankings
  const sectionRankings = ((data.sectionRankings || []) as Record<string, unknown>[]).map(d => ({
    section_id: String(d.section_id || ''),
    total_views: toNumber(d.total_views),
    total_unique_viewers: toNumber(d.total_unique_viewers),
    total_engaged_views: toNumber(d.total_engaged_views),
    avg_engagement_rate: toNumber(d.avg_engagement_rate),
    avg_time_spent_seconds: toNumber(d.avg_time_spent_seconds),
    avg_scroll_depth_percent: toNumber(d.avg_scroll_depth_percent),
    total_exits: toNumber(d.total_exits),
    avg_exit_rate: toNumber(d.avg_exit_rate),
    health_score: toNumber(d.health_score),
    engagement_rank: toNumber(d.engagement_rank),
    health_tier: String(d.health_tier || ''),
    dropoff_indicator: String(d.dropoff_indicator || ''),
    optimization_hint: String(d.optimization_hint || ''),
  }));

  // Normalize visitorSegments
  const rawSegments = (data.visitorSegments || {}) as Record<string, Record<string, unknown>>;
  const visitorSegments: VisitorSegments = {};
  for (const [key, value] of Object.entries(rawSegments)) {
    visitorSegments[key] = {
      count: toNumber(value.count),
      avg_value_score: toNumber(value.avg_value_score),
      avg_sessions: toNumber(value.avg_sessions),
      avg_engagement_rate: toNumber(value.avg_engagement_rate),
    };
  }

  // Normalize topVisitors
  const topVisitors = ((data.topVisitors || []) as Record<string, unknown>[]).map(d => ({
    user_pseudo_id: String(d.user_pseudo_id || ''),
    total_sessions: toNumber(d.total_sessions),
    visitor_tenure_days: toNumber(d.visitor_tenure_days),
    total_page_views: toNumber(d.total_page_views),
    avg_session_duration_sec: toNumber(d.avg_session_duration_sec),
    engagement_rate: toNumber(d.engagement_rate),
    primary_device: String(d.primary_device || ''),
    primary_country: String(d.primary_country || ''),
    primary_traffic_source: String(d.primary_traffic_source || ''),
    projects_viewed: toNumber(d.projects_viewed),
    cta_clicks: toNumber(d.cta_clicks),
    form_submissions: toNumber(d.form_submissions),
    social_clicks: toNumber(d.social_clicks),
    resume_downloads: toNumber(d.resume_downloads),
    visitor_value_score: toNumber(d.visitor_value_score),
    visitor_segment: String(d.visitor_segment || ''),
    interest_profile: String(d.interest_profile || ''),
  }));

  // Normalize techDemand
  const techDemand = ((data.techDemand || []) as Record<string, unknown>[]).map(d => ({
    skill_name: String(d.skill_name || ''),
    total_interactions: toNumber(d.total_interactions),
    total_unique_users: toNumber(d.total_unique_users),
    demand_rank: toNumber(d.demand_rank),
    demand_percentile: toNumber(d.demand_percentile),
    demand_tier: String(d.demand_tier || ''),
    learning_priority: String(d.learning_priority || ''),
  }));

  // Normalize domainRankings
  const domainRankings = ((data.domainRankings || []) as Record<string, unknown>[]).map(d => ({
    domain: String(d.domain || ''),
    total_explicit_interest: toNumber(d.total_explicit_interest),
    total_implicit_interest: toNumber(d.total_implicit_interest),
    total_interactions: toNumber(d.total_interactions),
    total_unique_users: toNumber(d.total_unique_users),
    total_interest_score: toNumber(d.total_interest_score),
    interest_rank: toNumber(d.interest_rank),
    interest_percentile: toNumber(d.interest_percentile),
    demand_tier: String(d.demand_tier || ''),
    portfolio_recommendation: String(d.portfolio_recommendation || ''),
  }));

  // Normalize experienceRankings
  const experienceRankings = ((data.experienceRankings || []) as Record<string, unknown>[]).map(d => ({
    experience_id: String(d.experience_id || ''),
    experience_title: String(d.experience_title || ''),
    company: String(d.company || ''),
    total_interactions: toNumber(d.total_interactions),
    total_unique_users: toNumber(d.total_unique_users),
    total_sessions: toNumber(d.total_sessions),
    interest_rank: toNumber(d.interest_rank),
    interest_percentile: toNumber(d.interest_percentile),
    role_attractiveness: String(d.role_attractiveness || ''),
    positioning_suggestion: String(d.positioning_suggestion || ''),
  }));

  // Normalize temporal
  const temporal = (data.temporal || {}) as Record<string, unknown>;
  const hourlyDistribution = ((temporal.hourlyDistribution || []) as Record<string, unknown>[]).map(d => ({
    hour: toNumber(d.hour),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
    avg_engagement: toNumber(d.avg_engagement),
    engagement_rate: toNumber(d.engagement_rate),
  }));
  const dayOfWeekDistribution = ((temporal.dayOfWeekDistribution || []) as Record<string, unknown>[]).map(d => ({
    day_name: String(d.day_name || ''),
    day_number: toNumber(d.day_number),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
    avg_engagement: toNumber(d.avg_engagement),
    engagement_rate: toNumber(d.engagement_rate),
  }));

  // Normalize devices
  const devices = (data.devices || {}) as Record<string, unknown>;
  const categories = ((devices.categories || []) as Record<string, unknown>[]).map(d => ({
    device_category: String(d.device_category || ''),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
    engagement_rate: toNumber(d.engagement_rate),
    avg_duration: toNumber(d.avg_duration),
  }));
  const browsers = ((devices.browsers || []) as Record<string, unknown>[]).map(d => ({
    browser: String(d.browser || ''),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
  }));
  const operatingSystems = ((devices.operatingSystems || []) as Record<string, unknown>[]).map(d => ({
    operating_system: String(d.operating_system || ''),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
  }));

  // Normalize geographic
  const geographic = ((data.geographic || []) as Record<string, unknown>[]).map(d => ({
    country: String(d.country || ''),
    city: String(d.city || ''),
    sessions: toNumber(d.sessions),
    unique_visitors: toNumber(d.unique_visitors),
    engagement_rate: toNumber(d.engagement_rate),
  }));

  // Normalize dateRange
  const dateRange = (data.dateRange || {}) as Record<string, unknown>;

  return {
    overview,
    dailyMetrics,
    trafficSources,
    conversionSummary,
    projectRankings,
    sectionRankings,
    visitorSegments,
    topVisitors,
    techDemand,
    domainRankings,
    experienceRankings,
    recommendationPerformance: (data.recommendationPerformance || []) as Record<string, unknown>[],
    temporal: { hourlyDistribution, dayOfWeekDistribution },
    devices: { categories, browsers, operatingSystems },
    geographic,
    dateRange: {
      start: String(dateRange.start || ''),
      end: String(dateRange.end || ''),
    },
  };
}

// ==================== CACHE ====================

let gistCache: GistData | null = null;
let gistFetchPromise: Promise<GistData> | null = null;

async function fetchGistData(): Promise<GistData | null> {
  if (gistCache) return gistCache;
  if (gistFetchPromise) return gistFetchPromise;

  gistFetchPromise = fetch(DASHBOARD_GIST_URL)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch Gist');
      return response.json();
    })
    .then((rawData: GistData) => {
      // Check if it's the new format with metadata
      if (rawData.metadata && rawData.last_7_days) {
        gistCache = rawData;
        return rawData;
      }
      // Old format - not supported
      console.warn('Gist data is in old format, will use backend API');
      return null;
    })
    .catch(err => {
      console.error('Failed to fetch Gist:', err);
      return null;
    })
    .finally(() => {
      gistFetchPromise = null;
    });

  return gistFetchPromise;
}

async function fetchFromBackend(startDate: string, endDate: string): Promise<DashboardData | null> {
  try {
    const url = `${BACKEND_API_URL}/api/dashboard3?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Backend API error');
    const rawData = await response.json();
    return normalizeDashboardData(rawData);
  } catch (err) {
    console.error('Failed to fetch from backend:', err);
    return null;
  }
}

// ==================== MAIN FETCH FUNCTION ====================

export async function fetchDashboardData(
  preset: DateRangePreset,
  customStartDate?: string,
  customEndDate?: string
): Promise<{ data: DashboardData | null; source: 'gist' | 'backend' | 'error' }> {

  // For preset ranges, try Gist first
  if (preset !== 'custom') {
    const gistData = await fetchGistData();
    if (gistData && gistData[preset]) {
      return {
        data: normalizeDashboardData(gistData[preset] as unknown as Record<string, unknown>),
        source: 'gist',
      };
    }
  }

  // For custom range or if Gist failed, use backend
  if (preset === 'custom' && customStartDate && customEndDate) {
    const data = await fetchFromBackend(customStartDate, customEndDate);
    return { data, source: data ? 'backend' : 'error' };
  }

  // Fallback: calculate dates for preset and use backend
  const { startDate, endDate } = getPresetDates(preset);
  const data = await fetchFromBackend(startDate, endDate);
  return { data, source: data ? 'backend' : 'error' };
}

// ==================== DATE HELPERS ====================

function getPresetDates(preset: DateRangePreset): { startDate: string; endDate: string } {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'yesterday': {
      return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
    }
    case 'last_7_days': {
      const start = new Date(yesterday);
      start.setDate(start.getDate() - 6);
      return { startDate: formatDate(start), endDate: formatDate(yesterday) };
    }
    case 'last_14_days': {
      const start = new Date(yesterday);
      start.setDate(start.getDate() - 13);
      return { startDate: formatDate(start), endDate: formatDate(yesterday) };
    }
    case 'last_30_days': {
      const start = new Date(yesterday);
      start.setDate(start.getDate() - 29);
      return { startDate: formatDate(start), endDate: formatDate(yesterday) };
    }
    case 'all_time':
    default: {
      // Will be handled by backend or Gist
      return { startDate: '2020-01-01', endDate: formatDate(yesterday) };
    }
  }
}

export function getPresetLabel(preset: DateRangePreset): string {
  switch (preset) {
    case 'yesterday': return 'Yesterday';
    case 'last_7_days': return 'Last 7 Days';
    case 'last_14_days': return 'Last 14 Days';
    case 'last_30_days': return 'Last 30 Days';
    case 'all_time': return 'All Time';
    case 'custom': return 'Custom Range';
    default: return 'Last 7 Days';
  }
}

// ==================== HOOK ====================

type UseDashboardDataOptions = {
  preset?: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
};

type DashboardDataHook = {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  source: 'gist' | 'backend' | 'error' | null;
  metadata: { dataStartDate: string; dataEndDate: string; updatedAt: string } | null;
  refetch: () => void;
  setDateRange: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;
  currentPreset: DateRangePreset;
  customStartDate: string | null;
  customEndDate: string | null;
};

export function useDashboardData(options: UseDashboardDataOptions = {}): DashboardDataHook {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'gist' | 'backend' | 'error' | null>(null);
  const [metadata, setMetadata] = useState<{ dataStartDate: string; dataEndDate: string; updatedAt: string } | null>(null);

  const [currentPreset, setCurrentPreset] = useState<DateRangePreset>(options.preset || 'last_7_days');
  const [customStartDate, setCustomStartDate] = useState<string | null>(options.customStartDate || null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(options.customEndDate || null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to get metadata from Gist
      const gistData = await fetchGistData();
      if (gistData?.metadata) {
        setMetadata({
          dataStartDate: gistData.metadata.data_start_date,
          dataEndDate: gistData.metadata.data_end_date,
          updatedAt: gistData.metadata.updated_at,
        });
      }

      // Fetch data based on preset
      const result = await fetchDashboardData(currentPreset, customStartDate || undefined, customEndDate || undefined);

      if (result.data) {
        setData(result.data);
        setSource(result.source);
      } else {
        setError(new Error('Failed to load dashboard data'));
        setSource('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setSource('error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPreset, customStartDate, customEndDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setDateRange = useCallback((preset: DateRangePreset, customStart?: string, customEnd?: string) => {
    setCurrentPreset(preset);
    if (preset === 'custom' && customStart && customEnd) {
      setCustomStartDate(customStart);
      setCustomEndDate(customEnd);
    } else {
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    source,
    metadata,
    refetch: loadData,
    setDateRange,
    currentPreset,
    customStartDate,
    customEndDate,
  };
}

// ==================== HELPER FUNCTIONS ====================

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(num: number): string {
  return num.toFixed(1) + '%';
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getHealthColor(tier: string): string {
  switch (tier) {
    case 'excellent': return '#10B981';
    case 'good': return '#7B42F6';
    case 'needs_attention': return '#F59E0B';
    case 'critical': return '#EF4444';
    default: return '#6B7280';
  }
}

export function getDemandColor(tier: string): string {
  switch (tier) {
    case 'high_demand': return '#F97316';
    case 'moderate_demand': return '#10B981';
    case 'emerging': return '#3B82F6';
    case 'niche': return '#8B5CF6';
    default: return '#6B7280';
  }
}

export function getDemandLabel(tier: string): string {
  switch (tier) {
    case 'high_demand': return 'Hot';
    case 'moderate_demand': return 'Trending';
    case 'emerging': return 'Rising';
    case 'niche': return 'Niche';
    default: return '';
  }
}

// ==================== API WARM-UP ====================

export function warmUpBackendAPI(): void {
  // Fire and forget - warm up the backend API
  fetch(`${BACKEND_API_URL}/health`)
    .then(() => console.log('Backend API warmed up'))
    .catch(() => console.log('Backend API warm-up failed (may be cold starting)'));
}
