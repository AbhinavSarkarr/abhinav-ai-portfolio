import { useState, useEffect } from 'react';

// ==================== TYPE DEFINITIONS ====================

export type DailyMetric = {
  date: string;
  visitors: number;
  sessions: number;
  engagement_rate: number;
  bounce_rate: number;
  avg_session_duration_sec: number;
  desktop: number;
  mobile: number;
  tablet: number;
};

export type TrafficSource = {
  source: string;
  medium: string;
  sessions: number;
  engagement_rate: number;
};

export type CountryData = {
  country: string;
  visitors: number;
};

export type VisitorSegments = {
  converters: number;
  high_intent: number;
  engaged_explorers: number;
  returning_visitors: number;
  casual_browsers: number;
};

export type ConversionFunnel = {
  cta_views: number;
  cta_clicks: number;
  form_starts: number;
  form_submissions: number;
  resume_downloads: number;
  social_clicks: number;
};

export type RecommendationData = {
  system_health: 'excellent' | 'good' | 'needs_improvement' | 'underperforming';
  overall_ctr: number;
  position_1_ctr: number;
  position_2_ctr: number;
  position_3_ctr: number;
  user_conversion_rate: number;
  total_impressions: number;
  total_clicks: number;
};

export type DomainRanking = {
  domain: string;
  interest_rank: number;
  total_interest_score: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'niche_interest';
  portfolio_recommendation: string;
};

export type ExperienceRanking = {
  role_title: string;
  company_name: string;
  interest_rank: number;
  interest_score: number;
};

export type SkillRanking = {
  skill_name: string;
  skill_category: string;
  clicks: number;
  demand_rank: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'emerging' | 'niche';
  learning_priority: string;
};

export type ProjectRanking = {
  project_id: string;
  project_title: string;
  overall_rank: number;
  total_views: number;
  total_clicks: number;
  engagement_score: number;
  recommended_position: string;
};

export type SectionRanking = {
  section_id: string;
  health_score: number;
  engagement_rank: number;
  health_tier: 'excellent' | 'good' | 'needs_attention' | 'critical';
  optimization_hint: string;
  total_views: number;
  avg_engagement_rate: number;
  avg_exit_rate: number;
};

export type ClientRanking = {
  client_id: string;
  client_name: string;
  experience_id: string;
  domain: string;
  engagement_rank: number;
  total_views: number;
  total_clicks: number;
};

export type OverviewMetrics = {
  total_visitors_7d: number;
  total_sessions_7d: number;
  engagement_rate: number;
  bounce_rate: number;
  total_conversions: number;
  resume_downloads: number;
  avg_session_duration_sec: number;
};

export type DashboardData = {
  overview: OverviewMetrics;
  dailyMetrics: DailyMetric[];
  trafficSources: TrafficSource[];
  topCountries: CountryData[];
  visitorSegments: VisitorSegments;
  conversionFunnel: ConversionFunnel;
  recommendations: RecommendationData;
  domains: DomainRanking[];
  experiences: ExperienceRanking[];
  skills: SkillRanking[];
  projects: ProjectRanking[];
  sections: SectionRanking[];
  clients: ClientRanking[];
  updated_at: string;
};

// ==================== SAMPLE DATA ====================
// This will be replaced with real Gist data once the export is set up

const SAMPLE_DATA: DashboardData = {
  overview: {
    total_visitors_7d: 65,
    total_sessions_7d: 92,
    engagement_rate: 52.3,
    bounce_rate: 14.2,
    total_conversions: 3,
    resume_downloads: 12,
    avg_session_duration_sec: 99,
  },
  dailyMetrics: [
    { date: '2026-01-04', visitors: 8, sessions: 12, engagement_rate: 45.0, bounce_rate: 18.0, avg_session_duration_sec: 85, desktop: 5, mobile: 3, tablet: 0 },
    { date: '2026-01-05', visitors: 12, sessions: 15, engagement_rate: 48.5, bounce_rate: 15.2, avg_session_duration_sec: 92, desktop: 7, mobile: 5, tablet: 0 },
    { date: '2026-01-06', visitors: 15, sessions: 18, engagement_rate: 52.0, bounce_rate: 12.0, avg_session_duration_sec: 105, desktop: 9, mobile: 6, tablet: 0 },
    { date: '2026-01-07', visitors: 55, sessions: 68, engagement_rate: 58.2, bounce_rate: 10.5, avg_session_duration_sec: 120, desktop: 30, mobile: 25, tablet: 0 },
    { date: '2026-01-08', visitors: 18, sessions: 22, engagement_rate: 50.0, bounce_rate: 14.0, avg_session_duration_sec: 95, desktop: 10, mobile: 8, tablet: 0 },
    { date: '2026-01-09', visitors: 14, sessions: 17, engagement_rate: 48.0, bounce_rate: 16.0, avg_session_duration_sec: 88, desktop: 8, mobile: 6, tablet: 0 },
    { date: '2026-01-10', visitors: 10, sessions: 12, engagement_rate: 46.0, bounce_rate: 18.0, avg_session_duration_sec: 82, desktop: 6, mobile: 4, tablet: 0 },
  ],
  trafficSources: [
    { source: 'direct', medium: 'none', sessions: 65, engagement_rate: 48.5 },
    { source: 'linkedin.com', medium: 'referral', sessions: 12, engagement_rate: 72.1 },
    { source: 'google', medium: 'organic', sessions: 8, engagement_rate: 55.2 },
    { source: 'instagram', medium: 'social', sessions: 7, engagement_rate: 42.0 },
    { source: 'facebook.com', medium: 'referral', sessions: 5, engagement_rate: 38.5 },
  ],
  topCountries: [
    { country: 'United States', visitors: 30 },
    { country: 'India', visitors: 22 },
    { country: 'France', visitors: 8 },
    { country: 'Germany', visitors: 6 },
    { country: 'Ireland', visitors: 4 },
    { country: 'Canada', visitors: 3 },
  ],
  visitorSegments: {
    converters: 3,
    high_intent: 8,
    engaged_explorers: 15,
    returning_visitors: 12,
    casual_browsers: 27,
  },
  conversionFunnel: {
    cta_views: 150,
    cta_clicks: 45,
    form_starts: 12,
    form_submissions: 3,
    resume_downloads: 12,
    social_clicks: 25,
  },
  recommendations: {
    system_health: 'good',
    overall_ctr: 8.5,
    position_1_ctr: 12.3,
    position_2_ctr: 7.8,
    position_3_ctr: 5.2,
    user_conversion_rate: 15.2,
    total_impressions: 120,
    total_clicks: 10,
  },
  domains: [
    { domain: 'Healthcare', interest_rank: 1, total_interest_score: 45, demand_tier: 'high_demand', portfolio_recommendation: 'primary_strength' },
    { domain: 'Fintech', interest_rank: 2, total_interest_score: 38, demand_tier: 'high_demand', portfolio_recommendation: 'showcase_more' },
    { domain: 'E-commerce', interest_rank: 3, total_interest_score: 25, demand_tier: 'moderate_demand', portfolio_recommendation: 'showcase_more' },
    { domain: 'Trading', interest_rank: 4, total_interest_score: 18, demand_tier: 'niche_interest', portfolio_recommendation: 'consider_expanding' },
  ],
  experiences: [
    { role_title: 'Data Scientist', company_name: 'BioFi', interest_rank: 1, interest_score: 42 },
    { role_title: 'ML Engineer', company_name: 'RetailStack', interest_rank: 2, interest_score: 35 },
    { role_title: 'AI Consultant', company_name: 'In20', interest_rank: 3, interest_score: 28 },
  ],
  skills: [
    { skill_name: 'Python', skill_category: 'Languages', clicks: 45, demand_rank: 1, demand_tier: 'high_demand', learning_priority: 'maintain_expertise' },
    { skill_name: 'TensorFlow', skill_category: 'ML/AI', clicks: 38, demand_rank: 2, demand_tier: 'high_demand', learning_priority: 'maintain_expertise' },
    { skill_name: 'React', skill_category: 'Frontend', clicks: 32, demand_rank: 3, demand_tier: 'high_demand', learning_priority: 'maintain_expertise' },
    { skill_name: 'LangChain', skill_category: 'GenAI', clicks: 28, demand_rank: 4, demand_tier: 'moderate_demand', learning_priority: 'showcase_more' },
    { skill_name: 'PostgreSQL', skill_category: 'Databases', clicks: 22, demand_rank: 5, demand_tier: 'moderate_demand', learning_priority: 'maintain_expertise' },
    { skill_name: 'Docker', skill_category: 'DevOps', clicks: 18, demand_rank: 6, demand_tier: 'emerging', learning_priority: 'showcase_more' },
  ],
  projects: [
    { project_id: 'virtual-try-on', project_title: 'WhatsApp Virtual Try-On Bot', overall_rank: 1, total_views: 39, total_clicks: 15, engagement_score: 85.2, recommended_position: 'featured' },
    { project_id: 'visa-approval-prediction', project_title: 'H-1B Visa Approval Prediction', overall_rank: 2, total_views: 31, total_clicks: 12, engagement_score: 72.5, recommended_position: 'featured' },
    { project_id: 'autonomous-trading-system', project_title: 'Autonomous Trading System', overall_rank: 3, total_views: 18, total_clicks: 8, engagement_score: 58.3, recommended_position: 'primary' },
    { project_id: 'finetuned-llms', project_title: 'Fine-tuned LLMs', overall_rank: 4, total_views: 12, total_clicks: 5, engagement_score: 45.8, recommended_position: 'primary' },
  ],
  sections: [
    { section_id: 'hero', health_score: 95, engagement_rank: 1, health_tier: 'excellent', optimization_hint: 'performing_well', total_views: 65, avg_engagement_rate: 85, avg_exit_rate: 5 },
    { section_id: 'about', health_score: 82, engagement_rank: 2, health_tier: 'good', optimization_hint: 'performing_well', total_views: 58, avg_engagement_rate: 72, avg_exit_rate: 12 },
    { section_id: 'experience', health_score: 78, engagement_rank: 3, health_tier: 'good', optimization_hint: 'add_cta_or_navigation', total_views: 45, avg_engagement_rate: 65, avg_exit_rate: 18 },
    { section_id: 'projects', health_score: 72, engagement_rank: 4, health_tier: 'good', optimization_hint: 'hook_earlier', total_views: 52, avg_engagement_rate: 58, avg_exit_rate: 22 },
    { section_id: 'skills', health_score: 58, engagement_rank: 5, health_tier: 'needs_attention', optimization_hint: 'make_more_engaging', total_views: 38, avg_engagement_rate: 42, avg_exit_rate: 35 },
    { section_id: 'contact', health_score: 45, engagement_rank: 6, health_tier: 'needs_attention', optimization_hint: 'improve_content', total_views: 25, avg_engagement_rate: 35, avg_exit_rate: 55 },
  ],
  clients: [
    { client_id: 'biofi', client_name: 'BioFi', experience_id: 'exp1', domain: 'Healthcare', engagement_rank: 1, total_views: 28, total_clicks: 12 },
    { client_id: 'retailstack', client_name: 'RetailStack', experience_id: 'exp2', domain: 'E-commerce', engagement_rank: 2, total_views: 22, total_clicks: 8 },
    { client_id: 'hiremeup', client_name: 'HireMeUp', experience_id: 'exp1', domain: 'HR Tech', engagement_rank: 3, total_views: 15, total_clicks: 5 },
    { client_id: 'in20', client_name: 'In20', experience_id: 'exp1', domain: 'Fintech', engagement_rank: 4, total_views: 10, total_clicks: 3 },
  ],
  updated_at: new Date().toISOString(),
};

// ==================== GIST URL ====================
// Dashboard data Gist - updated daily by GitHub Actions
const DASHBOARD_GIST_URL = 'https://gist.githubusercontent.com/AbhinavSarkarr/dedbbf6ebcb32542e7b724b86f2b214f/raw/dashboard-analytics.json';

// Module-level cache
let cachedData: DashboardData | null = null;
let fetchPromise: Promise<DashboardData> | null = null;

async function fetchDashboardData(): Promise<DashboardData> {
  // Return cached data if available
  if (cachedData) return cachedData;

  // If fetch is in progress, wait for it
  if (fetchPromise) return fetchPromise;

  // If no Gist URL configured, use sample data
  if (!DASHBOARD_GIST_URL) {
    cachedData = SAMPLE_DATA;
    return SAMPLE_DATA;
  }

  // Start new fetch
  fetchPromise = fetch(DASHBOARD_GIST_URL)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    })
    .then(data => {
      cachedData = data;
      return data;
    })
    .catch(() => {
      // Fallback to sample data on error
      cachedData = SAMPLE_DATA;
      return SAMPLE_DATA;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

// ==================== HOOK ====================

type DashboardDataHook = {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  isUsingMockData: boolean;
};

export function useDashboardData(): DashboardDataHook {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
        // Still set sample data as fallback
        setData(SAMPLE_DATA);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return {
    data,
    isLoading,
    error,
    isUsingMockData: !DASHBOARD_GIST_URL,
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
    case 'excellent': return '#10B981'; // green
    case 'good': return '#7B42F6'; // purple
    case 'needs_attention': return '#F59E0B'; // amber
    case 'critical': return '#EF4444'; // red
    default: return '#6B7280'; // gray
  }
}

export function getDemandColor(tier: string): string {
  switch (tier) {
    case 'high_demand': return '#F97316'; // orange
    case 'moderate_demand': return '#10B981'; // green
    case 'emerging': return '#3B82F6'; // blue
    case 'niche': return '#8B5CF6'; // purple
    default: return '#6B7280'; // gray
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
