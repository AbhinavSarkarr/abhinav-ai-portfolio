import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import {
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  Clock,
  Download,
  MessageSquare,
  Star,
  TrendingUp,
  Zap,
  UserCheck,
  Target,
  Compass,
  RefreshCw,
  ChevronRight,
  Chrome,
} from 'lucide-react';
import { TechStackedBar } from './TechBreakdown';

// Types
interface TopVisitor {
  user_pseudo_id: string;
  total_sessions: number;
  total_page_views: number;
  avg_session_duration_sec: number;
  primary_country: string;
  resume_downloads: number;
  form_submissions: number;
  visitor_value_score: number;
  visitor_segment: string;
}

interface DomainRanking {
  domain: string;
  total_interest_score: number;
  demand_tier: string;
}

interface DeviceCategory {
  device_category: string;
  sessions: number;
  engagement_rate?: number;
}

interface GeographicEntry {
  country: string;
  sessions: number;
  unique_visitors: number;
}

interface VisitorSegments {
  converters: number;
  high_intent: number;
  engaged_explorers: number;
  returning_visitors: number;
  casual_browsers: number;
}

interface BrowserData {
  browser: string;
  sessions: number;
  unique_visitors: number;
}

interface OSData {
  operating_system: string;
  sessions: number;
  unique_visitors: number;
}

interface VisitorInsightsCardProps {
  segments: VisitorSegments;
  topVisitors: TopVisitor[];
  geographic: GeographicEntry[];
  domainRankings: DomainRanking[];
  devices: DeviceCategory[];
  browsers?: BrowserData[];
  operatingSystems?: OSData[];
}

// Segment config
const SEGMENT_CONFIG = {
  converters: { label: 'Converters', color: '#10B981', icon: UserCheck },
  high_intent: { label: 'High Intent', color: '#F59E0B', icon: Target },
  engaged_explorers: { label: 'Explorers', color: '#7B42F6', icon: Compass },
  returning_visitors: { label: 'Returning', color: '#00E0FF', icon: RefreshCw },
  casual_browsers: { label: 'Casual', color: '#6B7280', icon: Eye },
};

// Tooltip style
const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(17, 17, 27, 0.95)',
    border: '1px solid rgba(123, 66, 246, 0.3)',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: '#fff', fontWeight: 600 },
};

// Helper functions
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function anonymizeId(id: string): string {
  if (!id || id.length < 8) return 'Visitor';
  return `Visitor ${id.slice(-4).toUpperCase()}`;
}

function formatDomain(domain: string): string {
  return domain
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSegmentConfig(segment: string) {
  const configs: Record<string, { color: string; icon: typeof Star; label: string }> = {
    'converter': { color: '#10B981', icon: Star, label: 'Converter' },
    'high_intent': { color: '#F59E0B', icon: Zap, label: 'High Intent' },
    'engaged_explorer': { color: '#3B82F6', icon: TrendingUp, label: 'Explorer' },
    'returning_visitor': { color: '#8B5CF6', icon: Users, label: 'Returning' },
    'casual_browser': { color: '#6B7280', icon: Eye, label: 'Casual' },
  };
  return configs[segment] || configs['casual_browser'];
}

type TabType = 'segments' | 'visitors' | 'geo' | 'domains' | 'devices' | 'tech';

export function VisitorInsightsCard({
  segments,
  topVisitors,
  geographic,
  domainRankings,
  devices,
  browsers,
  operatingSystems,
}: VisitorInsightsCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('segments');

  const tabs: { id: TabType; label: string; icon: typeof Users }[] = [
    { id: 'segments', label: 'Segments', icon: Users },
    { id: 'visitors', label: 'Top Visitors', icon: Star },
    { id: 'geo', label: 'Geography', icon: Globe },
    { id: 'domains', label: 'Domains', icon: TrendingUp },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'tech', label: 'Tech', icon: Chrome },
  ];

  return (
    <motion.div
      className="rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] sm:min-h-0 ${
                isActive
                  ? 'text-tech-neon border-b-2 border-tech-neon bg-white/50 dark:bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/50'
              }`}
            >
              <Icon size={12} className="sm:hidden flex-shrink-0" />
              <Icon size={14} className="hidden sm:block flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-3 sm:p-4">
        {activeTab === 'segments' && (
          <SegmentsView segments={segments} />
        )}
        {activeTab === 'visitors' && (
          <TopVisitorsView visitors={topVisitors} />
        )}
        {activeTab === 'geo' && (
          <GeographyView geographic={geographic} />
        )}
        {activeTab === 'domains' && (
          <DomainsView domains={domainRankings} />
        )}
        {activeTab === 'devices' && (
          <DevicesView devices={devices} />
        )}
        {activeTab === 'tech' && (
          <TechView browsers={browsers || []} operatingSystems={operatingSystems || []} />
        )}
      </div>
    </motion.div>
  );
}

// Segments View
function SegmentsView({ segments }: { segments: VisitorSegments }) {
  const chartData = Object.entries(segments)
    .map(([key, value]) => ({
      name: key,
      value,
      ...SEGMENT_CONFIG[key as keyof typeof SEGMENT_CONFIG],
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No segment data available yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      {/* Pie Chart */}
      <div className="flex-shrink-0 w-[120px] h-[120px] sm:w-[160px] sm:h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius="85%"
              innerRadius="50%"
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-1 sm:space-y-1.5">
        {chartData.map((segment) => {
          const Icon = segment.icon;
          const percentage = ((segment.value / total) * 100).toFixed(0);
          return (
            <div
              key={segment.name}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-white/5"
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${segment.color}20` }}
              >
                <Icon size={10} className="sm:hidden" style={{ color: segment.color }} />
                <Icon size={12} className="hidden sm:block" style={{ color: segment.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-medium text-foreground">{segment.label}</span>
                  <span className="text-[11px] sm:text-xs font-bold" style={{ color: segment.color }}>
                    {segment.value} ({percentage}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Top Visitors View
function TopVisitorsView({ visitors }: { visitors: TopVisitor[] }) {
  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No visitor data available</p>
      </div>
    );
  }

  const topVisitors = [...visitors]
    .sort((a, b) => b.visitor_value_score - a.visitor_value_score)
    .slice(0, 5);
  const maxScore = Math.max(...topVisitors.map(v => v.visitor_value_score));

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {topVisitors.map((visitor, index) => {
        const segmentConfig = getSegmentConfig(visitor.visitor_segment);
        const scoreWidth = (visitor.visitor_value_score / maxScore) * 100;

        return (
          <motion.div
            key={visitor.user_pseudo_id}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-white/5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: `${segmentConfig.color}20`, color: segmentConfig.color }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
                      {anonymizeId(visitor.user_pseudo_id)}
                    </span>
                    <span
                      className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium flex-shrink-0"
                      style={{ backgroundColor: `${segmentConfig.color}20`, color: segmentConfig.color }}
                    >
                      {segmentConfig.label}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-tech-accent flex-shrink-0 ml-1">
                    {visitor.visitor_value_score}
                  </span>
                </div>
                <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: segmentConfig.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreWidth}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[9px] sm:text-[10px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-0.5">
                    <Eye size={8} className="sm:hidden" />
                    <Eye size={10} className="hidden sm:block" />
                    {visitor.total_page_views}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={8} className="sm:hidden" />
                    <Clock size={10} className="hidden sm:block" />
                    {formatDuration(visitor.avg_session_duration_sec)}
                  </span>
                  {visitor.resume_downloads > 0 && (
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <Download size={8} className="sm:hidden" />
                      <Download size={10} className="hidden sm:block" />
                      {visitor.resume_downloads}
                    </span>
                  )}
                  {visitor.form_submissions > 0 && (
                    <span className="flex items-center gap-0.5 text-blue-400">
                      <MessageSquare size={8} className="sm:hidden" />
                      <MessageSquare size={10} className="hidden sm:block" />
                      {visitor.form_submissions}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-muted/20">
        <div className="text-center p-1.5 sm:p-2 rounded-lg bg-emerald-500/10">
          <div className="text-sm sm:text-lg font-bold text-emerald-400">
            {visitors.filter(v => v.visitor_segment === 'converter').length}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">Converters</div>
        </div>
        <div className="text-center p-1.5 sm:p-2 rounded-lg bg-amber-500/10">
          <div className="text-sm sm:text-lg font-bold text-amber-400">
            {visitors.filter(v => v.visitor_segment === 'high_intent').length}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">High Intent</div>
        </div>
        <div className="text-center p-1.5 sm:p-2 rounded-lg bg-tech-accent/10">
          <div className="text-sm sm:text-lg font-bold text-tech-accent">
            {Math.round(visitors.reduce((s, v) => s + v.visitor_value_score, 0) / visitors.length)}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">Avg Score</div>
        </div>
      </div>
    </div>
  );
}

// Geography View
function GeographyView({ geographic }: { geographic: GeographicEntry[] }) {
  const countryData = geographic.reduce((acc, item) => {
    if (!acc[item.country]) {
      acc[item.country] = { sessions: 0, visitors: 0 };
    }
    acc[item.country].sessions += item.sessions;
    acc[item.country].visitors += item.unique_visitors;
    return acc;
  }, {} as Record<string, { sessions: number; visitors: number }>);

  const topCountries = Object.entries(countryData)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 6);

  if (topCountries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No geographic data available</p>
      </div>
    );
  }

  const maxSessions = topCountries[0][1].sessions;

  return (
    <div className="space-y-2">
      {topCountries.map(([country, stats], index) => {
        const width = (stats.sessions / maxSessions) * 100;
        return (
          <motion.div
            key={country}
            className="space-y-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🌍'}
                </span>
                <span className="text-sm font-medium text-foreground">{country}</span>
              </div>
              <span className="text-sm font-semibold text-tech-accent">{stats.visitors}</span>
            </div>
            <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-tech-neon to-tech-accent"
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Domains View
function DomainsView({ domains }: { domains: DomainRanking[] }) {
  if (!domains || domains.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No domain data available</p>
      </div>
    );
  }

  const radarData = domains.slice(0, 6).map(d => ({
    domain: formatDomain(d.domain).slice(0, 10),
    interest: d.total_interest_score,
  }));

  const maxInterest = Math.max(...domains.map(d => d.total_interest_score));

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Radar Chart */}
      <div className="h-[140px] sm:h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 5, right: 15, bottom: 5, left: 15 }}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="domain" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }} />
            <Radar
              name="Interest"
              dataKey="interest"
              stroke="#7B42F6"
              fill="#7B42F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain List */}
      <div className="space-y-1 sm:space-y-1.5">
        {domains.slice(0, 4).map((domain, index) => {
          const tierColor = domain.demand_tier === 'high_demand' ? '#10B981' :
                           domain.demand_tier === 'moderate_demand' ? '#3B82F6' : '#6B7280';
          const barWidth = (domain.total_interest_score / maxInterest) * 100;

          return (
            <motion.div
              key={domain.domain}
              className="flex items-center gap-1.5 sm:gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-[10px] sm:text-xs text-muted-foreground w-3 sm:w-4">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] sm:text-xs font-medium text-foreground truncate">
                    {formatDomain(domain.domain)}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold flex-shrink-0 ml-1" style={{ color: tierColor }}>
                    {domain.total_interest_score}
                  </span>
                </div>
                <div className="h-1 sm:h-1.5 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: tierColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Devices View
function DevicesView({ devices }: { devices: DeviceCategory[] }) {
  if (!devices || devices.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No device data available</p>
      </div>
    );
  }

  const devicePieData = devices.map((device, index) => ({
    name: device.device_category.charAt(0).toUpperCase() + device.device_category.slice(1),
    value: device.sessions,
    color: ['#7B42F6', '#00E0FF', '#F59E0B'][index] || '#6B7280',
  }));

  const total = devicePieData.reduce((sum, d) => sum + d.value, 0);
  const maxSessions = Math.max(...devices.map(d => d.sessions));

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stacked bar showing distribution */}
      <div className="h-6 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden flex">
        {devicePieData.map((device, index) => {
          const width = (device.value / total) * 100;
          return (
            <div
              key={index}
              className="h-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
              style={{ width: `${width}%`, backgroundColor: device.color }}
            >
              {width > 20 && `${width.toFixed(0)}%`}
            </div>
          );
        })}
      </div>

      {/* Device breakdown with progress bars */}
      <div className="space-y-2 sm:space-y-3">
        {devices.map((device) => {
          const barWidth = (device.sessions / maxSessions) * 100;
          const color = device.device_category === 'mobile' ? '#00E0FF' :
                       device.device_category === 'desktop' ? '#7B42F6' : '#F59E0B';
          const Icon = device.device_category === 'mobile' ? Smartphone :
                      device.device_category === 'desktop' ? Monitor : Tablet;

          return (
            <div key={device.device_category} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Icon size={14} className="sm:hidden" style={{ color }} />
                  <Icon size={16} className="hidden sm:block" style={{ color }} />
                  <span className="text-xs sm:text-sm font-medium text-foreground capitalize">
                    {device.device_category}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {device.engagement_rate?.toFixed(0) || 0}% engaged
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{device.sessions}</span>
                </div>
              </div>
              <div className="h-1.5 sm:h-2 bg-muted/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tech View (Browser/OS)
function TechView({ browsers, operatingSystems }: { browsers: BrowserData[]; operatingSystems: OSData[] }) {
  if ((!browsers || browsers.length === 0) && (!operatingSystems || operatingSystems.length === 0)) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No tech data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TechStackedBar browsers={browsers} operatingSystems={operatingSystems} />
    </div>
  );
}
