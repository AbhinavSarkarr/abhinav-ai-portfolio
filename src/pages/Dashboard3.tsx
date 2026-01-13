import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  DashboardSection,
  GlassCard,
  TrafficTrendChart,
  TrafficSourceAnalysis,
  VisitorSegmentChart,
  ConversionFunnel as ConversionFunnelViz,
  SkillDemandChart,
  ProjectScatterPlot,
  SectionRadarChart,
  DomainInterestChart,
  ExperienceInterestChart,
  RecommendationHealth,
} from '@/components/dashboard';
import { HealthScoreGauge } from '@/components/dashboard3/HealthScoreGauge';
import { AlertBanner, type Alert } from '@/components/dashboard3/AlertBanner';
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Gauge,
  Globe,
  Users,
  Activity,
  FileText,
  Layers,
  Code,
  Briefcase,
  Target,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import type { Dashboard3Data } from '@/types/dashboard3';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Date range presets
const DATE_PRESETS = [
  { label: 'Today', days: 1 },
  { label: 'Yesterday', days: 1, offset: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

// Helper to format API dates
function formatApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Advanced Date Range Picker Component
function AdvancedDateRangePicker({
  startDate,
  endDate,
  onRangeChange,
}: {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = useMemo(() => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      return format(startDate, 'MMM d, yyyy');
    }

    const preset = DATE_PRESETS.find((p) => p.days === daysDiff + 1);
    if (preset) return preset.label;

    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }, [startDate, endDate]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-xs sm:text-sm border-tech-accent/20 hover:border-tech-accent/40"
      >
        <Calendar size={14} />
        <span className="hidden sm:inline">{currentLabel}</span>
        <span className="sm:hidden">
          {format(startDate, 'M/d')} - {format(endDate, 'M/d')}
        </span>
        <ChevronDown size={14} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-background/95 backdrop-blur-xl border border-tech-accent/20 rounded-lg shadow-lg p-2 min-w-[180px]">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const end = preset.offset
                    ? subDays(new Date(), preset.offset)
                    : subDays(new Date(), preset.label === 'Today' ? 0 : 1);
                  const start = preset.label === 'Today' || preset.label === 'Yesterday'
                    ? end
                    : subDays(end, preset.days - 1);
                  onRangeChange(startOfDay(start), endOfDay(end));
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-tech-accent/10 transition-colors border border-transparent hover:border-tech-accent/20"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  format: formatValue = (v) => v.toString(),
}: {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  format?: (value: number) => string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      className="glass-card p-4 sm:p-6 hover-lift"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tech-neon/20 to-tech-accent/20 flex items-center justify-center">
          <Icon size={20} className="text-tech-neon" />
        </div>
        {change !== undefined && TrendIcon && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={16} />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent mb-1">
        {formatValue(value)}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
    </motion.div>
  );
}

// Helper function to calculate overall health score
function calculateHealthScore(data: Dashboard3Data): number {
  if (!data) return 0;

  // Weight different metrics to calculate health score
  const engagementScore = Math.min(100, data.overview.engagementRate * 1.5); // 60%+ engagement = 90+ score
  const bounceScore = Math.max(0, 100 - data.overview.bounceRate * 1.5); // Lower bounce = higher score
  const conversionScore = Math.min(100, data.overview.totalConversions * 10); // Each conversion adds 10 points

  // Visitor growth (positive trend adds bonus)
  const growthScore = data.overview.visitorsTrend.trend === 'up' ? 80 : data.overview.visitorsTrend.trend === 'stable' ? 60 : 40;

  // Weighted average
  const healthScore = (engagementScore * 0.4 + bounceScore * 0.3 + conversionScore * 0.2 + growthScore * 0.1);

  return Math.round(Math.max(0, Math.min(100, healthScore)));
}

// Helper function to generate alerts
function generateAlerts(data: Dashboard3Data): Alert[] {
  if (!data) return [];

  const alerts: Alert[] = [];

  // High bounce rate alert
  if (data.overview.bounceRate > 70) {
    alerts.push({
      type: 'warning',
      title: 'High Bounce Rate Detected',
      message: 'Your bounce rate is above 70%. Consider improving landing page content or page load speed.',
      metric: `Bounce Rate: ${data.overview.bounceRate.toFixed(1)}%`,
    });
  }

  // Low engagement alert
  if (data.overview.engagementRate < 30) {
    alerts.push({
      type: 'warning',
      title: 'Low Engagement Rate',
      message: 'Engagement rate is below 30%. Users may not be interacting with your content effectively.',
      metric: `Engagement: ${data.overview.engagementRate.toFixed(1)}%`,
    });
  }

  // Positive conversion trend
  if (data.overview.conversionTrend.trend === 'up' && data.overview.conversionTrend.change > 20) {
    alerts.push({
      type: 'success',
      title: 'Conversions Surging!',
      message: 'Your conversion rate has increased significantly compared to the previous period.',
      change: data.overview.conversionTrend.change,
    });
  }

  // Negative visitor trend
  if (data.overview.visitorsTrend.trend === 'down' && data.overview.visitorsTrend.change > 20) {
    alerts.push({
      type: 'critical',
      title: 'Visitor Drop Detected',
      message: 'Unique visitors have decreased significantly. Review traffic sources and recent changes.',
      change: -data.overview.visitorsTrend.change,
    });
  }

  // Positive engagement trend
  if (data.overview.engagementTrend.trend === 'up' && data.overview.engagementTrend.change > 15) {
    alerts.push({
      type: 'success',
      title: 'Engagement Improving',
      message: 'User engagement is trending upward. Keep up the good work!',
      change: data.overview.engagementTrend.change,
    });
  }

  return alerts;
}

// Main Dashboard3 Component
export default function Dashboard3() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Dashboard3Data | null>(null);

  // Date range state - default to last 7 days
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(() => subDays(new Date(), 1));

  // Fetch all data from API
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    const startStr = formatApiDate(startDate);
    const endStr = formatApiDate(endDate);

    // Helper to fetch with error handling
    const fetchApi = async (endpoint: string, hasDateParams = true) => {
      const url = hasDateParams
        ? `${API_BASE}${endpoint}?start_date=${startStr}&end_date=${endStr}`
        : `${API_BASE}${endpoint}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${endpoint}`);
      return response.json();
    };

    try {
      // Fetch all data in parallel for performance
      const [
        sessionsData,
        dailyMetricsData,
        trafficData,
        conversionData,
        projectRankingsData,
        sectionRankingsData,
        visitorInsightsData,
        techDemandData,
        domainRankingsData,
        experienceRankingsData,
        recommendationData,
        temporalData,
        deviceData,
        geographicData,
      ] = await Promise.all([
        fetchApi('/api/sessions'),
        fetchApi('/api/daily-metrics'),
        fetchApi('/api/traffic-daily-stats'),
        fetchApi('/api/conversion-funnel'),
        fetchApi('/api/project-rankings', false),
        fetchApi('/api/section-rankings', false),
        fetchApi('/api/visitor-insights', false),
        fetchApi('/api/tech-demand-insights', false),
        fetchApi('/api/domain-rankings', false),
        fetchApi('/api/experience-rankings', false),
        fetchApi('/api/recommendation-performance', false),
        fetchApi('/api/temporal-patterns'),
        fetchApi('/api/device-analytics'),
        fetchApi('/api/geographic-details'),
      ]);

      // Calculate previous period for comparison
      const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const prevEndDate = subDays(startDate, 1);
      const prevStartDate = subDays(prevEndDate, periodLength - 1);

      // Fetch previous period for trend comparison
      const prevStartStr = formatApiDate(prevStartDate);
      const prevEndStr = formatApiDate(prevEndDate);

      let prevSessionsData = null;
      let prevConversionData = null;
      try {
        const [prevSessions, prevConversions] = await Promise.all([
          fetch(`${API_BASE}/api/sessions?start_date=${prevStartStr}&end_date=${prevEndStr}`).then(r => r.json()),
          fetch(`${API_BASE}/api/conversion-funnel?start_date=${prevStartStr}&end_date=${prevEndStr}`).then(r => r.json()),
        ]);
        prevSessionsData = prevSessions;
        prevConversionData = prevConversions;
      } catch {
        // Previous period data not available, use current for comparison
      }

      // Calculate trends
      const calculateTrend = (current: number, previous: number): { change: number; trend: 'up' | 'down' | 'stable' } => {
        if (!previous || previous === 0) return { change: 0, trend: 'stable' };
        const change = Math.round(((current - previous) / previous) * 100);
        return {
          change: Math.abs(change),
          trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
        };
      };

      // Extract overview data from sessions API
      const overview = sessionsData.overview || {};
      const prevOverview = prevSessionsData?.overview || {};

      // Transform daily metrics
      const dailyMetrics = (dailyMetricsData.data || []).map((d: Record<string, unknown>) => ({
        session_date: d.date as string,
        total_sessions: d.sessions as number || 0,
        unique_visitors: d.visitors as number || 0,
        engagement_rate: d.engagement_rate as number || 0,
        bounce_rate: d.bounce_rate as number || 0,
        avg_session_duration_sec: d.avg_session_duration_sec as number || 0,
        desktop_sessions: d.desktop_sessions as number || 0,
        mobile_sessions: d.mobile_sessions as number || 0,
        tablet_sessions: d.tablet_sessions as number || 0,
      }));

      // Transform traffic sources
      const trafficSources = (trafficData.trafficSources || []).map((t: Record<string, unknown>) => ({
        traffic_source: t.traffic_source as string || 'Direct',
        traffic_medium: t.traffic_medium as string || 'none',
        sessions: t.total_sessions as number || 0,
        engagement_rate: t.avg_engagement_rate as number || 0,
      }));

      // Transform visitor insights to segments
      const segmentTotals = visitorInsightsData.segmentTotals || {};
      const visitorSegments = {
        converters: segmentTotals['converter'] || 0,
        high_intent: segmentTotals['high_intent'] || 0,
        engaged_explorers: segmentTotals['engaged_explorer'] || 0,
        returning: segmentTotals['returning'] || 0,
        casual_browsers: segmentTotals['casual_browser'] || 0,
      };

      // Transform project rankings
      const projectRankings = (projectRankingsData.rankings || []).map((p: Record<string, unknown>) => ({
        project_id: p.project_id as string,
        project_title: p.project_title as string,
        project_category: p.project_category as string,
        total_views: p.total_views as number || 0,
        total_clicks: p.total_clicks as number || 0,
        engagement_score: p.engagement_score as number || 0,
        overall_rank: p.overall_rank as number,
        performance_tier: p.performance_tier as string || 'average',
        recommended_position: p.recommended_position as number || 0,
      }));

      // Transform section rankings
      const sectionRankings = (sectionRankingsData.rankings || []).map((s: Record<string, unknown>) => ({
        section_id: s.section_id as string,
        total_views: s.total_views as number || 0,
        health_score: s.health_score as number || 0,
        health_tier: s.health_tier as string || 'average',
        engagement_rank: s.engagement_rank as number,
        optimization_hint: s.optimization_hint as string || '',
        avg_engagement_rate: 0,
        avg_exit_rate: 0,
      }));

      // Transform skill rankings from tech demand insights
      const skillRankings = (techDemandData.insights || []).map((s: Record<string, unknown>) => ({
        skill_name: s.skill_name as string,
        skill_category: s.skill_category as string,
        total_clicks: s.total_interest_signals as number || 0,
        overall_rank: s.demand_rank as number,
        demand_tier: s.demand_tier as string || 'moderate',
        recommendation: s.learning_priority as string || '',
      }));

      // Transform domain rankings
      const domainRankings = (domainRankingsData.rankings || []).map((d: Record<string, unknown>) => ({
        domain: d.domain as string,
        total_interest_score: d.total_interest_score as number || 0,
        interest_rank: d.interest_rank as number,
        demand_tier: d.demand_tier as string || 'moderate',
        portfolio_recommendation: d.portfolio_recommendation as string || '',
      }));

      // Transform experience rankings
      const experienceRankings = (experienceRankingsData.rankings || []).map((e: Record<string, unknown>) => ({
        experience_title: e.experience_id as string,
        company: '',
        total_interactions: e.total_interactions as number || 0,
        interest_rank: 0,
      }));

      // Transform conversion funnel
      const conversionSummary = conversionData.summary || {};
      const totalConversions = (conversionSummary.form_submissions || 0) +
                              (conversionSummary.resume_downloads || 0) +
                              (conversionSummary.social_clicks || 0);

      const conversionFunnel = [{
        total_cta_views: conversionSummary.cta_views || 0,
        total_cta_clicks: conversionSummary.cta_clicks || 0,
        contact_form_starts: conversionSummary.form_starts || 0,
        contact_form_submissions: conversionSummary.form_submissions || 0,
        resume_downloads: conversionSummary.resume_downloads || 0,
        social_clicks: conversionSummary.social_clicks || 0,
      }];

      // Calculate previous period totals for conversion trend
      const prevConversionSummary = prevConversionData?.summary || {};
      const prevTotalConversions = (prevConversionSummary.form_submissions || 0) +
                                   (prevConversionSummary.resume_downloads || 0) +
                                   (prevConversionSummary.social_clicks || 0);

      // Transform recommendation performance
      const recPerf = recommendationData.performance?.[0] || {};
      const recommendationPerformance = {
        total_impressions: recPerf.total_impressions || 0,
        total_clicks: recPerf.total_clicks || 0,
        overall_ctr: recPerf.overall_ctr || 0,
        total_users_shown: recPerf.total_users_shown || 0,
        total_users_clicked: recPerf.total_users_clicked || 0,
        user_conversion_rate: recPerf.user_conversion_rate || 0,
        position_1_ctr: recPerf.position_1_ctr || 0,
        position_2_ctr: recPerf.position_2_ctr || 0,
        position_3_ctr: recPerf.position_3_ctr || 0,
        best_position_insight: recPerf.best_position_insight || '',
        top_performing_recommendations: [],
        top_recommendation_drivers: [],
        system_health: (recPerf.overall_ctr || 0) >= 10 ? 'excellent' :
                       (recPerf.overall_ctr || 0) >= 5 ? 'good' :
                       (recPerf.overall_ctr || 0) >= 2 ? 'fair' : 'poor' as const,
      };

      // Extract device data from device analytics API
      const deviceCategories = (deviceData.deviceCategories || []).map((d: Record<string, unknown>) => ({
        device: d.device_category as string,
        sessions: d.sessions as number || 0,
        engagement_rate: d.engagement_rate as number || 0,
      }));

      const browsers = (deviceData.browsers || []).map((b: Record<string, unknown>) => ({
        browser: b.browser as string,
        sessions: b.sessions as number || 0,
      }));

      const operatingSystems = (deviceData.operatingSystems || []).map((os: Record<string, unknown>) => ({
        os: os.operating_system as string,
        sessions: os.sessions as number || 0,
      }));

      // Extract temporal data
      const hourlyDistribution = (temporalData.hourlyDistribution || []).map((h: Record<string, unknown>) => ({
        hour: h.hour as number,
        sessions: h.sessions as number || 0,
        engagement_rate: h.avg_engagement as number || 0,
      }));

      const dayOfWeekDistribution = (temporalData.dayOfWeekDistribution || []).map((d: Record<string, unknown>) => ({
        day: d.day_name as string,
        sessions: d.sessions as number || 0,
        engagement_rate: d.engagement_rate as number || 0,
      }));

      // Extract geographic data from dedicated endpoint
      const topCountries = geographicData.countries || sessionsData.topCountries || [];

      // Build final Dashboard3Data object
      const dashboardData: Dashboard3Data = {
        dateRange: { start: startDate, end: endDate },
        overview: {
          totalSessions: overview.total_sessions || 0,
          uniqueVisitors: overview.unique_visitors || 0,
          engagementRate: overview.engagement_rate || 0,
          bounceRate: overview.bounce_rate || 0,
          avgSessionDuration: overview.avg_session_duration || 0,
          totalConversions,
          resumeDownloads: conversionSummary.resume_downloads || 0,
          socialClicks: conversionSummary.social_clicks || 0,
          sessionsTrend: {
            current: { start: startDate, end: endDate },
            previous: { start: prevStartDate, end: prevEndDate },
            ...calculateTrend(overview.total_sessions || 0, prevOverview.total_sessions || 0),
          },
          visitorsTrend: {
            current: { start: startDate, end: endDate },
            previous: { start: prevStartDate, end: prevEndDate },
            ...calculateTrend(overview.unique_visitors || 0, prevOverview.unique_visitors || 0),
          },
          engagementTrend: {
            current: { start: startDate, end: endDate },
            previous: { start: prevStartDate, end: prevEndDate },
            ...calculateTrend(overview.engagement_rate || 0, prevOverview.engagement_rate || 0),
          },
          conversionTrend: {
            current: { start: startDate, end: endDate },
            previous: { start: prevStartDate, end: prevEndDate },
            ...calculateTrend(totalConversions, prevTotalConversions),
          },
        },
        dailyMetrics,
        trafficSources,
        geographic: {
          countries: topCountries.map((c: Record<string, unknown>) => ({
            country: c.country as string,
            visitors: c.unique_visitors as number || c.visitors as number || 0,
            sessions: c.sessions as number || 0,
            engagement_rate: c.engagement_rate as number || 0,
          })),
          continents: [],
          cities: (geographicData.cities || []).map((city: Record<string, unknown>) => ({
            city: city.city as string,
            country: city.country as string || '',
            visitors: city.unique_visitors as number || 0,
          })),
          regions: [],
        },
        visitorInsights: (visitorInsightsData.insights || []).map((v: Record<string, unknown>) => ({
          user_pseudo_id: v.interest_profile as string || 'visitor',
          visitor_segment: v.visitor_segment as string || 'casual_browser',
          total_sessions: v.avg_sessions as number || 0,
          engagement_rate: 0,
          visitor_value_score: v.visitor_count as number || 0,
        })),
        visitorSegments,
        mlPredictions: {
          highValueVisitors: segmentTotals['converter'] || 0,
          likelyRecruiters: segmentTotals['high_intent'] || 0,
          deepExplorers: segmentTotals['engaged_explorer'] || 0,
        },
        projectRankings,
        projectDailyStats: [],
        sectionRankings,
        sectionDailyStats: [],
        sectionFlow: { flows: [], entryPoints: [], exitPoints: [] },
        skillRankings,
        techDemandInsights: [],
        domainRankings,
        experienceRankings,
        conversionFunnel,
        conversionEvents: [],
        recommendationPerformance,
        temporal: {
          hourlyDistribution,
          dayOfWeekDistribution,
          visitFrequency: [],
        },
        devices: {
          categories: deviceCategories,
          browsers,
          operatingSystems,
          connectionTypes: [],
          colorSchemes: [],
        },
        lastUpdated: new Date().toISOString(),
      };

      setData(dashboardData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please check if the API server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and when date range changes
  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RefreshCw size={32} className="text-tech-neon animate-spin" />
          <p className="text-muted-foreground">Loading comprehensive analytics...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-foreground text-lg mb-2">Failed to load dashboard data</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchDashboardData} className="gap-2">
              <RefreshCw size={16} />
              Retry
            </Button>
            <Link to="/">
              <Button variant="outline">Back to Portfolio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-tech-neon/10 dark:bg-tech-neon/5 rounded-full blur-[120px]"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-32 w-96 h-96 bg-tech-accent/10 dark:bg-tech-accent/5 rounded-full blur-[120px]"
          animate={{
            x: [0, -60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-2/3 left-1/3 w-64 h-64 bg-tech-highlight/10 dark:bg-tech-highlight/5 rounded-full blur-[100px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-black/5 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-none"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <motion.div whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-tech-accent hover:bg-tech-accent/10 border border-transparent hover:border-tech-accent/20"
                >
                  <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Portfolio</span>
                </Button>
              </motion.div>
            </Link>

            <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center shadow-lg shadow-tech-neon/20 flex-shrink-0">
                <BarChart3 size={16} className="text-white sm:hidden" />
                <BarChart3 size={20} className="text-white hidden sm:block" />
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent">
                Comprehensive Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AdvancedDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleDateRangeChange}
            />
            <Button variant="ghost" size="sm" onClick={fetchDashboardData} className="gap-1.5">
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 md:pt-24 relative z-10">
        {/* Section 1: Executive Command Center */}
        <DashboardSection id="executive" title="Executive Command Center" icon={Gauge}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <KPICard
              title="Total Sessions"
              value={data.overview.totalSessions}
              change={data.overview.sessionsTrend.change}
              trend={data.overview.sessionsTrend.trend}
              icon={Activity}
            />
            <KPICard
              title="Unique Visitors"
              value={data.overview.uniqueVisitors}
              change={data.overview.visitorsTrend.change}
              trend={data.overview.visitorsTrend.trend}
              icon={Users}
            />
            <KPICard
              title="Engagement Rate"
              value={data.overview.engagementRate}
              change={data.overview.engagementTrend.change}
              trend={data.overview.engagementTrend.trend}
              icon={TrendingUp}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <KPICard
              title="Conversions"
              value={data.overview.totalConversions}
              change={data.overview.conversionTrend.change}
              trend={data.overview.conversionTrend.trend}
              icon={Target}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Portfolio Health Score" subtitle="Aggregate performance metric (0-100)">
              <div className="py-8 flex justify-center">
                <HealthScoreGauge
                  score={calculateHealthScore(data)}
                  label="Overall Portfolio Health"
                  size="md"
                />
              </div>
            </GlassCard>

            <GlassCard title="Anomaly Alerts" subtitle="Automated insights and warnings">
              <AlertBanner alerts={generateAlerts(data)} />
            </GlassCard>
          </div>

          <GlassCard title="Period Comparison" subtitle="Current vs Previous Period">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Sessions', current: data.overview.totalSessions, change: data.overview.sessionsTrend.change, trend: data.overview.sessionsTrend.trend },
                { label: 'Visitors', current: data.overview.uniqueVisitors, change: data.overview.visitorsTrend.change, trend: data.overview.visitorsTrend.trend },
                { label: 'Engagement', current: data.overview.engagementRate, change: data.overview.engagementTrend.change, trend: data.overview.engagementTrend.trend, suffix: '%' },
                { label: 'Conversions', current: data.overview.totalConversions, change: data.overview.conversionTrend.change, trend: data.overview.conversionTrend.trend },
              ].map((metric, i) => {
                const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : null;
                const trendColor = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400';

                return (
                  <div key={i} className="text-center p-4 rounded-lg bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-2">{metric.label}</div>
                    <div className="text-xl font-bold text-foreground mb-1">
                      {metric.current.toLocaleString()}{metric.suffix || ''}
                    </div>
                    {TrendIcon && (
                      <div className={`flex items-center justify-center gap-1 text-xs ${trendColor}`}>
                        <TrendIcon size={12} />
                        <span>{Math.abs(metric.change)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </DashboardSection>

        {/* Section 2: Traffic Acquisition Hub */}
        <DashboardSection id="traffic" title="Traffic Acquisition Hub" icon={TrendingUp}>
          {data.dailyMetrics && data.dailyMetrics.length > 0 ? (
            <>
              <GlassCard title="Traffic Trends" subtitle="Daily visitors and sessions over time" className="mb-6">
                <div className="mt-4">
                  <TrafficTrendChart
                    data={data.dailyMetrics.map(d => ({
                      date: d.session_date,
                      visitors: d.unique_visitors,
                      sessions: d.total_sessions,
                      engagement_rate: d.engagement_rate,
                      bounce_rate: d.bounce_rate,
                      avg_session_duration_sec: d.avg_session_duration_sec,
                      desktop: d.desktop_sessions,
                      mobile: d.mobile_sessions,
                      tablet: d.tablet_sessions,
                    }))}
                    height={320}
                  />
                </div>
              </GlassCard>

              {data.trafficSources && data.trafficSources.length > 0 && (
                <GlassCard title="Traffic Source Analysis" subtitle="Source quality and engagement matrix">
                  <div className="mt-4">
                    <TrafficSourceAnalysis
                      data={data.trafficSources.map(t => ({
                        source: t.traffic_source,
                        medium: t.traffic_medium,
                        sessions: t.sessions,
                        engagement_rate: t.engagement_rate,
                      }))}
                      height={320}
                    />
                  </div>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard title="Traffic Data" subtitle="No data available">
              <div className="py-12 text-center text-muted-foreground">
                No traffic data available for the selected date range
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 3: Geographic Intelligence */}
        <DashboardSection id="geographic" title="Geographic Intelligence" icon={Globe}>
          <GlassCard title="World Map" subtitle="Global visitor distribution">
            <div className="py-12 text-center text-muted-foreground">
              Interactive World Map - Coming Soon
            </div>
          </GlassCard>
        </DashboardSection>

        {/* Section 4: Visitor Intelligence Center */}
        <DashboardSection id="visitors" title="Visitor Intelligence Center" icon={Users}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Visitor Segments" subtitle="Audience classification breakdown">
              <div className="mt-4">
                <VisitorSegmentChart data={data.visitorSegments} height={300} />
              </div>
            </GlassCard>

            <GlassCard title="ML Predictions" subtitle="AI-powered visitor insights">
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-tech-neon/10 to-tech-accent/10 border border-tech-neon/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">High-Value Visitors</span>
                    <span className="text-2xl font-bold text-tech-neon">{data.mlPredictions.highValueVisitors}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Predicted to convert or return</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-tech-accent/10 to-tech-highlight/10 border border-tech-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Likely Recruiters</span>
                    <span className="text-2xl font-bold text-tech-accent">{data.mlPredictions.likelyRecruiters}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Based on behavior patterns</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-tech-highlight/10 to-tech-neon/10 border border-tech-highlight/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Deep Explorers</span>
                    <span className="text-2xl font-bold text-tech-highlight">{data.mlPredictions.deepExplorers}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Extensive content engagement</div>
                </div>
              </div>
            </GlassCard>
          </div>

          {data.visitorInsights && data.visitorInsights.length > 0 && (
            <GlassCard title="Top Visitors" subtitle="Most engaged visitors">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Visitor</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Segment</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Sessions</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Engagement</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Value Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.visitorInsights.slice(0, 10).map((visitor, i) => (
                      <tr key={i} className="border-b border-muted/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-3 font-mono text-xs">{visitor.user_pseudo_id.slice(0, 12)}...</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-1 rounded text-xs bg-tech-neon/10 text-tech-neon">
                            {visitor.visitor_segment}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">{visitor.total_sessions}</td>
                        <td className="py-2 px-3 text-right">{visitor.engagement_rate.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right font-bold text-tech-accent">{visitor.visitor_value_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 5: Engagement Deep Dive */}
        <DashboardSection id="engagement" title="Engagement Deep Dive" icon={Activity}>
          <GlassCard title="Engagement Analysis" subtitle="User interaction patterns">
            <div className="py-12 text-center text-muted-foreground">
              Engagement Metrics - Coming Soon
            </div>
          </GlassCard>
        </DashboardSection>

        {/* Section 6: Content Performance Matrix */}
        <DashboardSection id="content" title="Content Performance Matrix" icon={FileText}>
          {data.projectRankings && data.projectRankings.length > 0 ? (
            <>
              <GlassCard title="Project Performance Matrix" subtitle="Engagement vs Views scatter plot" className="mb-6">
                <div className="mt-4">
                  <ProjectScatterPlot
                    data={data.projectRankings.map(p => ({
                      project_id: p.project_id,
                      project_title: p.project_title,
                      overall_rank: p.overall_rank,
                      total_views: p.total_views,
                      total_clicks: p.total_clicks,
                      engagement_score: p.engagement_score,
                      recommended_position: p.recommended_position,
                    }))}
                    height={350}
                  />
                </div>
              </GlassCard>

              <GlassCard title="Top Projects" subtitle="Ranked by engagement score">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-muted">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Project</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Views</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Clicks</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Engagement</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projectRankings.slice(0, 10).map((project) => (
                        <tr key={project.project_id} className="border-b border-muted/50 hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-bold text-tech-neon">#{project.overall_rank}</td>
                          <td className="py-2 px-3">{project.project_title}</td>
                          <td className="py-2 px-3 text-right">{project.total_views}</td>
                          <td className="py-2 px-3 text-right">{project.total_clicks}</td>
                          <td className="py-2 px-3 text-right font-bold">{project.engagement_score.toFixed(1)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project.performance_tier === 'above_average' ? 'bg-green-500/10 text-green-500' :
                              project.performance_tier === 'average' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {project.performance_tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard title="Project Data" subtitle="No data available">
              <div className="py-12 text-center text-muted-foreground">
                No project data available
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 7: Section Flow Analysis */}
        <DashboardSection id="sections" title="Section Flow Analysis" icon={Layers}>
          {data.sectionRankings && data.sectionRankings.length > 0 ? (
            <GlassCard title="Section Health Radar" subtitle="Multi-dimensional section analysis">
              <div className="mt-4">
                <SectionRadarChart
                  data={data.sectionRankings.map(s => ({
                    section_id: s.section_id,
                    health_score: s.health_score,
                    engagement_rank: s.engagement_rank,
                    health_tier: s.health_tier,
                    optimization_hint: s.optimization_hint,
                    total_views: s.total_views,
                    avg_engagement_rate: s.avg_engagement_rate,
                    avg_exit_rate: s.avg_exit_rate,
                  }))}
                  height={350}
                />
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Section Flow" subtitle="Coming soon">
              <div className="py-12 text-center text-muted-foreground">
                Section flow data will be available once API endpoints are connected
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 8: Skills & Technology Demand */}
        <DashboardSection id="skills" title="Skills & Technology Demand" icon={Code}>
          {data.skillRankings && data.skillRankings.length > 0 ? (
            <GlassCard title="Skill Demand Analysis" subtitle="Technology interest and demand ranking">
              <div className="mt-4">
                <SkillDemandChart
                  data={data.skillRankings.map(s => ({
                    skill_name: s.skill_name,
                    skill_category: s.skill_category,
                    clicks: s.total_clicks,
                    demand_rank: s.overall_rank,
                    demand_tier: s.demand_tier,
                    learning_priority: s.recommendation,
                  }))}
                  height={320}
                />
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Skills Data" subtitle="No data available">
              <div className="py-12 text-center text-muted-foreground">
                No skill data available
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 9: Experience & Domain Analytics */}
        <DashboardSection id="experience" title="Experience & Domain Analytics" icon={Briefcase}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.domainRankings && data.domainRankings.length > 0 ? (
              <GlassCard title="Domain Interest" subtitle="Industry vertical analysis">
                <div className="mt-4">
                  <DomainInterestChart
                    data={data.domainRankings.map(d => ({
                      domain: d.domain,
                      interest_rank: d.interest_rank,
                      total_interest_score: d.total_interest_score,
                      demand_tier: d.demand_tier,
                      portfolio_recommendation: d.portfolio_recommendation,
                    }))}
                    height={280}
                  />
                </div>
              </GlassCard>
            ) : (
              <GlassCard title="Domain Data" subtitle="No data available">
                <div className="py-12 text-center text-muted-foreground">
                  No domain data available
                </div>
              </GlassCard>
            )}

            {data.experienceRankings && data.experienceRankings.length > 0 ? (
              <GlassCard title="Experience Interest" subtitle="Role and company engagement">
                <div className="mt-4">
                  <ExperienceInterestChart
                    data={data.experienceRankings.map(e => ({
                      role_title: e.experience_title,
                      company_name: e.company,
                      interest_rank: e.interest_rank,
                      interest_score: e.total_interactions,
                    }))}
                    height={280}
                  />
                </div>
              </GlassCard>
            ) : (
              <GlassCard title="Experience Data" subtitle="No data available">
                <div className="py-12 text-center text-muted-foreground">
                  No experience data available
                </div>
              </GlassCard>
            )}
          </div>
        </DashboardSection>

        {/* Section 10: Conversion Intelligence */}
        <DashboardSection id="conversions" title="Conversion Intelligence" icon={Target}>
          {data.conversionFunnel && data.conversionFunnel.length > 0 ? (
            <GlassCard title="Conversion Funnel" subtitle="Full funnel analysis">
              <div className="mt-4">
                <ConversionFunnelViz
                  data={{
                    cta_views: data.conversionFunnel[0].total_cta_views,
                    cta_clicks: data.conversionFunnel[0].total_cta_clicks,
                    form_starts: data.conversionFunnel[0].contact_form_starts,
                    form_submissions: data.conversionFunnel[0].contact_form_submissions,
                    resume_downloads: data.conversionFunnel[0].resume_downloads,
                    social_clicks: data.conversionFunnel[0].social_clicks,
                  }}
                />
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Conversion Data" subtitle="No data available">
              <div className="py-12 text-center text-muted-foreground">
                No conversion data available
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 11: Recommendation Engine Analytics */}
        <DashboardSection id="recommendations" title="Recommendation Engine Analytics" icon={Sparkles}>
          {data.recommendationPerformance ? (
            <GlassCard title="Recommendation Performance" subtitle="System effectiveness metrics">
              <div className="mt-4">
                <RecommendationHealth
                  data={{
                    system_health: data.recommendationPerformance.system_health,
                    overall_ctr: data.recommendationPerformance.overall_ctr,
                    position_1_ctr: data.recommendationPerformance.position_1_ctr,
                    position_2_ctr: data.recommendationPerformance.position_2_ctr,
                    position_3_ctr: data.recommendationPerformance.position_3_ctr,
                    user_conversion_rate: data.recommendationPerformance.user_conversion_rate,
                    total_impressions: data.recommendationPerformance.total_impressions,
                    total_clicks: data.recommendationPerformance.total_clicks,
                  }}
                />
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Recommendation Data" subtitle="No data available">
              <div className="py-12 text-center text-muted-foreground">
                No recommendation data available
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 12: Temporal & Technical Analysis */}
        <DashboardSection id="temporal" title="Temporal & Technical Analysis" icon={Clock}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Hour of Day Distribution" subtitle="Traffic by hour (0-23)">
              {data.temporal.hourlyDistribution && data.temporal.hourlyDistribution.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {data.temporal.hourlyDistribution.map((item) => (
                    <div key={item.hour} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-12">{item.hour}:00</span>
                      <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full bg-gradient-to-r from-tech-neon to-tech-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.sessions / Math.max(...data.temporal.hourlyDistribution.map(h => h.sessions))) * 100}%` }}
                          transition={{ duration: 0.8, delay: item.hour * 0.02 }}
                        />
                      </div>
                      <span className="text-xs font-medium w-16 text-right">{item.sessions}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Hourly distribution data will be available once API endpoints are connected
                </div>
              )}
            </GlassCard>

            <GlassCard title="Day of Week Performance" subtitle="Traffic by day">
              {data.temporal.dayOfWeekDistribution && data.temporal.dayOfWeekDistribution.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {data.temporal.dayOfWeekDistribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">{item.day}</span>
                      <div className="flex-1 h-8 bg-muted/20 rounded-lg overflow-hidden relative">
                        <motion.div
                          className="h-full bg-gradient-to-r from-tech-accent to-tech-highlight rounded-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.sessions / Math.max(...data.temporal.dayOfWeekDistribution.map(d => d.sessions))) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{item.sessions}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Day of week data will be available once API endpoints are connected
                </div>
              )}
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard title="Device Categories" subtitle="Session distribution">
              {data.devices.categories && data.devices.categories.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.devices.categories.map((device, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{device.device}</span>
                        <span className="text-lg font-bold text-tech-neon">{device.sessions}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Engagement: {device.engagement_rate.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Device data not available
                </div>
              )}
            </GlassCard>

            <GlassCard title="Connection Types" subtitle="Network analysis">
              {data.devices.connectionTypes && data.devices.connectionTypes.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.devices.connectionTypes.map((conn, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium uppercase">{conn.type}</span>
                        <span className="text-lg font-bold text-tech-accent">{conn.sessions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Connection data not available
                </div>
              )}
            </GlassCard>

            <GlassCard title="Color Schemes" subtitle="Theme preferences">
              {data.devices.colorSchemes && data.devices.colorSchemes.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.devices.colorSchemes.map((scheme, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{scheme.scheme} Mode</span>
                        <span className="text-lg font-bold text-tech-highlight">{scheme.sessions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Theme data not available
                </div>
              )}
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Footer */}
        <footer className="py-12 border-t border-black/5 dark:border-white/5 mt-8">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Comprehensive Analytics Dashboard
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Data from 31 BigQuery materialized tables - refreshed daily at 2:00 PM IST
              </p>
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block mt-6"
                >
                  <Button className="tech-btn gap-2">
                    <ArrowLeft size={16} />
                    Back to Portfolio
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </footer>
      </main>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
