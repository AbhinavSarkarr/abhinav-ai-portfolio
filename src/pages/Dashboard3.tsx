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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DashboardSection,
  GlassCard,
  ConversionFunnel as ConversionFunnelViz,
} from '@/components/dashboard';
import { ExecutiveSummaryCard } from '@/components/dashboard3/ExecutiveSummaryCard';
import { VisitorInsightsCard } from '@/components/dashboard3/VisitorInsightsCard';
import { PortfolioEngagementCard } from '@/components/dashboard3/PortfolioEngagementCard';
import { MarketDemandCard } from '@/components/dashboard3/MarketDemandCard';
import { ActivityPatternsCard } from '@/components/dashboard3/ActivityPatternsCard';
import { SectionInsightsCard } from '@/components/dashboard3/SectionInsightsCard';
import { ProjectMetricsChart, ProjectDetailedBreakdown, ProjectActionsSummary } from '@/components/dashboard3/ProjectAnalyticsAdvanced';
import {
  useDashboardData,
  type DateRangePreset,
  getPresetLabel,
  warmUpBackendAPI,
} from '@/hooks/useDashboardData';
import {
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronDown,
  Gauge,
  Globe,
  Users,
  FileText,
  Target,
  Clock,
  Download,
  ExternalLink,
  MessageSquare,
  Share2,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

// Chart theme
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

// Helper functions
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function getDaysAgoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

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
    'github': 'GitHub',
    'github.com': 'GitHub',
    'twitter': 'Twitter/X',
    'twitter.com': 'Twitter/X',
    't.co': 'Twitter/X',
    'x.com': 'Twitter/X',
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
        className="gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm border-tech-accent/20 hover:border-tech-accent/40 px-2 sm:px-3 h-8 sm:h-9 min-w-0"
      >
        <Calendar size={12} className="sm:hidden flex-shrink-0" />
        <Calendar size={14} className="hidden sm:block flex-shrink-0" />
        <span className="hidden md:inline truncate max-w-[120px]">{currentLabel}</span>
        <span className="hidden sm:inline md:hidden truncate max-w-[80px]">{currentLabel.length > 10 ? currentLabel.slice(0, 8) + '...' : currentLabel}</span>
        <span className="sm:hidden truncate max-w-[50px]">{currentLabel.length > 7 ? currentLabel.slice(0, 5) + '..' : currentLabel}</span>
        <ChevronDown size={12} className="sm:hidden flex-shrink-0" />
        <ChevronDown size={14} className="hidden sm:block flex-shrink-0" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => { setIsOpen(false); setShowCustomPicker(false); }} />
          <div className="absolute top-full right-0 mt-2 z-[70] bg-background border border-tech-accent/30 rounded-xl shadow-2xl p-2 min-w-[180px] sm:min-w-[220px]">
            {!showCustomPicker ? (
              <div className="flex flex-col">
                {DATE_PRESET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetSelect(option.value)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors ${
                      currentPreset === option.value
                        ? 'bg-tech-accent/20 text-tech-neon'
                        : 'hover:bg-tech-accent/10 active:bg-tech-accent/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
                      className="w-full px-3 py-2.5 sm:py-2 text-sm rounded border border-tech-accent/20 bg-background focus:border-tech-accent/40 outline-none min-h-[44px] sm:min-h-0"
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
                      className="w-full px-3 py-2.5 sm:py-2 text-sm rounded border border-tech-accent/20 bg-background focus:border-tech-accent/40 outline-none min-h-[44px] sm:min-h-0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowCustomPicker(false)} className="flex-1 text-xs min-h-[44px] sm:min-h-0">
                    Back
                  </Button>
                  <Button size="sm" onClick={handleCustomApply} className="flex-1 text-xs bg-tech-neon hover:bg-tech-neon/80 min-h-[44px] sm:min-h-0" disabled={!tempStart || !tempEnd}>
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

  // Prepare visitor segment data (handle both API key formats)
  const visitorSegmentData = {
    converters: data.visitorSegments?.converter?.count || data.visitorSegments?.converters?.count || 0,
    high_intent: data.visitorSegments?.high_intent?.count || 0,
    engaged_explorers: data.visitorSegments?.engaged_explorer?.count || data.visitorSegments?.engaged?.count || 0,
    returning_visitors: data.visitorSegments?.returning_visitor?.count || data.visitorSegments?.returning?.count || 0,
    casual_browsers: (data.visitorSegments?.casual_browser?.count || data.visitorSegments?.casual?.count || 0) + (data.visitorSegments?.engaged_new?.count || 0),
  };

  // Prepare traffic source pie chart data
  const aggregatedTrafficSources = data.trafficSources.reduce((acc, source) => {
    const formattedName = formatTrafficSource(source.traffic_source);
    if (acc[formattedName]) {
      acc[formattedName] += source.sessions;
    } else {
      acc[formattedName] = source.sessions;
    }
    return acc;
  }, {} as Record<string, number>);

  const trafficSourcePieData = Object.entries(aggregatedTrafficSources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], index) => ({
      name,
      value,
      color: [chartColors.primary, chartColors.accent, chartColors.highlight, chartColors.success, chartColors.warning, chartColors.muted][index],
    }));

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
        <div className="container px-3 sm:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
                <ArrowLeft size={12} className="sm:hidden" />
                <ArrowLeft size={14} className="hidden sm:block" />
                <span className="hidden sm:inline">Portfolio</span>
              </Button>
            </Link>
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center flex-shrink-0">
                <LayoutDashboard size={16} className="text-white sm:hidden" />
                <LayoutDashboard size={20} className="text-white hidden sm:block md:hidden" />
                <LayoutDashboard size={24} className="text-white hidden md:block" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-tech-neon via-tech-accent to-tech-highlight bg-clip-text text-transparent truncate">
                  Analytics
                  <span className="hidden sm:inline"> Dashboard</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">
                  Portfolio Performance Insights
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <DateRangeSelector
              currentPreset={currentPreset}
              onPresetChange={handlePresetChange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomDateChange={handleCustomDateChange}
              metadata={metadata}
            />
            <Button variant="ghost" size="sm" onClick={refetch} className="gap-1.5 px-2 sm:px-3 h-8 sm:h-9">
              <RefreshCw size={12} className="sm:hidden" />
              <RefreshCw size={14} className="hidden sm:block" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-14 sm:pt-16 md:pt-20 lg:pt-24 relative z-10 px-2 sm:px-0">

        {/* ============================================ */}
        {/* SECTION 1: EXECUTIVE SUMMARY */}
        {/* ============================================ */}
        <DashboardSection
          id="executive"
          title="Executive Summary"
          subtitle="Overall portfolio performance at a glance"
          icon={Gauge}
          priority="high"
        >
          <ExecutiveSummaryCard
            uniqueVisitors={data.overview.uniqueVisitors}
            totalSessions={data.overview.totalSessions}
            engagementRate={data.overview.engagementRate}
            bounceRate={data.overview.bounceRate}
            avgSessionDuration={data.overview.avgSessionDuration}
            avgPagesPerSession={data.overview.avgPagesPerSession}
            totalConversions={data.overview.totalConversions}
          />

          {/* Traffic Sparkline */}
          {data.dailyMetrics && data.dailyMetrics.length > 0 && (
            <GlassCard title="Traffic Trend" subtitle="Daily visitors" className="mt-4">
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={data.dailyMetrics
                    .filter(d => d.date && d.date.trim() !== '' && d.date.includes('-'))
                    .map(d => {
                      try {
                        const parsedDate = parseISO(d.date);
                        if (isNaN(parsedDate.getTime())) return null;
                        return { date: format(parsedDate, 'MMM d'), Visitors: d.visitors || 0 };
                      } catch { return null; }
                    })
                    .filter(Boolean)}>
                    <defs>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip {...tooltipStyle} />
                    <Area type="monotone" dataKey="Visitors" stroke={chartColors.primary} fill="url(#visitorsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 2: CONVERSIONS */}
        {/* ============================================ */}
        <DashboardSection
          id="conversions"
          title="Conversions"
          subtitle="Key actions visitors took"
          icon={Target}
          priority="high"
        >
          {/* Conversion Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-4">
            {[
              { label: 'Resume', sublabel: 'Downloads', value: data.conversionSummary.resume_downloads, icon: Download, color: 'emerald', max: 10 },
              { label: 'Contact', sublabel: 'Submissions', value: data.conversionSummary.form_submissions, icon: MessageSquare, color: 'blue', max: 5 },
              { label: 'Social', sublabel: 'Clicks', value: data.conversionSummary.social_clicks, icon: Share2, color: 'purple', max: 20 },
              { label: 'Pubs', sublabel: 'Views', value: data.conversionSummary.publication_clicks, icon: BookOpen, color: 'amber', max: 15 },
              { label: 'Outbound', sublabel: 'Links', value: data.conversionSummary.outbound_clicks, icon: ExternalLink, color: 'cyan', max: 30 },
              { label: 'Copied', sublabel: 'Content', value: data.conversionSummary.content_copies, icon: FileText, color: 'pink', max: 10 },
            ].map((item, index) => {
              const colorClasses = {
                emerald: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/30', icon: 'bg-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
                blue: { bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/30', icon: 'bg-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
                purple: { bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/30', icon: 'bg-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
                amber: { bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/30', icon: 'bg-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
                cyan: { bg: 'from-cyan-500/10 to-cyan-500/5', border: 'border-cyan-500/30', icon: 'bg-cyan-500/20', text: 'text-cyan-400', bar: 'bg-cyan-500' },
                pink: { bg: 'from-pink-500/10 to-pink-500/5', border: 'border-pink-500/30', icon: 'bg-pink-500/20', text: 'text-pink-400', bar: 'bg-pink-500' },
              }[item.color];
              const percentage = Math.min(100, (item.value / item.max) * 100);
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className={`p-2 md:p-4 rounded-xl bg-gradient-to-br ${colorClasses.bg} border ${colorClasses.border}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg ${colorClasses.icon} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} className={`${colorClasses.text} md:hidden`} />
                        <Icon size={20} className={`${colorClasses.text} hidden md:block`} />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-lg md:text-2xl font-bold ${colorClasses.text}`}>{item.value}</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${colorClasses.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    />
                  </div>
                  <div className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-2">{item.sublabel}</div>
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

        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 3: AUDIENCE */}
        {/* ============================================ */}
        <DashboardSection
          id="audience"
          title="Audience"
          subtitle="Who visits your portfolio"
          icon={Users}
          priority="high"
        >
          <VisitorInsightsCard
            segments={visitorSegmentData}
            topVisitors={data.topVisitors || []}
            geographic={data.geographic}
            domainRankings={data.domainRankings || []}
            devices={data.devices.categories}
            browsers={data.devices.browsers || []}
            operatingSystems={data.devices.operatingSystems || []}
          />

        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 4: ACQUISITION */}
        {/* ============================================ */}
        <DashboardSection
          id="acquisition"
          title="Acquisition"
          subtitle="How visitors find you"
          icon={Globe}
          priority="medium"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Traffic Sources Pie */}
            <GlassCard title="Traffic Sources" subtitle="Discovery channels">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2">
                <div className="flex-shrink-0 w-[120px] h-[120px] sm:w-[160px] sm:h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourcePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
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
                <div className="flex-1 w-full space-y-1 sm:space-y-1.5">
                  {trafficSourcePieData.map((source) => (
                    <div key={source.name} className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: source.color }} />
                        <span className="text-[11px] sm:text-xs text-foreground">{source.name}</span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-foreground">{source.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Source Quality Comparison */}
            <GlassCard title="Source Quality" subtitle="Engagement & conversions by source">
              <div className="mt-3 space-y-3">
                {data.trafficSources.slice(0, 5).map((source, index) => {
                  const maxSessions = data.trafficSources[0]?.sessions || 1;
                  const width = (source.sessions / maxSessions) * 100;
                  const totalConversions = (source.conversions || 0) + (source.resume_downloads || 0);
                  const conversionRate = source.unique_visitors > 0
                    ? ((totalConversions / source.unique_visitors) * 100).toFixed(1)
                    : '0';
                  return (
                    <motion.div
                      key={source.traffic_source}
                      className="space-y-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          {formatTrafficSource(source.traffic_source)}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-[10px] text-muted-foreground">
                            {source.engagement_rate?.toFixed(0) || 0}% engaged
                          </span>
                          {totalConversions > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                              <Target size={10} />
                              {totalConversions}
                            </span>
                          )}
                          <span className="text-xs font-bold text-tech-accent">{source.sessions}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-tech-neon to-tech-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                      {/* Show conversion breakdown if any conversions */}
                      {totalConversions > 0 && (
                        <div className="flex items-center gap-3 text-[9px] text-muted-foreground pl-1">
                          {source.conversions > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare size={8} className="text-blue-400" />
                              {source.conversions} form{source.conversions !== 1 ? 's' : ''}
                            </span>
                          )}
                          {source.resume_downloads > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Download size={8} className="text-emerald-400" />
                              {source.resume_downloads} resume{source.resume_downloads !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-emerald-400/70">
                            ({conversionRate}% CVR)
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 5: CONTENT PERFORMANCE */}
        {/* ============================================ */}
        <DashboardSection
          id="content"
          title="Content Performance"
          subtitle="Projects, sections, skills, and experience"
          icon={FileText}
          priority="medium"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <PortfolioEngagementCard
              projects={data.projectRankings}
              sections={data.sectionRankings || []}
            />

            <div className="flex flex-col gap-3 sm:gap-4">
              <MarketDemandCard
                skills={data.techDemand || []}
                experiences={data.experienceRankings || []}
              />

              <SectionInsightsCard
                sections={data.sectionRankings || []}
              />
            </div>
          </div>

          {/* Detailed Project Analytics */}
          {data.projectRankings && data.projectRankings.length > 0 && (
            <>
              {/* Project Actions Summary */}
              <GlassCard title="Project Actions Overview" subtitle="Total interactions breakdown" className="mt-3 sm:mt-4 mb-3 sm:mb-4">
                <div className="mt-2">
                  <ProjectActionsSummary data={data.projectRankings} />
                </div>
              </GlassCard>

              {/* Advanced Project Analytics - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                {/* Stacked Multi-Metric Chart */}
                <GlassCard title="Project Metrics" subtitle="Views, clicks, GitHub, demo combined">
                  <div className="mt-2">
                    <ProjectMetricsChart data={data.projectRankings} />
                  </div>
                </GlassCard>

                {/* Detailed Breakdown per Project */}
                <GlassCard title="Action Breakdown" subtitle="Per-project interactions">
                  <div className="mt-2">
                    <ProjectDetailedBreakdown data={data.projectRankings} />
                  </div>
                </GlassCard>
              </div>

              {/* Project Rankings Table */}
              <GlassCard title="All Projects" subtitle="Ranked by engagement">
                <div className="overflow-x-auto mt-2 -mx-2 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm min-w-[500px] sm:min-w-0">
                    <thead>
                      <tr className="border-b border-muted">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-muted-foreground font-medium">Rank</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-muted-foreground font-medium">Project</th>
                        <th className="text-right py-2 sm:py-3 px-2 sm:px-3 text-muted-foreground font-medium">Views</th>
                        <th className="text-right py-2 sm:py-3 px-2 sm:px-3 text-muted-foreground font-medium">Clicks</th>
                        <th className="text-right py-2 sm:py-3 px-2 sm:px-3 text-muted-foreground font-medium hidden sm:table-cell">Score</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-muted-foreground font-medium hidden md:table-cell">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projectRankings.map((project) => (
                        <tr key={project.project_id} className="border-b border-muted/50 hover:bg-muted/10 transition-colors">
                          <td className="py-2 sm:py-3 px-2 sm:px-3">
                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-sm font-bold ${
                              project.overall_rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                              project.overall_rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                              project.overall_rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {project.overall_rank}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-foreground max-w-[120px] sm:max-w-none truncate">{project.project_title}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 text-right text-foreground">{project.total_unique_viewers}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 text-right font-bold text-tech-neon">{project.total_clicks}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 text-right font-bold text-tech-accent hidden sm:table-cell">{project.engagement_score}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
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
          )}

        </DashboardSection>

        {/* ============================================ */}
        {/* SECTION 6: ACTIVITY PATTERNS */}
        {/* ============================================ */}
        <DashboardSection
          id="activity"
          title="Activity Patterns"
          subtitle="When visitors are most active"
          icon={Clock}
          priority="low"
        >
          <ActivityPatternsCard temporal={data.temporal} />

        </DashboardSection>

        {/* ============================================ */}
        {/* FOOTER */}
        {/* ============================================ */}
        <footer className="py-4 sm:py-6 border-t border-black/5 dark:border-white/5 mt-3 sm:mt-4">
          <div className="container text-center px-4">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
              <LayoutDashboard size={14} className="text-tech-accent sm:hidden" />
              <LayoutDashboard size={16} className="text-tech-accent hidden sm:block" />
              <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-tech-neon to-tech-accent bg-clip-text text-transparent">
                Portfolio Analytics
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
              <span className="block sm:inline">Data: {data.dateRange.start} to {data.dateRange.end}</span>
              {metadata?.updatedAt && <span className="block sm:inline sm:before:content-['_•_']">Updated: {new Date(metadata.updatedAt).toLocaleDateString()}</span>}
            </p>
            <Link to="/">
              <Button className="tech-btn gap-1.5 sm:gap-2 mt-3 sm:mt-4 min-h-[44px] sm:min-h-0" size="sm">
                <ArrowLeft size={12} className="sm:hidden" />
                <ArrowLeft size={14} className="hidden sm:block" />
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
