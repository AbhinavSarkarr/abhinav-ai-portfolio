import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  DashboardSection,
  GlassCard,
  TrafficTrendChart,
  VisitorSegmentChart,
  ConversionFunnel as ConversionFunnelViz,
  InsightCard,
  SectionConclusion,
  HeroKPI,
  StatRow,
  ProgressMetric,
  ConversionSummary,
  ComparisonBar,
} from '@/components/dashboard';
import { HealthScoreGauge } from '@/components/dashboard3/HealthScoreGauge';
import { AlertBanner, type Alert } from '@/components/dashboard3/AlertBanner';
import { InfoTooltip, analyticsDictionary } from '@/components/dashboard/InfoTooltip';
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
  MessageSquare,
  Share2,
  Trophy,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Lightbulb,
  CheckCircle2,
  Star,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

// Chart theme for consistent styling
const chartColors = {
  primary: '#7B42F6',
  accent: '#00E0FF',
  highlight: '#FF3DDB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#6B7280',
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(17, 17, 27, 0.95)',
    border: '1px solid rgba(123, 66, 246, 0.3)',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  labelStyle: { color: '#fff', fontWeight: 600, marginBottom: '4px' },
  itemStyle: { color: 'rgba(255,255,255,0.8)' },
};

// Date range preset options
const DATE_PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_14_days', label: 'Last 14 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'all_time', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
];

// Get yesterday's date
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Get date X days ago
function getDaysAgoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Format duration in human readable format
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Date Range Selector Component
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

  const yesterday = getYesterdayDate();
  const minDate = metadata?.dataStartDate || getDaysAgoDate(30);
  const maxDate = yesterday;

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
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowCustomPicker(false)} className="flex-1 text-xs">
                    Back
                  </Button>
                  <Button size="sm" onClick={handleCustomApply} className="flex-1 text-xs bg-tech-neon hover:bg-tech-neon/80" disabled={!tempStart || !tempEnd}>
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

// Calculate overall health score
function calculateHealthScore(data: DashboardData): number {
  if (!data) return 0;
  const engagementScore = Math.min(100, data.overview.engagementRate * 1.2);
  const bounceScore = Math.max(0, 100 - data.overview.bounceRate * 1.2);
  const conversionScore = Math.min(100, data.overview.totalConversions * 15);
  const sessionScore = Math.min(100, data.overview.totalSessions * 0.5);
  return Math.round((engagementScore * 0.35 + bounceScore * 0.25 + conversionScore * 0.25 + sessionScore * 0.15));
}

// Generate smart alerts based on data
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

// Generate executive insights
function generateExecutiveInsights(data: DashboardData) {
  const insights: Array<{ type: 'positive' | 'negative' | 'neutral' | 'warning' | 'action'; text: string }> = [];

  if (data.overview.engagementRate > 50) {
    insights.push({ type: 'positive', text: `Strong visitor engagement at ${data.overview.engagementRate.toFixed(1)}% - above industry average.` });
  } else {
    insights.push({ type: 'warning', text: `Engagement rate of ${data.overview.engagementRate.toFixed(1)}% could be improved with better content hooks.` });
  }

  if (data.conversionSummary.resume_downloads > 0) {
    insights.push({ type: 'positive', text: `${data.conversionSummary.resume_downloads} resume downloads indicate genuine recruiter interest.` });
  }

  if (data.overview.bounceRate > 50) {
    insights.push({ type: 'warning', text: `${data.overview.bounceRate.toFixed(1)}% bounce rate suggests improving first impressions.` });
  }

  const topTrafficSource = data.trafficSources[0];
  if (topTrafficSource) {
    insights.push({ type: 'neutral', text: `Primary traffic comes from ${topTrafficSource.traffic_source} (${topTrafficSource.sessions} sessions).` });
  }

  return insights;
}

// Main Dashboard Component
export default function Dashboard3() {
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

  useEffect(() => {
    warmUpBackendAPI();
    window.scrollTo(0, 0);
  }, []);

  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRange(preset);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setDateRange('custom', start, end);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative z-50">
        <motion.div
          className="flex flex-col items-center gap-4 bg-card/90 p-8 rounded-xl backdrop-blur-sm border border-border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <RefreshCw size={48} className="text-tech-neon animate-spin" />
          <p className="text-foreground font-medium text-lg">Loading Analytics Dashboard...</p>
          <p className="text-muted-foreground text-sm">Gathering insights from your portfolio data</p>
        </motion.div>
      </div>
    );
  }

  // Error state
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

  // Prepare chart data
  const visitorSegmentData = {
    converters: data.visitorSegments?.converter?.count || 0,
    high_intent: data.visitorSegments?.high_intent?.count || 0,
    engaged_explorers: data.visitorSegments?.engaged_explorer?.count || 0,
    returning_visitors: data.visitorSegments?.returning_visitor?.count || 0,
    casual_browsers: (data.visitorSegments?.casual_browser?.count || 0) + (data.visitorSegments?.engaged_new?.count || 0),
  };

  // Group geographic data
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

  // Prepare traffic source pie chart data
  const trafficSourcePieData = data.trafficSources.slice(0, 6).map((source, index) => ({
    name: source.traffic_source,
    value: source.sessions,
    color: [chartColors.primary, chartColors.accent, chartColors.highlight, chartColors.success, chartColors.warning, chartColors.muted][index],
  }));

  // Prepare device pie chart data
  const devicePieData = data.devices.categories.map((device, index) => ({
    name: device.device_category.charAt(0).toUpperCase() + device.device_category.slice(1),
    value: device.sessions,
    color: [chartColors.primary, chartColors.accent, chartColors.success][index],
  }));

  // Calculate health score
  const healthScore = calculateHealthScore(data);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background - matching portfolio */}
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
        <motion.div
          className="absolute top-2/3 left-1/2 w-64 h-64 bg-tech-highlight/5 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header - matching portfolio navbar style */}
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
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Portfolio Performance Insights
                </p>
              </div>
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

        {/* ============================================ */}
        {/* SECTION 1: EXECUTIVE SUMMARY (MOST IMPORTANT) */}
        {/* ============================================ */}
        <DashboardSection
          id="executive"
          title="Executive Summary"
          subtitle="Overall portfolio performance at a glance"
          description="This is your portfolio's overall health report. It shows how many people visited, how engaged they were, and whether they took meaningful actions like downloading your resume or contacting you."
          icon={Gauge}
          priority="high"
        >
          {/* Hero KPIs - 4 main metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <HeroKPI
              title="Total Visitors"
              value={formatNumber(data.overview.uniqueVisitors)}
              subtitle={`${data.overview.totalSessions} total sessions`}
              icon={Users}
              color="purple"
              tooltip="The number of individual people who visited your portfolio. One person visiting multiple times still counts as one visitor."
            />
            <HeroKPI
              title="Engagement Rate"
              value={`${data.overview.engagementRate.toFixed(1)}%`}
              subtitle={`${(100 - data.overview.bounceRate).toFixed(0)}% stayed to explore`}
              icon={Heart}
              color="cyan"
              tooltip="Percentage of visitors who actively interacted with your portfolio - scrolled, clicked, or spent meaningful time reading."
            />
            <HeroKPI
              title="Avg. Time on Site"
              value={formatDuration(data.overview.avgSessionDuration)}
              subtitle={`${data.overview.avgPagesPerSession.toFixed(1)} pages viewed per visit`}
              icon={Clock}
              color="green"
              tooltip="Average time visitors spend exploring your portfolio. Longer times indicate more engaging content."
            />
            <HeroKPI
              title="Key Conversions"
              value={data.overview.totalConversions}
              subtitle={`${data.conversionSummary.resume_downloads} resumes + ${data.conversionSummary.form_submissions} contacts`}
              icon={Target}
              color="amber"
              tooltip="Important actions visitors took: downloading your resume, contacting you, or clicking on social profiles."
            />
          </div>

          {/* Health Score and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard title="Portfolio Health Score" subtitle="Your overall performance grade (0-100)">
              <div className="py-6 flex flex-col items-center">
                <HealthScoreGauge score={healthScore} label="Overall Health" size="lg" />
                <div className="mt-4 text-center max-w-sm">
                  <p className="text-sm text-muted-foreground">
                    {healthScore >= 80 && "Excellent! Your portfolio is performing very well with strong engagement."}
                    {healthScore >= 60 && healthScore < 80 && "Good performance! There's room to improve engagement and conversions."}
                    {healthScore >= 40 && healthScore < 60 && "Fair performance. Focus on improving content and calls-to-action."}
                    {healthScore < 40 && "Needs improvement. Consider enhancing content quality and promotion."}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Smart Insights" subtitle="Automated analysis of your data">
              <AlertBanner alerts={generateAlerts(data)} />
            </GlassCard>
          </div>

          {/* Section Conclusion */}
          <SectionConclusion insights={generateExecutiveInsights(data)} />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 2: CONVERSION PERFORMANCE */}
        {/* ============================================ */}
        <DashboardSection
          id="conversions"
          title="What Visitors Did"
          subtitle="Actions that matter: downloads, contacts, and clicks"
          description="These are the most important actions visitors took on your portfolio. Resume downloads and contact form submissions are strong signals of genuine interest from potential employers or clients."
          icon={Target}
          priority="high"
        >
          {/* Conversion Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Download size={24} className="text-emerald-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{data.conversionSummary.resume_downloads}</div>
              <div className="text-sm font-medium text-foreground">Resume Downloads</div>
              <div className="text-xs text-muted-foreground mt-1">People who saved your resume</div>
            </motion.div>

            <motion.div
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare size={24} className="text-blue-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{data.conversionSummary.form_submissions}</div>
              <div className="text-sm font-medium text-foreground">Contact Submissions</div>
              <div className="text-xs text-muted-foreground mt-1">People who reached out to you</div>
            </motion.div>

            <motion.div
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Share2 size={24} className="text-purple-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{data.conversionSummary.social_clicks}</div>
              <div className="text-sm font-medium text-foreground">Social Profile Clicks</div>
              <div className="text-xs text-muted-foreground mt-1">LinkedIn, GitHub, etc. visits</div>
            </motion.div>

            <motion.div
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <BookOpen size={24} className="text-amber-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{data.conversionSummary.publication_clicks}</div>
              <div className="text-sm font-medium text-foreground">Publication Views</div>
              <div className="text-xs text-muted-foreground mt-1">Articles and papers clicked</div>
            </motion.div>
          </div>

          {/* Conversion Funnel */}
          <GlassCard title="Visitor Journey Funnel" subtitle="How visitors move from viewing to taking action">
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

          <SectionConclusion
            insights={[
              data.conversionSummary.resume_downloads > 0
                ? { type: 'positive' as const, text: `${data.conversionSummary.resume_downloads} resume downloads show strong recruiter/employer interest in your profile.` }
                : { type: 'action' as const, text: 'No resume downloads yet. Consider making the download button more prominent.' },
              data.conversionSummary.form_submissions > 0
                ? { type: 'positive' as const, text: `${data.conversionSummary.form_submissions} people took the time to contact you directly.` }
                : { type: 'neutral' as const, text: 'No contact form submissions. This is normal if you have other contact methods available.' },
              { type: 'neutral' as const, text: `Total of ${data.overview.totalConversions} meaningful interactions from ${data.overview.uniqueVisitors} visitors.` },
            ]}
          />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 3: TRAFFIC SOURCES */}
        {/* ============================================ */}
        <DashboardSection
          id="traffic"
          title="Where Visitors Come From"
          subtitle="Traffic sources and geographic distribution"
          description="This shows how people discover your portfolio - whether through search engines, social media, direct links, or other websites. Understanding your traffic sources helps you know where to focus your promotion efforts."
          icon={Globe}
          priority="medium"
        >
          {/* Traffic Trend Chart */}
          {data.dailyMetrics && data.dailyMetrics.length > 0 && (
            <GlassCard title="Daily Visitor Trends" subtitle="How traffic changed over time" className="mb-6">
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.dailyMetrics.map(d => ({
                    date: format(parseISO(d.date), 'MMM d'),
                    Visitors: d.visitors,
                    Sessions: d.sessions,
                  }))}>
                    <defs>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Area type="monotone" dataKey="Visitors" stroke={chartColors.primary} fill="url(#visitorsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Sessions" stroke={chartColors.accent} fill="url(#sessionsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources Pie */}
            <GlassCard title="Traffic Sources" subtitle="Where your visitors discovered you">
              <div className="flex flex-col lg:flex-row items-center gap-6 mt-4">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={trafficSourcePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                      >
                        {trafficSourcePieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-2">
                  {trafficSourcePieData.map((source) => (
                    <div key={source.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                        <span className="text-sm text-foreground">{source.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{source.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Geographic Distribution */}
            <GlassCard title="Visitor Locations" subtitle="Top countries by visitors">
              <div className="space-y-3 mt-4">
                {topCountries.map(([country, stats], index) => {
                  const maxSessions = topCountries[0][1].sessions;
                  const width = (stats.sessions / maxSessions) * 100;
                  return (
                    <div key={country} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🌍'}
                          </span>
                          <span className="text-sm font-medium text-foreground">{country}</span>
                        </div>
                        <span className="text-sm font-semibold text-tech-accent">{stats.visitors} visitors</span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-tech-neon to-tech-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          <SectionConclusion
            insights={[
              { type: 'neutral' as const, text: `Your top traffic source is ${data.trafficSources[0]?.traffic_source || 'direct'} with ${data.trafficSources[0]?.sessions || 0} sessions.` },
              topCountries.length > 0 ? { type: 'neutral' as const, text: `Most visitors are from ${topCountries[0][0]} (${topCountries[0][1].visitors} visitors).` } : { type: 'neutral' as const, text: 'Geographic data is being collected.' },
              data.trafficSources.some(s => s.traffic_medium === 'social') ? { type: 'positive' as const, text: 'Social media is driving traffic - your LinkedIn/GitHub presence is working!' } : { type: 'action' as const, text: 'Consider sharing your portfolio on LinkedIn and other social platforms.' },
            ]}
          />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 4: VISITOR QUALITY */}
        {/* ============================================ */}
        <DashboardSection
          id="visitors"
          title="Who Your Visitors Are"
          subtitle="Visitor segments and quality analysis"
          description="Not all visitors are equal. This section shows you the quality of your visitors - from casual browsers to highly engaged potential employers. Understanding your audience helps you tailor your content."
          icon={Users}
          priority="medium"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Visitor Segments" subtitle="Categorized by engagement level">
              <div className="mt-4">
                <VisitorSegmentChart data={visitorSegmentData} height={280} />
              </div>
            </GlassCard>

            <GlassCard title="Devices Used" subtitle="How visitors access your portfolio">
              <div className="flex flex-col lg:flex-row items-center gap-6 mt-4">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={devicePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {devicePieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-3">
                  {data.devices.categories.map((device) => (
                    <div key={device.device_category} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        {device.device_category === 'mobile' ? (
                          <Smartphone size={16} className="text-tech-neon" />
                        ) : (
                          <Monitor size={16} className="text-tech-accent" />
                        )}
                        <span className="text-sm font-medium text-foreground capitalize">{device.device_category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{device.sessions}</div>
                        <div className="text-xs text-muted-foreground">{device.engagement_rate?.toFixed(0) || 0}% engaged</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          <SectionConclusion
            insights={[
              visitorSegmentData.converters > 0 ? { type: 'positive' as const, text: `${visitorSegmentData.converters} visitors converted by taking meaningful action.` } : { type: 'neutral' as const, text: 'Focus on converting casual browsers to engaged visitors.' },
              visitorSegmentData.high_intent > 0 ? { type: 'positive' as const, text: `${visitorSegmentData.high_intent} high-intent visitors showed strong interest (downloaded resume, viewed multiple projects).` } : { type: 'neutral' as const, text: 'High-intent visitors will come as your portfolio gets more exposure.' },
              { type: 'neutral' as const, text: `${data.devices.categories.find(d => d.device_category === 'mobile')?.sessions || 0} visitors used mobile devices - ensure your portfolio is mobile-friendly.` },
            ]}
          />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 5: PROJECT PERFORMANCE */}
        {/* ============================================ */}
        <DashboardSection
          id="projects"
          title="Project Performance"
          subtitle="Which projects attract the most attention"
          description="See which of your projects visitors are most interested in. High-performing projects should be featured prominently, while low-performing ones might need better descriptions or visuals."
          icon={FileText}
          priority="medium"
        >
          {data.projectRankings && data.projectRankings.length > 0 ? (
            <>
              {/* Top Projects Visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {data.projectRankings.slice(0, 3).map((project, index) => (
                  <motion.div
                    key={project.project_id}
                    className={`p-5 rounded-2xl border ${
                      index === 0 ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400/10 to-gray-400/5 border-gray-400/30' :
                      'bg-gradient-to-br from-orange-600/10 to-orange-600/5 border-orange-600/30'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">#{index + 1} Project</span>
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-2 line-clamp-1">{project.project_title}</h4>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-2xl font-bold text-tech-neon">{project.total_unique_viewers}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-tech-accent">{project.total_clicks}</div>
                        <div className="text-xs text-muted-foreground">Clicks</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Project Rankings Table */}
              <GlassCard title="All Projects Ranked" subtitle="Sorted by engagement score">
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-muted">
                        <th className="text-left py-3 px-3 text-muted-foreground font-medium">Rank</th>
                        <th className="text-left py-3 px-3 text-muted-foreground font-medium">Project</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Views</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Clicks</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-left py-3 px-3 text-muted-foreground font-medium">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projectRankings.map((project) => (
                        <tr key={project.project_id} className="border-b border-muted/50 hover:bg-muted/10 transition-colors">
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                              project.overall_rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                              project.overall_rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                              project.overall_rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {project.overall_rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-foreground">{project.project_title}</td>
                          <td className="py-3 px-3 text-right text-foreground">{project.total_unique_viewers}</td>
                          <td className="py-3 px-3 text-right font-bold text-tech-neon">{project.total_clicks}</td>
                          <td className="py-3 px-3 text-right font-bold text-tech-accent">{project.engagement_score}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.performance_tier === 'above_average' ? 'bg-emerald-500/20 text-emerald-400' :
                              project.performance_tier === 'average' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {project.performance_tier?.replace('_', ' ')}
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
            <GlassCard title="Project Data">
              <p className="text-center text-muted-foreground py-8">No project ranking data available yet</p>
            </GlassCard>
          )}

          {data.projectRankings && data.projectRankings.length > 0 && (
            <SectionConclusion
              insights={[
                { type: 'positive' as const, text: `"${data.projectRankings[0].project_title}" is your best performing project with ${data.projectRankings[0].total_clicks} clicks.` },
                data.projectRankings.some(p => p.performance_tier === 'below_average')
                  ? { type: 'action' as const, text: 'Some projects are underperforming - consider updating their descriptions or thumbnails.' }
                  : { type: 'positive' as const, text: 'All projects are performing at or above average!' },
                { type: 'neutral' as const, text: `Total of ${data.projectRankings.reduce((s, p) => s + p.total_clicks, 0)} project clicks across all projects.` },
              ]}
            />
          )}
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 6: SKILLS DEMAND */}
        {/* ============================================ */}
        <DashboardSection
          id="skills"
          title="Skills & Market Demand"
          subtitle="What skills visitors are looking for"
          description="This shows which of your skills visitors are most interested in. High-demand skills should be highlighted in your portfolio, while you might consider learning skills that visitors search for but you don't have."
          icon={Code}
          priority="low"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Skill Demand Rankings" subtitle="Which skills attract the most interest">
              {data.techDemand && data.techDemand.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.techDemand.slice(0, 8).map((skill, index) => (
                    <motion.div
                      key={skill.skill_name}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            skill.demand_rank <= 3 ? 'bg-tech-neon/20 text-tech-neon' : 'bg-muted text-muted-foreground'
                          }`}>
                            {skill.demand_rank}
                          </span>
                          <span className="font-medium text-foreground">{skill.skill_name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          skill.demand_tier === 'high_demand' ? 'bg-emerald-500/20 text-emerald-400' :
                          skill.demand_tier === 'moderate_demand' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {skill.demand_tier?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{skill.total_interactions} interactions</span>
                        <span className={`font-medium ${
                          skill.learning_priority === 'master_this' ? 'text-emerald-400' : 'text-blue-400'
                        }`}>
                          {skill.learning_priority?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No skill demand data available</p>
              )}
            </GlassCard>

            <GlassCard title="Learning Recommendations" subtitle="Based on visitor interest patterns">
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Zap size={16} /> High Demand Skills
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    These skills have the most visitor interest. Feature them prominently.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.techDemand?.filter(s => s.demand_tier === 'high_demand').slice(0, 6).map(s => (
                      <span key={s.skill_name} className="px-3 py-1.5 bg-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400">
                        {s.skill_name}
                      </span>
                    ))}
                    {(!data.techDemand || data.techDemand.filter(s => s.demand_tier === 'high_demand').length === 0) && (
                      <span className="text-xs text-muted-foreground">More data needed</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30">
                  <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <BookOpen size={16} /> Growing Interest
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Visitors are showing interest in these skills. Consider highlighting them.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.techDemand?.filter(s => s.demand_tier === 'moderate_demand').slice(0, 6).map(s => (
                      <span key={s.skill_name} className="px-3 py-1.5 bg-blue-500/20 rounded-lg text-xs font-medium text-blue-400">
                        {s.skill_name}
                      </span>
                    ))}
                    {(!data.techDemand || data.techDemand.filter(s => s.demand_tier === 'moderate_demand').length === 0) && (
                      <span className="text-xs text-muted-foreground">More data needed</span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {data.techDemand && data.techDemand.length > 0 && (
            <SectionConclusion
              insights={[
                { type: 'positive' as const, text: `"${data.techDemand[0].skill_name}" is your most in-demand skill with ${data.techDemand[0].total_interactions} interactions.` },
                { type: 'action' as const, text: 'Feature your high-demand skills prominently in your portfolio header and about section.' },
                { type: 'neutral' as const, text: `Visitors showed interest in ${data.techDemand.length} different skills from your portfolio.` },
              ]}
            />
          )}
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 7: WHEN VISITORS COME */}
        {/* ============================================ */}
        <DashboardSection
          id="temporal"
          title="When Visitors Come"
          subtitle="Timing patterns for your traffic"
          description="Understanding when visitors are most active helps you time your social media posts and portfolio updates for maximum visibility."
          icon={Clock}
          priority="low"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard title="Best Days of the Week" subtitle="Which days get the most traffic">
              {data.temporal.dayOfWeekDistribution && data.temporal.dayOfWeekDistribution.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {data.temporal.dayOfWeekDistribution.map((day, index) => {
                    const maxSessions = Math.max(...data.temporal.dayOfWeekDistribution.map(d => d.sessions));
                    const width = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">{day.day_name || `Day ${day.day_number}`}</span>
                        <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden relative">
                          <motion.div
                            className="h-full bg-gradient-to-r from-tech-neon to-tech-accent rounded-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground w-10 text-right">{day.sessions}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No day of week data available</p>
              )}
            </GlassCard>

            <GlassCard title="Best Hours of the Day" subtitle="When visitors are most active">
              {data.temporal.hourlyDistribution && data.temporal.hourlyDistribution.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.temporal.hourlyDistribution.filter((_, i) => i % 2 === 0).map(h => ({
                      hour: `${h.hour}:00`,
                      Sessions: h.sessions,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="Sessions" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No hourly data available</p>
              )}
            </GlassCard>
          </div>

          {data.temporal.dayOfWeekDistribution && data.temporal.dayOfWeekDistribution.length > 0 && (
            <SectionConclusion
              insights={[
                { type: 'neutral' as const, text: `Your busiest day is ${data.temporal.dayOfWeekDistribution.sort((a, b) => b.sessions - a.sessions)[0]?.day_name || 'weekdays'}.` },
                { type: 'action' as const, text: 'Post updates and share your portfolio when your audience is most active.' },
              ]}
            />
          )}
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 8: EXPERIENCE INTEREST */}
        {/* ============================================ */}
        {data.experienceRankings && data.experienceRankings.length > 0 && (
          <DashboardSection
            id="experience"
            title="Experience Interest"
            subtitle="Which of your work experiences attract attention"
            description="This shows which of your job experiences visitors are most interested in. High-interest roles might be worth expanding on or highlighting more prominently."
            icon={Briefcase}
            priority="low"
          >
            <GlassCard title="Experience Rankings" subtitle="Sorted by visitor interest">
              <div className="space-y-3 mt-4">
                {data.experienceRankings.map((exp, index) => (
                  <motion.div
                    key={exp.experience_id}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          exp.interest_rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                          exp.interest_rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                          exp.interest_rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {exp.interest_rank}
                        </span>
                        <div>
                          <h4 className="font-semibold text-foreground">{exp.experience_title}</h4>
                          <p className="text-xs text-muted-foreground">{exp.company}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exp.role_attractiveness === 'most_attractive_role' ? 'bg-emerald-500/20 text-emerald-400' :
                        exp.role_attractiveness === 'high_interest_role' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {exp.role_attractiveness?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{exp.total_interactions} interactions</span>
                      <span>{exp.total_unique_users} unique viewers</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <SectionConclusion
              insights={[
                { type: 'positive' as const, text: `Your "${data.experienceRankings[0].experience_title}" role at ${data.experienceRankings[0].company} is generating the most interest.` },
                { type: 'action' as const, text: 'Consider expanding the details on your most-viewed experiences.' },
              ]}
            />
          </DashboardSection>
        )}

        {/* ============================================ */}
        {/* FOOTER */}
        {/* ============================================ */}
        <footer className="py-12 border-t border-black/5 dark:border-white/5 mt-8">
          <div className="container text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <LayoutDashboard size={20} className="text-tech-accent" />
              <span className="text-lg font-bold bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent">
                Portfolio Analytics
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Designed for stakeholders who want clear insights without technical jargon
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Data from {data.dateRange.start} to {data.dateRange.end}
            </p>
            {metadata?.updatedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(metadata.updatedAt).toLocaleString()}
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
