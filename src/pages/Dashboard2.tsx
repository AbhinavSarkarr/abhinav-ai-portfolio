import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  DashboardSection,
  GlassCard,
  TrafficTrendChart,
  CountryBarChart,
  VisitorSegmentChart,
  SkillDemandChart,
  ConversionFunnel,
  RecommendationHealth,
  EngagementTrendChart,
  SessionDurationChart,
  DeviceTrendChart,
  TrafficSourceAnalysis,
  SectionRadarChart,
  ProjectScatterPlot,
  SkillsCategoryChart,
  DomainInterestChart,
  ExperienceInterestChart,
  KeyInsightsPanel,
  EnhancedOverview,
} from '@/components/dashboard';
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import type {
  DashboardData,
  DailyMetric,
  TrafficSource,
  CountryData,
  VisitorSegments,
  ConversionFunnel as ConversionFunnelType,
  RecommendationData,
  DomainRanking,
  ExperienceRanking,
  SkillRanking,
  ProjectRanking,
  SectionRanking,
  ClientRanking,
  OverviewMetrics,
} from '@/hooks/useDashboardData';

// API Base URL - adjust for production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Date range presets
const DATE_PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

// Helper to format API dates
function formatApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Helper to safely get number values
function safeNumber(val: unknown, defaultVal = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultVal : parsed;
  }
  return defaultVal;
}

// Date Range Picker Component
function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
}: {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPreset = DATE_PRESETS.find(
    (p) => Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) === p.days - 1
  );

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-xs sm:text-sm"
      >
        <Calendar size={14} />
        <span className="hidden sm:inline">
          {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </span>
        <span className="sm:hidden">
          {format(startDate, 'M/d')} - {format(endDate, 'M/d')}
        </span>
        <ChevronDown size={14} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[160px]">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => {
                  const end = subDays(new Date(), 1);
                  const start = subDays(end, preset.days - 1);
                  onRangeChange(startOfDay(start), endOfDay(end));
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${
                  currentPreset?.days === preset.days ? 'bg-muted font-medium' : ''
                }`}
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

// Main Dashboard Component
export default function Dashboard2() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  // Date range state - default to last 7 days
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(() => subDays(new Date(), 1));

  // Fetch all data from API
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    const startStr = formatApiDate(startDate);
    const endStr = formatApiDate(endDate);

    try {
      // Fetch all endpoints in parallel
      const [
        sessionsRes,
        dailyMetricsRes,
        conversionFunnelRes,
        projectRankingsRes,
        skillRankingsRes,
        sectionRankingsRes,
        clientRankingsRes,
        domainRankingsRes,
        experienceRankingsRes,
        recommendationPerfRes,
        visitorInsightsRes,
        trafficStatsRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/api/sessions?start_date=${startStr}&end_date=${endStr}`).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch(`${API_BASE}/api/daily-metrics?start_date=${startStr}&end_date=${endStr}`).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch(`${API_BASE}/api/conversion-funnel?start_date=${startStr}&end_date=${endStr}`).then(
          (r) => (r.ok ? r.json() : null)
        ),
        fetch(`${API_BASE}/api/project-rankings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/skill-rankings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/section-rankings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/client-rankings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/domain-rankings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/experience-rankings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/recommendation-performance`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/visitor-insights`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/api/traffic-daily-stats?start_date=${startStr}&end_date=${endStr}`).then(
          (r) => (r.ok ? r.json() : null)
        ),
      ]);

      // Transform sessions data to overview
      const sessionsOverview = sessionsRes?.overview || {};
      const overview: OverviewMetrics = {
        total_visitors_7d: safeNumber(sessionsOverview.unique_visitors),
        total_sessions_7d: safeNumber(sessionsOverview.total_sessions),
        engagement_rate: safeNumber(sessionsOverview.engagement_rate),
        bounce_rate: safeNumber(sessionsOverview.bounce_rate),
        total_conversions: safeNumber(conversionFunnelRes?.summary?.form_submissions),
        resume_downloads: safeNumber(conversionFunnelRes?.summary?.resume_downloads),
        avg_session_duration_sec: safeNumber(sessionsOverview.avg_session_duration),
      };

      // Transform daily metrics
      const dailyMetrics: DailyMetric[] = (dailyMetricsRes?.data || []).map((d: Record<string, unknown>) => ({
        date: String(d.date || ''),
        visitors: safeNumber(d.visitors),
        sessions: safeNumber(d.sessions),
        engagement_rate: safeNumber(d.engagement_rate),
        bounce_rate: safeNumber(d.bounce_rate),
        avg_session_duration_sec: safeNumber(d.avg_session_duration_sec),
        desktop: safeNumber(d.desktop_sessions),
        mobile: safeNumber(d.mobile_sessions),
        tablet: safeNumber(d.tablet_sessions),
      }));

      // Transform traffic sources
      const trafficSources: TrafficSource[] = (trafficStatsRes?.trafficSources || sessionsRes?.trafficSources || []).map(
        (t: Record<string, unknown>) => ({
          source: String(t.traffic_source || t.source || 'direct'),
          medium: String(t.traffic_medium || t.medium || 'none'),
          sessions: safeNumber(t.total_sessions || t.sessions),
          engagement_rate: safeNumber(t.avg_engagement_rate || t.avg_engagement),
        })
      );

      // Transform countries
      const topCountries: CountryData[] = (sessionsRes?.topCountries || []).map(
        (c: Record<string, unknown>) => ({
          country: String(c.country || 'Unknown'),
          visitors: safeNumber(c.visitors),
        })
      );

      // Transform visitor segments
      const segmentTotals = visitorInsightsRes?.segmentTotals || {};
      const visitorSegments: VisitorSegments = {
        converters: safeNumber(segmentTotals.converter),
        high_intent: safeNumber(segmentTotals.high_intent),
        engaged_explorers: safeNumber(segmentTotals.engaged_explorer),
        returning_visitors: safeNumber(segmentTotals.returning),
        casual_browsers: safeNumber(segmentTotals.casual_browser),
      };

      // Transform conversion funnel
      const funnelSummary = conversionFunnelRes?.summary || {};
      const conversionFunnel: ConversionFunnelType = {
        cta_views: safeNumber(funnelSummary.cta_views),
        cta_clicks: safeNumber(funnelSummary.cta_clicks),
        form_starts: safeNumber(funnelSummary.form_starts),
        form_submissions: safeNumber(funnelSummary.form_submissions),
        resume_downloads: safeNumber(funnelSummary.resume_downloads),
        social_clicks: safeNumber(funnelSummary.social_clicks),
      };

      // Transform recommendation data
      const recPerf = recommendationPerfRes?.performance || [];
      const overallRec = recPerf.find((r: Record<string, unknown>) => r.metric_type === 'overall');
      const pos1 = recPerf.find((r: Record<string, unknown>) => r.metric_name === 'position_1');
      const pos2 = recPerf.find((r: Record<string, unknown>) => r.metric_name === 'position_2');
      const pos3 = recPerf.find((r: Record<string, unknown>) => r.metric_name === 'position_3');

      const recommendations: RecommendationData = {
        system_health: determineSystemHealth(safeNumber(overallRec?.ctr)),
        overall_ctr: safeNumber(overallRec?.ctr),
        position_1_ctr: safeNumber(pos1?.ctr),
        position_2_ctr: safeNumber(pos2?.ctr),
        position_3_ctr: safeNumber(pos3?.ctr),
        user_conversion_rate: 0,
        total_impressions: safeNumber(overallRec?.times_shown),
        total_clicks: safeNumber(overallRec?.times_clicked),
      };

      // Transform domain rankings
      const domains: DomainRanking[] = (domainRankingsRes?.rankings || []).map(
        (d: Record<string, unknown>) => ({
          domain: String(d.domain || 'Unknown'),
          interest_rank: safeNumber(d.interest_rank, 999),
          total_interest_score: safeNumber(d.total_interest_score),
          demand_tier: (d.demand_tier as DomainRanking['demand_tier']) || 'niche_interest',
          portfolio_recommendation: String(d.portfolio_recommendation || 'maintain'),
        })
      );

      // Transform experience rankings
      const experiences: ExperienceRanking[] = (experienceRankingsRes?.rankings || []).map(
        (e: Record<string, unknown>) => ({
          role_title: String(e.experience_id || 'Unknown'),
          company_name: '',
          interest_rank: safeNumber(e.experience_rank, 999),
          interest_score: safeNumber(e.total_interactions),
        })
      );

      // Transform skill rankings
      const skills: SkillRanking[] = (skillRankingsRes?.rankings || []).map(
        (s: Record<string, unknown>) => ({
          skill_name: String(s.skill_name || 'Unknown'),
          skill_category: String(s.skill_category || 'Other'),
          clicks: safeNumber(s.total_clicks || s.total_interest_signals),
          demand_rank: safeNumber(s.skill_rank || s.demand_rank, 999),
          demand_tier: (s.demand_tier as SkillRanking['demand_tier']) || 'niche',
          learning_priority: String(s.learning_priority || 'maintain_expertise'),
        })
      );

      // Transform project rankings
      const projects: ProjectRanking[] = (projectRankingsRes?.rankings || []).map(
        (p: Record<string, unknown>) => ({
          project_id: String(p.project_id || 'unknown'),
          project_title: String(p.project_title || 'Unknown Project'),
          overall_rank: safeNumber(p.overall_rank, 999),
          total_views: safeNumber(p.total_views),
          total_clicks: safeNumber(p.total_clicks),
          engagement_score: safeNumber(p.engagement_score),
          recommended_position: String(p.recommended_position || 'primary'),
        })
      );

      // Transform section rankings
      const sections: SectionRanking[] = (sectionRankingsRes?.rankings || []).map(
        (s: Record<string, unknown>) => ({
          section_id: String(s.section_id || 'unknown'),
          health_score: safeNumber(s.health_score, 50),
          engagement_rank: safeNumber(s.engagement_rank, 999),
          health_tier: (s.health_tier as SectionRanking['health_tier']) || 'needs_attention',
          optimization_hint: String(s.optimization_priority || 'review_content'),
          total_views: safeNumber(s.total_views),
          avg_engagement_rate: 0,
          avg_exit_rate: 0,
        })
      );

      // Transform client rankings
      const clients: ClientRanking[] = (clientRankingsRes?.rankings || []).map(
        (c: Record<string, unknown>) => ({
          client_id: String(c.client_id || 'unknown'),
          client_name: String(c.client_name || 'Unknown Client'),
          experience_id: String(c.experience_id || 'exp1'),
          domain: String(c.domain || 'Other'),
          engagement_rank: safeNumber(c.engagement_rank, 999),
          total_views: safeNumber(c.total_views),
          total_clicks: safeNumber(c.total_clicks),
        })
      );

      const dashboardData: DashboardData = {
        overview,
        dailyMetrics,
        trafficSources,
        topCountries,
        visitorSegments,
        conversionFunnel,
        recommendations,
        domains,
        experiences,
        skills,
        projects,
        sections,
        clients,
        updated_at: new Date().toISOString(),
      };

      setData(dashboardData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please check if the API server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine system health
  function determineSystemHealth(ctr: number): RecommendationData['system_health'] {
    if (ctr >= 10) return 'excellent';
    if (ctr >= 5) return 'good';
    if (ctr >= 2) return 'needs_improvement';
    return 'underperforming';
  }

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

  // Check if we have meaningful data
  const hasData = useMemo(() => {
    if (!data) return false;
    return (
      data.overview.total_sessions_7d > 0 ||
      data.dailyMetrics.length > 0 ||
      data.projects.length > 0
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RefreshCw size={32} className="text-tech-neon animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <p className="text-foreground text-lg">No data available</p>
          <Link to="/" className="text-tech-accent hover:underline mt-4 inline-block">
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

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
            {/* Back to Portfolio */}
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
                Analytics (Live)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <DateRangePicker
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
        {!hasData ? (
          <div className="container py-20 text-center">
            <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
            <p className="text-foreground text-lg mb-2">No data available for selected date range</p>
            <p className="text-muted-foreground text-sm">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </p>
          </div>
        ) : (
          <>
            {/* Enhanced Overview Section */}
            <DashboardSection id="overview" title="Overview">
              <EnhancedOverview data={data} />
            </DashboardSection>

            {/* Key Insights Section */}
            <DashboardSection id="insights" title="Key Insights">
              <KeyInsightsPanel data={data} />
            </DashboardSection>

            {/* Traffic & Visitors Section */}
            <DashboardSection id="traffic" title="Traffic & Visitors">
              {data.dailyMetrics.length > 0 ? (
                <>
                  <GlassCard
                    title="Traffic Trend"
                    subtitle="Daily visitors and sessions over time"
                    className="mb-6"
                  >
                    <div className="mt-4">
                      <TrafficTrendChart data={data.dailyMetrics} height={300} />
                    </div>
                  </GlassCard>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <GlassCard
                      title="Engagement vs Bounce Rate"
                      subtitle="Daily quality metrics trend"
                    >
                      <div className="mt-4">
                        <EngagementTrendChart data={data.dailyMetrics} height={280} />
                      </div>
                    </GlassCard>

                    <GlassCard
                      title="Session Duration Analysis"
                      subtitle="Time spent on site over time"
                    >
                      <div className="mt-4">
                        <SessionDurationChart data={data.dailyMetrics} height={280} />
                      </div>
                    </GlassCard>
                  </div>

                  <GlassCard
                    title="Device Usage Trends"
                    subtitle="Desktop vs Mobile vs Tablet over time"
                  >
                    <div className="mt-4">
                      <DeviceTrendChart data={data.dailyMetrics} height={280} />
                    </div>
                  </GlassCard>
                </>
              ) : (
                <GlassCard title="Traffic Data" subtitle="N/A">
                  <div className="py-12 text-center text-muted-foreground">
                    No traffic data available for this date range
                  </div>
                </GlassCard>
              )}

              {data.trafficSources.length > 0 && (
                <GlassCard
                  title="Traffic Source Analysis"
                  subtitle="Quality matrix and source breakdown"
                  className="mt-6"
                >
                  <div className="mt-4">
                    <TrafficSourceAnalysis data={data.trafficSources} height={300} />
                  </div>
                </GlassCard>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {data.topCountries.length > 0 ? (
                  <GlassCard title="Geographic Distribution" subtitle="Visitors by country">
                    <div className="mt-4">
                      <CountryBarChart data={data.topCountries} height={250} />
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard title="Geographic Distribution" subtitle="N/A">
                    <div className="py-12 text-center text-muted-foreground">
                      No geographic data available
                    </div>
                  </GlassCard>
                )}

                <GlassCard title="Visitor Segments" subtitle="Audience classification breakdown">
                  <div className="mt-4">
                    <VisitorSegmentChart data={data.visitorSegments} height={280} />
                  </div>
                </GlassCard>
              </div>
            </DashboardSection>

            {/* Project Rankings Section */}
            {data.projects.length > 0 && (
              <DashboardSection id="projects" title="Project Performance">
                <ProjectScatterPlot data={data.projects} height={350} />
              </DashboardSection>
            )}

            {/* Skills & Tech Demand Section */}
            {data.skills.length > 0 && (
              <DashboardSection id="skills" title="Skills & Tech Demand">
                <GlassCard
                  title="Skills Overview"
                  subtitle="Demand ranking and click distribution"
                  className="mb-6"
                >
                  <div className="mt-4">
                    <SkillDemandChart data={data.skills} height={320} />
                  </div>
                </GlassCard>

                <GlassCard title="Skills by Category" subtitle="Category breakdown and tier analysis">
                  <div className="mt-4">
                    <SkillsCategoryChart data={data.skills} height={300} />
                  </div>
                </GlassCard>
              </DashboardSection>
            )}

            {/* Section Health Section */}
            {data.sections.length > 0 && (
              <DashboardSection id="sections" title="Section Performance">
                <SectionRadarChart data={data.sections} height={350} />
              </DashboardSection>
            )}

            {/* Domain & Experience Interest */}
            {(data.domains.length > 0 || data.experiences.length > 0) && (
              <DashboardSection id="interest" title="Industry & Experience Interest">
                <div className="space-y-6">
                  {data.domains.length > 0 && (
                    <GlassCard
                      title="Domain Interest Analysis"
                      subtitle="Industry interest scores and recommendations"
                    >
                      <div className="mt-4">
                        <DomainInterestChart data={data.domains} height={280} />
                      </div>
                    </GlassCard>
                  )}

                  {data.experiences.length > 0 && (
                    <GlassCard
                      title="Experience Interest"
                      subtitle="Role and company engagement ranking"
                    >
                      <div className="mt-4">
                        <ExperienceInterestChart data={data.experiences} height={280} />
                      </div>
                    </GlassCard>
                  )}
                </div>
              </DashboardSection>
            )}

            {/* Conversions Section */}
            <DashboardSection id="conversions" title="Conversion Funnel">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard title="Conversion Journey" subtitle="Step-by-step funnel analysis">
                  <div className="mt-4">
                    <ConversionFunnel data={data.conversionFunnel} />
                  </div>
                </GlassCard>

                <GlassCard
                  title="Recommendation Engine"
                  subtitle="System health and performance metrics"
                >
                  <div className="mt-4">
                    <RecommendationHealth data={data.recommendations} />
                  </div>
                </GlassCard>
              </div>
            </DashboardSection>
          </>
        )}

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
                Live Analytics Dashboard
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Data from BigQuery materialized tables - refreshed daily at 2:00 PM IST
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
