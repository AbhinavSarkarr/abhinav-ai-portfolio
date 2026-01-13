import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Clock,
  Target,
  Activity,
  Eye,
  MousePointer,
  Download,
  MessageSquare,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { InfoTooltip, analyticsDictionary } from './InfoTooltip';

// Large hero KPI card for the most important metrics
interface HeroKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: React.ElementType;
  color: 'purple' | 'cyan' | 'green' | 'amber' | 'pink';
  tooltip?: string;
  sparklineData?: number[];
}

const colorConfig = {
  purple: {
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    sparkline: '#a855f7',
  },
  cyan: {
    gradient: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    sparkline: '#22d3ee',
  },
  green: {
    gradient: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    sparkline: '#34d399',
  },
  amber: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    sparkline: '#fbbf24',
  },
  pink: {
    gradient: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    glow: 'shadow-pink-500/20',
    sparkline: '#f472b6',
  },
};

// Mini sparkline component
function Sparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-grad-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={parseFloat(points.split(' ').pop()?.split(',')[1] || '0')} r="3" fill={color} />
    </svg>
  );
}

export function HeroKPI({ title, value, subtitle, trend, icon: Icon, color, tooltip, sparklineData }: HeroKPIProps) {
  const config = colorConfig[color];

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-white/70 dark:bg-tech-glass/50
        backdrop-blur-xl border ${config.border}
        transition-all duration-300
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Left side: Icon + Metrics */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={config.text} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent leading-tight`}>
              {value}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-medium text-foreground truncate">{title}</span>
              {tooltip && (
                <InfoTooltip term={title} definition={tooltip} variant="icon" />
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side: Sparkline + Trend */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline data={sparklineData} color={config.sparkline} width={70} height={28} />
          )}
          {trend && (
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              trend.value > 0 ? 'bg-emerald-500/10 text-emerald-400' :
              trend.value < 0 ? 'bg-red-500/10 text-red-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {trend.value > 0 ? <ArrowUpRight size={12} /> : trend.value < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact stat row for secondary metrics
interface StatRowProps {
  metrics: Array<{
    label: string;
    value: string | number;
    icon?: React.ElementType;
    change?: number;
    tooltip?: string;
  }>;
}

export function StatRow({ metrics }: StatRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            {metric.icon && <metric.icon size={14} className="text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            {metric.tooltip && (
              <InfoTooltip term={metric.label} definition={metric.tooltip} variant="icon" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">{metric.value}</span>
            {metric.change !== undefined && (
              <span className={`text-xs font-medium ${
                metric.change > 0 ? 'text-emerald-400' :
                metric.change < 0 ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Visual progress bar with label
interface ProgressMetricProps {
  label: string;
  value: number;
  max?: number;
  format?: (value: number) => string;
  color?: 'purple' | 'cyan' | 'green' | 'amber' | 'pink';
  showPercentage?: boolean;
  tooltip?: string;
}

export function ProgressMetric({
  label,
  value,
  max = 100,
  format = (v) => `${v}`,
  color = 'cyan',
  showPercentage = true,
  tooltip,
}: ProgressMetricProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const config = colorConfig[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {tooltip && (
            <InfoTooltip term={label} definition={tooltip} variant="icon" />
          )}
        </div>
        <span className={`text-sm font-bold ${config.text}`}>
          {format(value)}
          {showPercentage && max !== 100 && ` / ${format(max)}`}
        </span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Conversion summary card with visual breakdown
interface ConversionSummaryProps {
  data: {
    resume_downloads: number;
    social_clicks: number;
    form_submissions: number;
    cta_clicks: number;
    publication_clicks: number;
  };
}

export function ConversionSummary({ data }: ConversionSummaryProps) {
  const conversions = [
    {
      label: 'Resume Downloads',
      value: data.resume_downloads,
      icon: Download,
      color: 'emerald' as const,
      description: 'People downloaded your resume',
    },
    {
      label: 'Contact Form',
      value: data.form_submissions,
      icon: MessageSquare,
      color: 'blue' as const,
      description: 'People reached out via form',
    },
    {
      label: 'Social Profile Clicks',
      value: data.social_clicks,
      icon: Share2,
      color: 'purple' as const,
      description: 'Clicked LinkedIn, GitHub, etc.',
    },
    {
      label: 'CTA Interactions',
      value: data.cta_clicks,
      icon: MousePointer,
      color: 'amber' as const,
      description: 'Clicked call-to-action buttons',
    },
  ];

  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {conversions.map((conv, index) => (
        <motion.div
          key={conv.label}
          className={`p-4 rounded-xl border ${colorMap[conv.color]} backdrop-blur-sm`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg ${colorMap[conv.color].split(' ')[0]} flex items-center justify-center`}>
              <conv.icon size={20} />
            </div>
            <div className="text-3xl font-bold text-foreground">{conv.value}</div>
          </div>
          <div className="text-sm font-medium text-foreground">{conv.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{conv.description}</div>
        </motion.div>
      ))}
    </div>
  );
}

// Comparison bar for showing relative performance
interface ComparisonBarProps {
  items: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  valueFormatter?: (value: number) => string;
}

export function ComparisonBar({ items, title, valueFormatter = (v) => `${v}` }: ComparisonBarProps) {
  const maxValue = Math.max(...items.map(i => i.value));

  return (
    <div className="space-y-4">
      {title && <h4 className="text-sm font-semibold text-foreground">{title}</h4>}
      <div className="space-y-3">
        {items.map((item, index) => {
          const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <motion.div
              key={item.label}
              className="space-y-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">{valueFormatter(item.value)}</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color || '#7B42F6' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
