import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
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
  useDashboardData,
  type DateRangePreset,
  type DashboardData,
  getPresetLabel,
  warmUpBackendAPI,
} from '@/hooks/useDashboardData';
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
  Download,
  ExternalLink,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  BookOpen,
  Award,
  MapPin,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

// Date range preset options
const DATE_PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_14_days', label: 'Last 14 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'all_time', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
];

// Types for API response
interface ApiResponse {
  overview: {
    totalSessions: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    avgPagesPerSession: number;
    bounceRate: number;
    engagementRate: number;
    avgEngagementScore: number;
    totalConversions: number;
  };
  dailyMetrics: Array<{
    date: string;
    sessions: number;
    visitors: number;
    engagement_rate: number;
    bounce_rate: number;
    avg_duration: number;
    desktop_sessions: number;
    mobile_sessions: number;
    tablet_sessions: number;
  }>;
  trafficSources: Array<{
    traffic_source: string;
    traffic_medium: string;
    sessions: number;
    unique_visitors: number;
    engagement_rate: number;
    bounce_rate: number;
    avg_duration: number;
  }>;
  conversionSummary: {
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
  projectRankings: Array<{
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
  }>;
  sectionRankings: Array<{
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
  }>;
  visitorSegments: Record<string, {
    count: number;
    avg_value_score: number;
    avg_sessions: number;
    avg_engagement_rate: number;
  }>;
  topVisitors: Array<{
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
  }>;
  techDemand: Array<{
    skill_name: string;
    total_interactions: number;
    total_unique_users: number;
    demand_rank: number;
    demand_percentile: number;
    demand_tier: string;
    learning_priority: string;
  }>;
  domainRankings: Array<{
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
  }>;
  experienceRankings: Array<{
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
  }>;
  recommendationPerformance: Array<{
    total_impressions: number;
    total_clicks: number;
    overall_ctr: number;
    system_health: string;
  }>;
  temporal: {
    hourlyDistribution: Array<{
      hour: number;
      sessions: number;
      unique_visitors: number;
      avg_engagement: number;
      engagement_rate: number;
    }>;
    dayOfWeekDistribution: Array<{
      day_name: string;
      day_number: number;
      sessions: number;
      unique_visitors: number;
      avg_engagement: number;
      engagement_rate: number;
    }>;
  };
  devices: {
    categories: Array<{
      device_category: string;
      sessions: number;
      unique_visitors: number;
      engagement_rate: number;
      avg_duration: number;
    }>;
    browsers: Array<{
      browser: string;
      sessions: number;
      unique_visitors: number;
    }>;
    operatingSystems: Array<{
      operating_system: string;
      sessions: number;
      unique_visitors: number;
    }>;
  };
  geographic: Array<{
    country: string;
    city: string;
    sessions: number;
    unique_visitors: number;
    engagement_rate: number;
  }>;
  dateRange: { start: string; end: string };
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Get date X days ago in YYYY-MM-DD format
function getDaysAgoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Date Range Picker Component with Presets
function DateRangeSelector({
  currentPreset,
  onPresetChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  metadata,
}: {
  currentPreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStartDate: string | null;
  customEndDate: string | null;
  onCustomDateChange: (start: string, end: string) => void;
  metadata: { dataStartDate: string; dataEndDate: string } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Calculate date constraints
  const yesterday = getYesterdayDate();
  const minDate = metadata?.dataStartDate || getDaysAgoDate(30); // Default to 30 days ago if no metadata
  const maxDate = yesterday; // Always yesterday, never today

  const [tempStart, setTempStart] = useState(customStartDate || minDate);
  const [tempEnd, setTempEnd] = useState(customEndDate || maxDate);

  const currentLabel = useMemo(() => {
    if (currentPreset === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} - ${customEndDate}`;
    }
    return getPresetLabel(currentPreset);
  }, [currentPreset, customStartDate, customEndDate]);

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustomPicker(true);
      // Pre-populate with reasonable defaults
      setTempStart(customStartDate || minDate);
      setTempEnd(customEndDate || maxDate);
    } else {
      onPresetChange(preset);
      setIsOpen(false);
      setShowCustomPicker(false);
    }
  };

  const handleCustomApply = () => {
    if (tempStart && tempEnd) {
      onCustomDateChange(tempStart, tempEnd);
      setIsOpen(false);
      setShowCustomPicker(false);
    }
  };

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
        <span className="sm:hidden">{currentLabel.length > 15 ? currentLabel.slice(0, 12) + '...' : currentLabel}</span>
        <ChevronDown size={14} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setShowCustomPicker(false); }} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-background/95 backdrop-blur-xl border border-tech-accent/20 rounded-lg shadow-lg p-2 min-w-[220px]">
            {!showCustomPicker ? (
              <>
                {DATE_PRESET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors border border-transparent ${
                      currentPreset === option.value
                        ? 'bg-tech-accent/20 border-tech-accent/40 text-tech-neon'
                        : 'hover:bg-tech-accent/10 hover:border-tech-accent/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </>
            ) : (
              <div className="p-2 space-y-3">
                <h4 className="text-sm font-medium text-center">Custom Date Range</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={tempStart}
                      min={minDate}
                      max={tempEnd || maxDate}
                      onChange={(e) => setTempStart(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded border border-tech-accent/20 bg-background focus:border-tech-accent/40 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                    <input
                      type="date"
                      value={tempEnd}
                      min={tempStart || minDate}
                      max={maxDate}
                      onChange={(e) => setTempEnd(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded border border-tech-accent/20 bg-background focus:border-tech-accent/40 outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Data available: {minDate} to {maxDate}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCustomPicker(false)}
                    className="flex-1 text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomApply}
                    className="flex-1 text-xs bg-tech-neon hover:bg-tech-neon/80"
                    disabled={!tempStart || !tempEnd}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
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
  subtitle,
}: {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  format?: (value: number) => string;
  subtitle?: string;
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
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// Stat Card for smaller metrics
function StatCard({
  label,
  value,
  icon: Icon,
  color = 'tech-neon',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={`text-${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-bold text-${color}`}>{value}</span>
    </div>
  );
}

// Helper function to calculate overall health score
function calculateHealthScore(data: DashboardData): number {
  if (!data) return 0;
  const engagementScore = Math.min(100, data.overview.engagementRate * 1.2);
  const bounceScore = Math.max(0, 100 - data.overview.bounceRate * 1.2);
  const conversionScore = Math.min(100, data.overview.totalConversions * 15);
  const sessionScore = Math.min(100, data.overview.totalSessions * 0.5);
  return Math.round((engagementScore * 0.35 + bounceScore * 0.25 + conversionScore * 0.25 + sessionScore * 0.15));
}

// Helper function to generate alerts
function generateAlerts(data: DashboardData): Alert[] {
  if (!data) return [];
  const alerts: Alert[] = [];

  if (data.overview.bounceRate > 60) {
    alerts.push({
      type: 'warning',
      title: 'High Bounce Rate',
      message: `${data.overview.bounceRate.toFixed(1)}% of visitors leave without engaging.`,
      metric: 'Consider improving landing page content.',
    });
  }

  if (data.overview.engagementRate > 70) {
    alerts.push({
      type: 'success',
      title: 'Strong Engagement',
      message: `${data.overview.engagementRate.toFixed(1)}% engagement rate is excellent!`,
    });
  }

  if (data.conversionSummary.resume_downloads > 0) {
    alerts.push({
      type: 'success',
      title: 'Resume Interest',
      message: `${data.conversionSummary.resume_downloads} resume downloads - recruiters are interested!`,
    });
  }

  const topProject = data.projectRankings[0];
  if (topProject && topProject.total_clicks > 10) {
    alerts.push({
      type: 'info',
      title: 'Top Project',
      message: `"${topProject.project_title}" is your most clicked project with ${topProject.total_clicks} clicks.`,
    });
  }

  return alerts;
}

// Main Dashboard3 Component
export default function Dashboard3() {
  // Use the new hook with Gist caching
  const {
    data,
    isLoading,
    error,
    metadata,
    refetch,
    setDateRange,
    currentPreset,
    customStartDate,
    customEndDate,
  } = useDashboardData({ preset: 'last_7_days' });

  // Warm up backend API on mount (for custom date range requests)
  useEffect(() => {
    warmUpBackendAPI();
    window.scrollTo(0, 0);
  }, []);

  // Handle preset change
  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRange(preset);
  };

  // Handle custom date change
  const handleCustomDateChange = (start: string, end: string) => {
    setDateRange('custom', start, end);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative z-50">
        <motion.div
          className="flex flex-col items-center gap-4 bg-card/90 p-8 rounded-xl backdrop-blur-sm border border-border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <RefreshCw size={48} className="text-tech-neon animate-spin" />
          <p className="text-foreground font-medium text-lg">Loading comprehensive analytics...</p>
          <p className="text-muted-foreground text-sm">Fetching data from API</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-foreground text-lg mb-2">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm mb-4">{error.message}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={refetch} className="gap-2">
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

  // Calculate visitor segment totals for charts
  const visitorSegmentData = {
    converters: data.visitorSegments?.converter?.count || 0,
    high_intent: data.visitorSegments?.high_intent?.count || 0,
    engaged_explorers: data.visitorSegments?.engaged_explorer?.count || 0,
    returning_visitors: data.visitorSegments?.returning_visitor?.count || 0,
    casual_browsers: (data.visitorSegments?.casual_browser?.count || 0) + (data.visitorSegments?.engaged_new?.count || 0),
  };

  // Typed data for easier access
  const typedData = data as DashboardData;

  // Group geographic data by country
  const countryData = data.geographic.reduce((acc, item) => {
    if (!acc[item.country]) {
      acc[item.country] = { sessions: 0, visitors: 0 };
    }
    acc[item.country].sessions += item.sessions;
    acc[item.country].visitors += item.unique_visitors;
    return acc;
  }, {} as Record<string, { sessions: number; visitors: number }>);

  const topCountries = Object.entries(countryData)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-tech-neon/10 dark:bg-tech-neon/5 rounded-full blur-[120px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-32 w-96 h-96 bg-tech-accent/10 dark:bg-tech-accent/5 rounded-full blur-[120px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-black/5 dark:border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs sm:text-sm">
                <ArrowLeft size={14} />
                <span className="hidden xs:inline">Portfolio</span>
              </Button>
            </Link>
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center">
                <BarChart3 size={18} className="text-white" />
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent">
                Portfolio Analytics
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DateRangeSelector
              currentPreset={currentPreset}
              onPresetChange={handlePresetChange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomDateChange={handleCustomDateChange}
              metadata={metadata}
            />
            <Button variant="ghost" size="sm" onClick={refetch} className="gap-1.5">
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 md:pt-24 relative z-10">

        {/* Section 1: Executive Overview */}
        <DashboardSection id="executive" title="Executive Overview" icon={Gauge}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <KPICard
              title="Total Sessions"
              value={data.overview.totalSessions}
              icon={Activity}
              subtitle={`${data.overview.uniqueVisitors} unique visitors`}
            />
            <KPICard
              title="Engagement Rate"
              value={data.overview.engagementRate}
              icon={TrendingUp}
              format={(v) => `${v.toFixed(1)}%`}
              subtitle={`${data.overview.bounceRate.toFixed(1)}% bounce rate`}
            />
            <KPICard
              title="Avg Session"
              value={data.overview.avgSessionDuration}
              icon={Clock}
              format={(v) => `${Math.round(v / 60)}m ${Math.round(v % 60)}s`}
              subtitle={`${data.overview.avgPagesPerSession.toFixed(1)} pages/session`}
            />
            <KPICard
              title="Conversions"
              value={data.overview.totalConversions}
              icon={Target}
              subtitle={`${data.conversionSummary.resume_downloads} resumes, ${data.conversionSummary.social_clicks} social`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Portfolio Health Score" subtitle="Aggregate performance (0-100)">
              <div className="py-8 flex justify-center">
                <HealthScoreGauge score={calculateHealthScore(data)} label="Overall Health" size="md" />
              </div>
            </GlassCard>
            <GlassCard title="Insights & Alerts" subtitle="Automated analysis">
              <AlertBanner alerts={generateAlerts(data)} />
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Section 2: Traffic Acquisition */}
        <DashboardSection id="traffic" title="Traffic Acquisition" icon={Globe}>
          {data.dailyMetrics && data.dailyMetrics.length > 0 ? (
            <GlassCard title="Daily Traffic Trends" subtitle="Sessions and visitors over time" className="mb-6">
              <div className="mt-4">
                <TrafficTrendChart
                  data={data.dailyMetrics.map(d => ({
                    date: d.date,
                    visitors: d.visitors,
                    sessions: d.sessions,
                    engagement_rate: d.engagement_rate,
                    bounce_rate: d.bounce_rate,
                    avg_session_duration_sec: d.avg_duration,
                    desktop: d.desktop_sessions,
                    mobile: d.mobile_sessions,
                    tablet: d.tablet_sessions,
                  }))}
                  height={300}
                />
              </div>
            </GlassCard>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Traffic Sources" subtitle="Where visitors come from">
              {data.trafficSources && data.trafficSources.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.trafficSources.slice(0, 8).map((source, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          source.traffic_medium === 'social' ? 'bg-blue-400' :
                          source.traffic_medium === 'referral' ? 'bg-green-400' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{source.traffic_source}</p>
                          <p className="text-xs text-muted-foreground">{source.traffic_medium}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-tech-neon">{source.sessions}</p>
                        <p className="text-xs text-muted-foreground">{source.engagement_rate?.toFixed(0) || 0}% engaged</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No traffic source data</p>
              )}
            </GlassCard>

            <GlassCard title="Geographic Distribution" subtitle="Top countries by visitors">
              {topCountries.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {topCountries.map(([country, stats], i) => (
                    <div key={country} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🌍'}</span>
                        <span className="font-medium">{country}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-tech-accent">{stats.visitors} visitors</p>
                        <p className="text-xs text-muted-foreground">{stats.sessions} sessions</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No geographic data</p>
              )}
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Section 3: Visitor Intelligence */}
        <DashboardSection id="visitors" title="Visitor Intelligence" icon={Users}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Visitor Segments" subtitle="Audience classification">
              <div className="mt-4">
                <VisitorSegmentChart data={visitorSegmentData} height={280} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(data.visitorSegments || {}).map(([segment, info]) => (
                  <div key={segment} className="p-2 rounded bg-muted/20 text-center">
                    <p className="text-lg font-bold text-tech-neon">{info.count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{segment.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Top Visitors" subtitle="Highest value score visitors">
              {data.topVisitors && data.topVisitors.length > 0 ? (
                <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
                  {data.topVisitors.slice(0, 8).map((visitor, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          visitor.visitor_segment === 'converter' ? 'bg-green-500/20 text-green-400' :
                          visitor.visitor_segment === 'high_intent' ? 'bg-blue-500/20 text-blue-400' :
                          visitor.visitor_segment === 'engaged_explorer' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {visitor.visitor_segment}
                        </span>
                        <span className="text-lg font-bold text-tech-neon">{visitor.visitor_value_score}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <div><span className="block text-foreground">{visitor.total_sessions}</span>sessions</div>
                        <div><span className="block text-foreground">{visitor.projects_viewed}</span>projects</div>
                        <div><span className="block text-foreground">{visitor.resume_downloads}</span>resumes</div>
                        <div><span className="block text-foreground">{visitor.primary_country?.slice(0, 8) || 'Unknown'}</span>location</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No visitor data</p>
              )}
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Section 4: Project Performance */}
        <DashboardSection id="projects" title="Project Performance" icon={FileText}>
          {data.projectRankings && data.projectRankings.length > 0 ? (
            <>
              <GlassCard title="Project Rankings" subtitle="Ranked by engagement score" className="mb-6">
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-muted">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Project</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Views</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Clicks</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projectRankings.map((project) => (
                        <tr key={project.project_id} className="border-b border-muted/50 hover:bg-muted/20">
                          <td className="py-2 px-3 font-bold text-tech-neon">#{project.overall_rank}</td>
                          <td className="py-2 px-3 font-medium">{project.project_title}</td>
                          <td className="py-2 px-3 text-right">{project.total_unique_viewers}</td>
                          <td className="py-2 px-3 text-right font-bold">{project.total_clicks}</td>
                          <td className="py-2 px-3 text-right font-bold text-tech-accent">{project.engagement_score}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project.performance_tier === 'above_average' ? 'bg-green-500/20 text-green-400' :
                              project.performance_tier === 'average' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {project.performance_tier}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-xs text-muted-foreground">{project.recommended_position}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Project Views" value={data.projectRankings.reduce((s, p) => s + p.total_unique_viewers, 0)} icon={Eye} />
                <StatCard label="Total Clicks" value={data.projectRankings.reduce((s, p) => s + p.total_clicks, 0)} icon={MousePointer} />
                <StatCard label="GitHub Clicks" value={data.projectRankings.reduce((s, p) => s + p.total_github_clicks, 0)} icon={ExternalLink} />
                <StatCard label="Demo Views" value={data.projectRankings.reduce((s, p) => s + p.total_demo_clicks, 0)} icon={Eye} />
              </div>
            </>
          ) : (
            <GlassCard title="Project Data">
              <p className="text-center text-muted-foreground py-8">No project ranking data available</p>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 5: Section Health */}
        <DashboardSection id="sections" title="Section Health" icon={Layers}>
          {data.sectionRankings && data.sectionRankings.length > 0 ? (
            <GlassCard title="Section Performance" subtitle="Engagement and health metrics">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Section</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Views</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Avg Time</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Scroll %</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Health</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Hint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sectionRankings.map((section) => (
                      <tr key={section.section_id} className="border-b border-muted/50 hover:bg-muted/20">
                        <td className="py-2 px-3 font-medium capitalize">{section.section_id}</td>
                        <td className="py-2 px-3 text-right">{section.total_views}</td>
                        <td className="py-2 px-3 text-right">{Math.round(section.avg_time_spent_seconds)}s</td>
                        <td className="py-2 px-3 text-right">{section.avg_scroll_depth_percent?.toFixed(0) || 0}%</td>
                        <td className="py-2 px-3 text-right font-bold text-tech-neon">{section.health_score?.toFixed(0) || 0}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            section.health_tier === 'excellent' ? 'bg-green-500/20 text-green-400' :
                            section.health_tier === 'good' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {section.health_tier}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{section.optimization_hint?.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Section Data">
              <p className="text-center text-muted-foreground py-8">No section data available</p>
            </GlassCard>
          )}
        </DashboardSection>

        {/* Section 6: Skills & Technology Demand (LEARNING FOCUS) */}
        <DashboardSection id="skills" title="Skills & Learning Focus" icon={Code}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Technology Demand" subtitle="What skills visitors are looking for">
              {data.techDemand && data.techDemand.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.techDemand.map((skill) => (
                    <div key={skill.skill_name} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-tech-neon">#{skill.demand_rank}</span>
                          <span className="font-medium">{skill.skill_name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          skill.demand_tier === 'high_demand' ? 'bg-green-500/20 text-green-400' :
                          skill.demand_tier === 'moderate_demand' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {skill.demand_tier.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{skill.total_interactions} interactions</span>
                        <span className={`font-medium ${
                          skill.learning_priority === 'master_this' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {skill.learning_priority?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No skill demand data</p>
              )}
            </GlassCard>

            <GlassCard title="Learning Recommendations" subtitle="Based on visitor interest">
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                  <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                    <Zap size={16} /> Master These Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.techDemand?.filter(s => s.learning_priority === 'master_this').map(s => (
                      <span key={s.skill_name} className="px-2 py-1 bg-green-500/20 rounded text-xs">{s.skill_name}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <BookOpen size={16} /> Strengthen Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.techDemand?.filter(s => s.learning_priority === 'strengthen_skills').map(s => (
                      <span key={s.skill_name} className="px-2 py-1 bg-blue-500/20 rounded text-xs">{s.skill_name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Section 7: Domain & Career Insights */}
        <DashboardSection id="career" title="Career & Domain Insights" icon={Briefcase}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Domain Interest" subtitle="Industry verticals visitors explore">
              {data.domainRankings && data.domainRankings.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.domainRankings.map((domain) => (
                    <div key={domain.domain} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-tech-accent">#{domain.interest_rank}</span>
                          <span className="font-medium">{domain.domain}</span>
                        </div>
                        <span className="text-lg font-bold text-tech-neon">{domain.total_interest_score}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded ${
                          domain.demand_tier === 'high_demand' ? 'bg-green-500/20 text-green-400' :
                          domain.demand_tier === 'moderate_demand' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {domain.demand_tier?.replace('_', ' ')}
                        </span>
                        <span className="text-muted-foreground">{domain.portfolio_recommendation?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No domain data</p>
              )}
            </GlassCard>

            <GlassCard title="Experience Interest" subtitle="Which roles attract attention">
              {data.experienceRankings && data.experienceRankings.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.experienceRankings.map((exp) => (
                    <div key={exp.experience_id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-tech-neon">#{exp.interest_rank}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          exp.role_attractiveness === 'most_attractive_role' ? 'bg-green-500/20 text-green-400' :
                          exp.role_attractiveness === 'high_interest_role' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {exp.role_attractiveness?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{exp.experience_title}</h4>
                      <p className="text-xs text-muted-foreground">{exp.company}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span>{exp.total_interactions} interactions</span>
                        <span className="text-tech-accent">{exp.positioning_suggestion?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No experience data</p>
              )}
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Section 8: Conversion Intelligence */}
        <DashboardSection id="conversions" title="Conversion Intelligence" icon={Target}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 text-center">
              <Download size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-400">{data.conversionSummary.resume_downloads}</p>
              <p className="text-xs text-muted-foreground">Resume Downloads</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-center">
              <ExternalLink size={24} className="text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-400">{data.conversionSummary.social_clicks}</p>
              <p className="text-xs text-muted-foreground">Social Clicks</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 text-center">
              <FileText size={24} className="text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-400">{data.conversionSummary.form_starts}</p>
              <p className="text-xs text-muted-foreground">Form Starts</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center">
              <BookOpen size={24} className="text-amber-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-400">{data.conversionSummary.publication_clicks}</p>
              <p className="text-xs text-muted-foreground">Publication Clicks</p>
            </div>
          </div>

          <GlassCard title="Conversion Funnel" subtitle="Visitor journey to conversion">
            <div className="mt-4">
              <ConversionFunnelViz
                data={{
                  cta_views: data.conversionSummary.cta_views,
                  cta_clicks: data.conversionSummary.cta_clicks,
                  form_starts: data.conversionSummary.form_starts,
                  form_submissions: data.conversionSummary.form_submissions,
                  resume_downloads: data.conversionSummary.resume_downloads,
                  social_clicks: data.conversionSummary.social_clicks,
                }}
              />
            </div>
          </GlassCard>
        </DashboardSection>

        {/* Section 9: Temporal Patterns */}
        <DashboardSection id="temporal" title="Temporal Patterns" icon={Clock}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Hourly Distribution" subtitle="Best times for engagement">
              {data.temporal.hourlyDistribution && data.temporal.hourlyDistribution.length > 0 ? (
                <div className="space-y-1 mt-4 max-h-[400px] overflow-y-auto">
                  {data.temporal.hourlyDistribution.map((item) => {
                    const maxSessions = Math.max(...data.temporal.hourlyDistribution.map(h => h.sessions));
                    const width = maxSessions > 0 ? (item.sessions / maxSessions) * 100 : 0;
                    return (
                      <div key={item.hour} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">{item.hour}:00</span>
                        <div className="flex-1 h-5 bg-muted/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-tech-neon to-tech-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.5, delay: item.hour * 0.02 }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{item.sessions}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No hourly data</p>
              )}
            </GlassCard>

            <GlassCard title="Day of Week" subtitle="Weekly traffic patterns">
              {data.temporal.dayOfWeekDistribution && data.temporal.dayOfWeekDistribution.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.temporal.dayOfWeekDistribution.map((item, i) => {
                    const maxSessions = Math.max(...data.temporal.dayOfWeekDistribution.map(d => d.sessions));
                    const width = maxSessions > 0 ? (item.sessions / maxSessions) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">{item.day_name || `Day ${item.day_number}`}</span>
                        <div className="flex-1 h-8 bg-muted/20 rounded-lg overflow-hidden relative">
                          <motion.div
                            className="h-full bg-gradient-to-r from-tech-accent to-tech-highlight rounded-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                          />
                        </div>
                        <div className="text-right w-16">
                          <span className="text-sm font-bold">{item.sessions}</span>
                          <span className="text-xs text-muted-foreground block">{item.engagement_rate?.toFixed(0) || 0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No day of week data</p>
              )}
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Section 10: Device & Technical */}
        <DashboardSection id="technical" title="Device & Technical" icon={Monitor}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard title="Device Categories" subtitle="How visitors access your site">
              {data.devices.categories && data.devices.categories.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.devices.categories.map((device, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {device.device_category === 'mobile' ? <Smartphone size={16} className="text-tech-neon" /> :
                           device.device_category === 'desktop' ? <Monitor size={16} className="text-tech-accent" /> :
                           <Monitor size={16} className="text-tech-highlight" />}
                          <span className="font-medium capitalize">{device.device_category}</span>
                        </div>
                        <span className="text-lg font-bold text-tech-neon">{device.sessions}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{device.unique_visitors} visitors</span>
                        <span>{device.engagement_rate?.toFixed(0) || 0}% engaged</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No device data</p>
              )}
            </GlassCard>

            <GlassCard title="Browsers" subtitle="Top browsers used">
              {data.devices.browsers && data.devices.browsers.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {data.devices.browsers.slice(0, 6).map((browser, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/20">
                      <span className="text-sm">{browser.browser || 'Unknown'}</span>
                      <span className="font-bold text-tech-accent">{browser.sessions}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No browser data</p>
              )}
            </GlassCard>

            <GlassCard title="Operating Systems" subtitle="OS distribution">
              {data.devices.operatingSystems && data.devices.operatingSystems.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {data.devices.operatingSystems.slice(0, 6).map((os, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/20">
                      <span className="text-sm">{os.operating_system || 'Unknown'}</span>
                      <span className="font-bold text-tech-highlight">{os.sessions}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No OS data</p>
              )}
            </GlassCard>
          </div>
        </DashboardSection>

        {/* Footer */}
        <footer className="py-12 border-t border-black/5 dark:border-white/5 mt-8">
          <div className="container text-center">
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Comprehensive Portfolio Analytics Dashboard
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Data from {data.dateRange.start} to {data.dateRange.end}
            </p>
            {metadata?.updatedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Cache updated: {new Date(metadata.updatedAt).toLocaleString()}
              </p>
            )}
            <Link to="/">
              <Button className="tech-btn gap-2 mt-6">
                <ArrowLeft size={16} />
                Back to Portfolio
              </Button>
            </Link>
          </div>
        </footer>
      </main>

      <ThemeToggle />
    </div>
  );
}
