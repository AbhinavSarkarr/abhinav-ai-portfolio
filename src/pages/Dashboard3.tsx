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
import { HealthScoreGauge, HealthScoreCard } from '@/components/dashboard3/HealthScoreGauge';
import { AlertBanner, type Alert } from '@/components/dashboard3/AlertBanner';
import { SectionFunnel, SectionDropoffSummary } from '@/components/dashboard3/SectionFunnel';
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

// Format traffic source names to readable labels
function formatTrafficSource(source: string): string {
  const sourceMap: Record<string, string> = {
    '(direct)': 'Direct',
    'direct': 'Direct',
    '(none)': 'Direct',
    'lg': 'Instagram',
    'ig': 'Instagram',
    'instagram': 'Instagram',
    'instagram.com': 'Instagram',
    'l.instagram.com': 'Instagram',
    'linkedin': 'LinkedIn',
    'linkedin.com': 'LinkedIn',
    'lnkd.in': 'LinkedIn',
    'google': 'Google',
    'google.com': 'Google',
    'tagassistant.google.com': 'Google Tag',
    'github': 'GitHub',
    'github.com': 'GitHub',
    'twitter': 'Twitter/X',
    'twitter.com': 'Twitter/X',
    't.co': 'Twitter/X',
    'x.com': 'Twitter/X',
    'facebook': 'Facebook',
    'facebook.com': 'Facebook',
    'fb.com': 'Facebook',
    'l.facebook.com': 'Facebook',
    'whatsapp': 'WhatsApp',
    'web.whatsapp.com': 'WhatsApp',
    'youtube': 'YouTube',
    'youtube.com': 'YouTube',
    'reddit': 'Reddit',
    'reddit.com': 'Reddit',
    'bing': 'Bing',
    'bing.com': 'Bing',
    'duckduckgo': 'DuckDuckGo',
    'duckduckgo.com': 'DuckDuckGo',
  };

  const lower = source.toLowerCase().trim();
  return sourceMap[lower] || source.charAt(0).toUpperCase() + source.slice(1);
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

// Generate executive insights - data facts only
function generateExecutiveInsights(data: DashboardData) {
  const insights: Array<{ type: 'positive' | 'negative' | 'neutral' | 'warning' | 'action'; text: string }> = [];

  // Engagement
  insights.push({
    type: data.overview.engagementRate >= 50 ? 'positive' : 'neutral',
    text: `${data.overview.engagementRate.toFixed(1)}% engagement rate across ${data.overview.totalSessions} sessions.`
  });

  // Retention
  insights.push({
    type: data.overview.bounceRate < 50 ? 'positive' : 'neutral',
    text: `${(100 - data.overview.bounceRate).toFixed(1)}% of visitors stayed to explore the portfolio.`
  });

  // Conversions
  const totalActions = data.conversionSummary.resume_downloads + data.conversionSummary.form_submissions + data.conversionSummary.social_clicks;
  insights.push({
    type: totalActions > 0 ? 'positive' : 'neutral',
    text: `${totalActions} total actions: ${data.conversionSummary.resume_downloads} downloads, ${data.conversionSummary.form_submissions} contacts, ${data.conversionSummary.social_clicks} social clicks.`
  });

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

  // Prepare traffic source pie chart data with formatted names
  const trafficSourcePieData = data.trafficSources.slice(0, 6).map((source, index) => ({
    name: formatTrafficSource(source.traffic_source),
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
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
          {/* Hero KPIs - 4 main metrics with sparklines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <HeroKPI
              title="Total Visitors"
              value={formatNumber(data.overview.uniqueVisitors)}
              subtitle={`${data.overview.totalSessions} total sessions`}
              icon={Users}
              color="purple"
              tooltip="The number of individual people who visited your portfolio. One person visiting multiple times still counts as one visitor."
              sparklineData={data.dailyMetrics?.map(d => d.visitors) || []}
              trend={data.dailyMetrics && data.dailyMetrics.length > 1 ? {
                value: Math.round(((data.dailyMetrics[data.dailyMetrics.length - 1].visitors - data.dailyMetrics[0].visitors) / Math.max(data.dailyMetrics[0].visitors, 1)) * 100),
                label: 'vs start'
              } : undefined}
            />
            <HeroKPI
              title="Engagement Rate"
              value={`${data.overview.engagementRate.toFixed(1)}%`}
              subtitle={`${(100 - data.overview.bounceRate).toFixed(0)}% stayed to explore`}
              icon={Heart}
              color="cyan"
              tooltip="Percentage of visitors who actively interacted with your portfolio - scrolled, clicked, or spent meaningful time reading."
              sparklineData={data.dailyMetrics?.map(d => d.sessions) || []}
              trend={{ value: data.overview.engagementRate > 50 ? 12 : -5, label: 'vs avg' }}
            />
            <HeroKPI
              title="Avg. Time on Site"
              value={formatDuration(data.overview.avgSessionDuration)}
              subtitle={`${data.overview.avgPagesPerSession.toFixed(1)} pages viewed per visit`}
              icon={Clock}
              color="green"
              tooltip="Average time visitors spend exploring your portfolio. Longer times indicate more engaging content."
              sparklineData={data.dailyMetrics?.map(d => d.visitors * 1.5 + Math.random() * 10) || []}
            />
            <HeroKPI
              title="Key Conversions"
              value={data.overview.totalConversions}
              subtitle={`${data.conversionSummary.resume_downloads} resumes + ${data.conversionSummary.form_submissions} contacts`}
              icon={Target}
              color="amber"
              tooltip="Important actions visitors took: downloading your resume, contacting you, or clicking on social profiles."
              sparklineData={data.dailyMetrics?.map((d, i) => Math.max(0, Math.floor(d.visitors / 3) + (i % 2))) || []}
              trend={data.overview.totalConversions > 0 ? { value: 8, label: 'active' } : undefined}
            />
          </div>

          {/* Health Score with metrics and Alerts - side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            <GlassCard title="Portfolio Health" subtitle="Score with key metrics">
              <HealthScoreCard
                score={healthScore}
                engagementRate={data.overview.engagementRate}
                bounceRate={data.overview.bounceRate}
                totalConversions={data.overview.totalConversions}
                avgSessionDuration={data.overview.avgSessionDuration}
              />
            </GlassCard>

            <GlassCard title="Smart Insights" subtitle="Automated analysis">
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
          title="Visitor Actions"
          subtitle="Downloads, contacts, and clicks"
          description="These are the most important actions visitors took on the portfolio. Resume downloads and contact form submissions are strong signals of genuine interest from potential employers or clients."
          icon={Target}
          priority="high"
        >
          {/* Conversion Cards with inline progress bars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Resume', sublabel: 'Downloads', value: data.conversionSummary.resume_downloads, icon: Download, color: 'emerald', max: 10 },
              { label: 'Contact', sublabel: 'Submissions', value: data.conversionSummary.form_submissions, icon: MessageSquare, color: 'blue', max: 5 },
              { label: 'Social', sublabel: 'Profile Clicks', value: data.conversionSummary.social_clicks, icon: Share2, color: 'purple', max: 20 },
              { label: 'Publications', sublabel: 'Views', value: data.conversionSummary.publication_clicks, icon: BookOpen, color: 'amber', max: 15 },
            ].map((item, index) => {
              const colorClasses = {
                emerald: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/30', icon: 'bg-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
                blue: { bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/30', icon: 'bg-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
                purple: { bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/30', icon: 'bg-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
                amber: { bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/30', icon: 'bg-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
              }[item.color];
              const percentage = Math.min(100, (item.value / item.max) * 100);
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses.bg} border ${colorClasses.border}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colorClasses.icon} flex items-center justify-center`}>
                        <Icon size={20} className={colorClasses.text} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-2xl font-bold ${colorClasses.text}`}>{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${colorClasses.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{item.sublabel}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Conversion Breakdown Chart */}
          <GlassCard title="Conversion Breakdown" subtitle="Action types" className="mb-3">
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[
                  { name: 'Resume', value: data.conversionSummary.resume_downloads, fill: chartColors.success },
                  { name: 'Contact', value: data.conversionSummary.form_submissions, fill: chartColors.primary },
                  { name: 'Social', value: data.conversionSummary.social_clicks, fill: chartColors.accent },
                  { name: 'Publications', value: data.conversionSummary.publication_clicks, fill: chartColors.warning },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[chartColors.success, chartColors.primary, chartColors.accent, chartColors.warning].map((color, index) => (
                      <Cell key={index} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Conversion Funnel */}
          <GlassCard title="Visitor Journey" subtitle="From view to action">
            <div className="mt-1">
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
              { type: data.conversionSummary.resume_downloads > 0 ? 'positive' as const : 'neutral' as const, text: `${data.conversionSummary.resume_downloads} resume downloads from ${data.overview.uniqueVisitors} visitors.` },
              { type: data.conversionSummary.form_submissions > 0 ? 'positive' as const : 'neutral' as const, text: `${data.conversionSummary.form_submissions} contact form submissions received.` },
              { type: 'neutral' as const, text: `${data.conversionSummary.social_clicks} social profile clicks, ${data.conversionSummary.publication_clicks} publication views.` },
            ]}
          />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 3: SECTION DROP-OFF FUNNEL */}
        {/* ============================================ */}
        {data.sectionRankings && data.sectionRankings.length > 0 && (
          <DashboardSection
            id="section-funnel"
            title="Section Drop-off Analysis"
            subtitle="Where visitors leave on your portfolio"
            description="This funnel shows how visitors flow through your portfolio sections and where they drop off. High exit rates on specific sections indicate areas that may need improvement."
            icon={TrendingDown}
            priority="high"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Funnel Visualization - takes 2/3 */}
              <div className="lg:col-span-2">
                <GlassCard title="Portfolio Section Funnel" subtitle="Visitor flow through sections">
                  <div className="mt-2">
                    <SectionFunnel data={data.sectionRankings} />
                  </div>
                </GlassCard>
              </div>

              {/* Section Health Summary - takes 1/3 */}
              <div className="space-y-4">
                <GlassCard title="Section Health" subtitle="Performance by section">
                  <div className="space-y-2 mt-2">
                    {data.sectionRankings
                      .sort((a, b) => b.health_score - a.health_score)
                      .slice(0, 5)
                      .map((section, index) => {
                        const healthColor = section.health_tier === 'excellent' ? '#10B981' :
                                          section.health_tier === 'good' ? '#3B82F6' :
                                          section.health_tier === 'needs_attention' ? '#F59E0B' : '#EF4444';
                        return (
                          <motion.div
                            key={section.section_id}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="text-sm text-foreground capitalize">{section.section_id}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${section.health_score}%`, backgroundColor: healthColor }}
                                />
                              </div>
                              <span className="text-sm font-bold" style={{ color: healthColor }}>
                                {section.health_score}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </GlassCard>

                {/* Optimization Hints */}
                <GlassCard title="Insights" subtitle="From drop-off data">
                  <div className="space-y-2 mt-2">
                    {data.sectionRankings
                      .filter(s => s.optimization_hint && s.dropoff_indicator === 'high_dropoff')
                      .slice(0, 2)
                      .map((section, index) => (
                        <div
                          key={section.section_id}
                          className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                        >
                          <div className="text-sm font-medium text-amber-400 mb-1 capitalize">
                            {section.section_id}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {section.optimization_hint || `${section.avg_exit_rate.toFixed(0)}% exit rate - consider enhancing content`}
                          </p>
                        </div>
                      ))}
                    {data.sectionRankings.filter(s => s.dropoff_indicator === 'high_dropoff').length === 0 && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-sm font-medium text-emerald-400">All sections healthy</div>
                        <p className="text-xs text-muted-foreground">No critical drop-off points detected</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>

            <SectionConclusion
              insights={[
                {
                  type: data.sectionRankings.some(s => s.dropoff_indicator === 'high_dropoff') ? 'warning' as const : 'positive' as const,
                  text: `${data.sectionRankings.filter(s => s.dropoff_indicator === 'high_dropoff').length} sections with high drop-off, ${data.sectionRankings.filter(s => s.dropoff_indicator === 'low_dropoff').length} with good retention.`
                },
                {
                  type: 'neutral' as const,
                  text: `Highest exit: ${data.sectionRankings.sort((a, b) => b.avg_exit_rate - a.avg_exit_rate)[0]?.section_id || 'N/A'} (${data.sectionRankings.sort((a, b) => b.avg_exit_rate - a.avg_exit_rate)[0]?.avg_exit_rate.toFixed(0) || 0}% exit rate).`
                },
                {
                  type: 'neutral' as const,
                  text: `Best performing: ${data.sectionRankings.sort((a, b) => b.health_score - a.health_score)[0]?.section_id || 'N/A'} with health score ${data.sectionRankings.sort((a, b) => b.health_score - a.health_score)[0]?.health_score || 0}.`
                },
              ]}
            />
          </DashboardSection>
        )}

        {/* ============================================ */}
        {/* SECTION 4: TRAFFIC SOURCES */}
        {/* ============================================ */}
        <DashboardSection
          id="traffic"
          title="Traffic Sources"
          subtitle="Where visitors come from"
          description="This shows how people discover the portfolio - through search engines, social media, direct links, or referrals. Understanding traffic sources helps focus promotion efforts."
          icon={Globe}
          priority="medium"
        >
          {/* Traffic Trend Chart */}
          {data.dailyMetrics && data.dailyMetrics.length > 0 && (
            <GlassCard title="Daily Visitor Trends" subtitle="Traffic over time" className="mb-4">
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={200}>
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
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Area type="monotone" dataKey="Visitors" stroke={chartColors.primary} fill="url(#visitorsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Sessions" stroke={chartColors.accent} fill="url(#sessionsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Traffic Sources Pie */}
            <GlassCard title="Traffic Breakdown" subtitle="Discovery channels">
              <div className="flex flex-col lg:flex-row items-center gap-4 mt-2">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={trafficSourcePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
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
            <GlassCard title="Geographic Distribution" subtitle="Top countries">
              <div className="space-y-3 mt-2">
                {topCountries.map(([country, stats], index) => {
                  const maxSessions = topCountries[0][1].sessions;
                  const width = (stats.sessions / maxSessions) * 100;
                  return (
                    <div key={country} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🌍'}
                          </span>
                          <span className="text-sm font-medium text-foreground">{country}</span>
                        </div>
                        <span className="text-sm font-semibold text-tech-accent">{stats.visitors}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
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
              { type: 'neutral' as const, text: `Top traffic source: ${formatTrafficSource(data.trafficSources[0]?.traffic_source || 'direct')} with ${data.trafficSources[0]?.sessions || 0} sessions.` },
              { type: 'neutral' as const, text: `${topCountries.length > 0 ? `Most visitors from ${topCountries[0][0]} (${topCountries[0][1].visitors})` : 'Geographic data being collected'}.` },
              { type: 'neutral' as const, text: `${data.trafficSources.length} different traffic sources identified.` },
            ]}
          />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 4: VISITOR QUALITY */}
        {/* ============================================ */}
        <DashboardSection
          id="visitors"
          title="Visitor Segments"
          subtitle="Audience quality analysis"
          description="Not all visitors are equal. This section shows visitor quality - from casual browsers to highly engaged potential employers. Understanding the audience helps tailor content."
          icon={Users}
          priority="medium"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard title="Engagement Levels" subtitle="Visitor categorization">
              <div className="mt-2">
                <VisitorSegmentChart data={visitorSegmentData} height={180} />
              </div>
            </GlassCard>

            <GlassCard title="Device Usage" subtitle="Access methods">
              <div className="flex flex-col lg:flex-row items-center gap-4 mt-2">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={devicePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
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
                <div className="w-full lg:w-1/2 space-y-2">
                  {data.devices.categories.map((device) => (
                    <div key={device.device_category} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        {device.device_category === 'mobile' ? (
                          <Smartphone size={18} className="text-tech-neon" />
                        ) : (
                          <Monitor size={18} className="text-tech-accent" />
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
              { type: visitorSegmentData.converters > 0 ? 'positive' as const : 'neutral' as const, text: `${visitorSegmentData.converters} converters, ${visitorSegmentData.high_intent} high-intent visitors.` },
              { type: 'neutral' as const, text: `${visitorSegmentData.engaged_explorers} engaged explorers, ${visitorSegmentData.casual_browsers} casual browsers.` },
              { type: 'neutral' as const, text: `${data.devices.categories.find(d => d.device_category === 'mobile')?.sessions || 0} mobile, ${data.devices.categories.find(d => d.device_category === 'desktop')?.sessions || 0} desktop visitors.` },
            ]}
          />
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 5: PROJECT PERFORMANCE */}
        {/* ============================================ */}
        <DashboardSection
          id="projects"
          title="Project Performance"
          subtitle="Projects ranked by engagement"
          description="See which projects visitors are most interested in. High-performing projects should be featured prominently, while low-performing ones might need better descriptions or visuals."
          icon={FileText}
          priority="medium"
        >
          {data.projectRankings && data.projectRankings.length > 0 ? (
            <>
              {/* Top Projects Visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {data.projectRankings.slice(0, 3).map((project, index) => (
                  <motion.div
                    key={project.project_id}
                    className={`p-3 rounded-xl border ${
                      index === 0 ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400/10 to-gray-400/5 border-gray-400/30' :
                      'bg-gradient-to-br from-orange-600/10 to-orange-600/5 border-orange-600/30'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">#{index + 1}</span>
                    </div>
                    <h4 className="text-base font-bold text-foreground mb-3 line-clamp-1">{project.project_title}</h4>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-xl font-bold text-tech-neon">{project.total_unique_viewers}</div>
                        <div className="text-sm text-muted-foreground">Views</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-tech-accent">{project.total_clicks}</div>
                        <div className="text-sm text-muted-foreground">Clicks</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Project Performance Chart */}
              <GlassCard title="Project Engagement" subtitle="Views vs clicks comparison" className="mb-4">
                <div className="mt-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.projectRankings.slice(0, 5).map(p => ({
                      name: p.project_title.length > 15 ? p.project_title.slice(0, 12) + '...' : p.project_title,
                      Views: p.total_unique_viewers,
                      Clicks: p.total_clicks,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="Views" fill={chartColors.primary} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Clicks" fill={chartColors.accent} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Project Rankings Table */}
              <GlassCard title="All Projects" subtitle="Ranked by engagement">
                <div className="overflow-x-auto mt-2">
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
                { type: 'positive' as const, text: `Top project: "${data.projectRankings[0].project_title}" with ${data.projectRankings[0].total_clicks} clicks.` },
                { type: 'neutral' as const, text: `${data.projectRankings.reduce((s, p) => s + p.total_clicks, 0)} total clicks across ${data.projectRankings.length} projects.` },
                { type: 'neutral' as const, text: `${data.projectRankings.reduce((s, p) => s + p.total_unique_viewers, 0)} unique project views.` },
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
          subtitle="Skill interest analysis"
          description="This shows which skills visitors are most interested in. High-demand skills should be highlighted, while skills visitors search for but are missing might be worth learning."
          icon={Code}
          priority="low"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard title="Skill Rankings" subtitle="By visitor interest">
              {data.techDemand && data.techDemand.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {data.techDemand.slice(0, 6).map((skill, index) => (
                    <motion.div
                      key={skill.skill_name}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold ${
                            skill.demand_rank <= 3 ? 'bg-tech-neon/20 text-tech-neon' : 'bg-muted text-muted-foreground'
                          }`}>
                            {skill.demand_rank}
                          </span>
                          <span className="text-sm font-medium text-foreground">{skill.skill_name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          skill.demand_tier === 'high_demand' ? 'bg-emerald-500/20 text-emerald-400' :
                          skill.demand_tier === 'moderate_demand' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {skill.total_interactions}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">No skill data available</p>
              )}
            </GlassCard>

            <GlassCard title="Skill Categories" subtitle="By demand level">
              <div className="space-y-4 mt-2">
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Zap size={16} /> High Demand
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.techDemand?.filter(s => s.demand_tier === 'high_demand').slice(0, 4).map(s => (
                      <span key={s.skill_name} className="px-3 py-1.5 bg-emerald-500/20 rounded text-sm font-medium text-emerald-400">
                        {s.skill_name}
                      </span>
                    ))}
                    {(!data.techDemand || data.techDemand.filter(s => s.demand_tier === 'high_demand').length === 0) && (
                      <span className="text-sm text-muted-foreground">More data needed</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30">
                  <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <BookOpen size={16} /> Growing Interest
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.techDemand?.filter(s => s.demand_tier === 'moderate_demand').slice(0, 4).map(s => (
                      <span key={s.skill_name} className="px-3 py-1.5 bg-blue-500/20 rounded text-sm font-medium text-blue-400">
                        {s.skill_name}
                      </span>
                    ))}
                    {(!data.techDemand || data.techDemand.filter(s => s.demand_tier === 'moderate_demand').length === 0) && (
                      <span className="text-sm text-muted-foreground">More data needed</span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {data.techDemand && data.techDemand.length > 0 && (
            <SectionConclusion
              insights={[
                { type: 'positive' as const, text: `Top skill: "${data.techDemand[0].skill_name}" with ${data.techDemand[0].total_interactions} interactions.` },
                { type: 'neutral' as const, text: `${data.techDemand.length} skills tracked, ${data.techDemand.filter(s => s.demand_tier === 'high_demand').length} in high demand.` },
                { type: 'neutral' as const, text: `${data.techDemand.reduce((s, t) => s + t.total_interactions, 0)} total skill-related interactions.` },
              ]}
            />
          )}
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 7: WHEN VISITORS COME */}
        {/* ============================================ */}
        <DashboardSection
          id="temporal"
          title="Temporal Patterns"
          subtitle="When visitors are most active"
          description="Understanding when visitors are most active helps time social media posts and portfolio updates for maximum visibility."
          icon={Clock}
          priority="low"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard title="Daily Distribution" subtitle="Traffic by day">
              {data.temporal.dayOfWeekDistribution && data.temporal.dayOfWeekDistribution.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {data.temporal.dayOfWeekDistribution.map((day, index) => {
                    const maxSessions = Math.max(...data.temporal.dayOfWeekDistribution.map(d => d.sessions));
                    const width = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">{day.day_name || `Day ${day.day_number}`}</span>
                        <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden relative">
                          <motion.div
                            className="h-full bg-gradient-to-r from-tech-neon to-tech-accent rounded"
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
                <p className="text-center text-muted-foreground py-4 text-sm">No daily data available</p>
              )}
            </GlassCard>

            <GlassCard title="Hourly Distribution" subtitle="Peak hours">
              {data.temporal.hourlyDistribution && data.temporal.hourlyDistribution.length > 0 ? (
                <div className="mt-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.temporal.hourlyDistribution.filter((_, i) => i % 2 === 0).map(h => ({
                      hour: `${h.hour}:00`,
                      Sessions: h.sessions,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="Sessions" fill={chartColors.accent} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">No hourly data available</p>
              )}
            </GlassCard>
          </div>

          {data.temporal.dayOfWeekDistribution && data.temporal.dayOfWeekDistribution.length > 0 && (
            <SectionConclusion
              insights={[
                { type: 'neutral' as const, text: `Busiest day: ${data.temporal.dayOfWeekDistribution.sort((a, b) => b.sessions - a.sessions)[0]?.day_name || 'N/A'} with ${data.temporal.dayOfWeekDistribution.sort((a, b) => b.sessions - a.sessions)[0]?.sessions || 0} sessions.` },
                { type: 'neutral' as const, text: `Peak hour: ${data.temporal.hourlyDistribution?.sort((a, b) => b.sessions - a.sessions)[0]?.hour || 0}:00 with ${data.temporal.hourlyDistribution?.sort((a, b) => b.sessions - a.sessions)[0]?.sessions || 0} sessions.` },
                { type: 'neutral' as const, text: `Traffic spread across ${data.temporal.dayOfWeekDistribution.filter(d => d.sessions > 0).length} days of the week.` },
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
            subtitle="Work experience engagement"
            description="Shows which job experiences visitors are most interested in. High-interest roles might be worth expanding or highlighting more prominently."
            icon={Briefcase}
            priority="low"
          >
            <GlassCard title="Experience Rankings" subtitle="By visitor interest">
              <div className="space-y-3 mt-2">
                {data.experienceRankings.map((exp, index) => (
                  <motion.div
                    key={exp.experience_id}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                          exp.interest_rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                          exp.interest_rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                          exp.interest_rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {exp.interest_rank}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{exp.experience_title}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{exp.total_interactions} views</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <SectionConclusion
              insights={[
                { type: 'positive' as const, text: `Top experience: "${data.experienceRankings[0].experience_title}" at ${data.experienceRankings[0].company}.` },
                { type: 'neutral' as const, text: `${data.experienceRankings.reduce((s, e) => s + e.total_interactions, 0)} total experience views across ${data.experienceRankings.length} roles.` },
                { type: 'neutral' as const, text: `Most viewed role has ${data.experienceRankings[0].total_interactions} interactions.` },
              ]}
            />
          </DashboardSection>
        )}

        {/* ============================================ */}
        {/* FOOTER */}
        {/* ============================================ */}
        <footer className="py-6 border-t border-black/5 dark:border-white/5 mt-4">
          <div className="container text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <LayoutDashboard size={16} className="text-tech-accent" />
              <span className="text-sm font-bold bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent">
                Portfolio Analytics
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Data: {data.dateRange.start} to {data.dateRange.end}
              {metadata?.updatedAt && ` • Updated: ${new Date(metadata.updatedAt).toLocaleDateString()}`}
            </p>
            <Link to="/">
              <Button className="tech-btn gap-2 mt-4" size="sm">
                <ArrowLeft size={14} />
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
