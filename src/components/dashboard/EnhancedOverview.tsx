import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { DashboardData, formatNumber, formatPercentage, formatDuration } from '@/hooks/useDashboardData';
import {
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Timer,
  Target,
  Download,
  MousePointerClick,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

type EnhancedOverviewProps = {
  data: DashboardData;
};

type MetricConfig = {
  label: string;
  value: string | number;
  icon: React.FC<{ size?: number; className?: string }>;
  gradient: string;
  color: string;
  sparklineData?: number[];
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
};

export function EnhancedOverview({ data }: EnhancedOverviewProps) {
  const metrics = useMemo((): MetricConfig[] => {
    const dailyData = data.dailyMetrics;

    const firstHalf = dailyData.slice(0, 3);
    const lastHalf = dailyData.slice(-3);

    const calcTrend = (metric: keyof typeof dailyData[0]) => {
      const firstAvg = firstHalf.reduce((sum, d) => sum + (d[metric] as number), 0) / firstHalf.length;
      const lastAvg = lastHalf.reduce((sum, d) => sum + (d[metric] as number), 0) / lastHalf.length;
      if (firstAvg === 0) return { value: 0, direction: 'neutral' as const };
      const change = ((lastAvg - firstAvg) / firstAvg) * 100;
      return {
        value: Math.abs(change),
        direction: change > 5 ? 'up' as const : change < -5 ? 'down' as const : 'neutral' as const,
      };
    };

    return [
      {
        label: 'Total Visitors',
        value: formatNumber(data.overview.total_visitors_7d),
        icon: Users,
        gradient: 'from-tech-neon to-tech-accent',
        color: '#7B42F6',
        sparklineData: dailyData.map(d => d.visitors),
        trend: calcTrend('visitors'),
        subtitle: `${(data.overview.total_visitors_7d / 7).toFixed(1)}/day avg`,
      },
      {
        label: 'Total Sessions',
        value: formatNumber(data.overview.total_sessions_7d),
        icon: BarChart3,
        gradient: 'from-blue-500 to-cyan-500',
        color: '#00E0FF',
        sparklineData: dailyData.map(d => d.sessions),
        trend: calcTrend('sessions'),
        subtitle: `${(data.overview.total_sessions_7d / data.overview.total_visitors_7d).toFixed(1)} sessions/visitor`,
      },
      {
        label: 'Engagement Rate',
        value: formatPercentage(data.overview.engagement_rate),
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-teal-500',
        color: '#10B981',
        sparklineData: dailyData.map(d => d.engagement_rate),
        trend: calcTrend('engagement_rate'),
        subtitle: data.overview.engagement_rate > 50 ? 'Above average' : 'Room to improve',
      },
      {
        label: 'Bounce Rate',
        value: formatPercentage(data.overview.bounce_rate),
        icon: TrendingDown,
        gradient: data.overview.bounce_rate > 30 ? 'from-amber-500 to-orange-500' : 'from-cyan-500 to-blue-500',
        color: data.overview.bounce_rate > 30 ? '#F59E0B' : '#06B6D4',
        sparklineData: dailyData.map(d => d.bounce_rate),
        trend: {
          ...calcTrend('bounce_rate'),
          direction: calcTrend('bounce_rate').direction === 'up' ? 'down' as const :
                     calcTrend('bounce_rate').direction === 'down' ? 'up' as const : 'neutral' as const,
        },
        subtitle: data.overview.bounce_rate < 20 ? 'Excellent retention' : 'Monitor closely',
      },
      {
        label: 'Conversions',
        value: data.overview.total_conversions,
        icon: Target,
        gradient: 'from-emerald-500 to-teal-500',
        color: '#10B981',
        subtitle: `${((data.overview.total_conversions / data.overview.total_visitors_7d) * 100).toFixed(1)}% conversion rate`,
      },
      {
        label: 'Resume Downloads',
        value: data.overview.resume_downloads,
        icon: Download,
        gradient: 'from-tech-neon to-tech-accent',
        color: '#7B42F6',
        subtitle: `${((data.overview.resume_downloads / data.overview.total_visitors_7d) * 100).toFixed(1)}% of visitors`,
      },
      {
        label: 'Avg Session Duration',
        value: formatDuration(data.overview.avg_session_duration_sec),
        icon: Timer,
        gradient: 'from-amber-500 to-orange-500',
        color: '#F59E0B',
        sparklineData: dailyData.map(d => d.avg_session_duration_sec),
        trend: calcTrend('avg_session_duration_sec'),
        subtitle: data.overview.avg_session_duration_sec > 90 ? 'Good engagement' : 'Increase content depth',
      },
      {
        label: 'CTA Click Rate',
        value: formatPercentage(
          data.conversionFunnel.cta_views > 0
            ? (data.conversionFunnel.cta_clicks / data.conversionFunnel.cta_views) * 100
            : 0
        ),
        icon: MousePointerClick,
        gradient: 'from-pink-500 to-rose-500',
        color: '#EC4899',
        subtitle: `${data.conversionFunnel.cta_clicks}/${data.conversionFunnel.cta_views} clicks`,
      },
    ];
  }, [data]);

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return ArrowUpRight;
      case 'down':
        return ArrowDownRight;
      default:
        return Minus;
    }
  };

  const getTrendStyles = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20';
      case 'down':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.slice(0, 4).map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend ? getTrendIcon(metric.trend.direction) : null;

          return (
            <motion.div
              key={metric.label}
              className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 p-5 group hover:border-tech-accent/30 dark:hover:border-tech-accent/40 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Background Sparkline */}
              {metric.sparklineData && (
                <div className="absolute inset-0 opacity-20 dark:opacity-30">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.sparklineData.map((v, i) => ({ value: v, index: i }))}>
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric.color} stopOpacity={0.5} />
                          <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metric.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${index})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  {metric.trend && TrendIcon && (
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${getTrendStyles(metric.trend.direction)}`}>
                      <TrendIcon size={12} />
                      {metric.trend.value.toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{metric.label}</p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {metric.subtitle}
                  </p>
                )}
              </div>

              {/* Hover Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden dark:block"
                style={{
                  background: `radial-gradient(400px circle at 50% 50%, ${metric.color}15, transparent 60%)`,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.slice(4).map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend ? getTrendIcon(metric.trend.direction) : null;

          return (
            <motion.div
              key={metric.label}
              className="relative overflow-hidden rounded-xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 group hover:border-tech-accent/30 dark:hover:border-tech-accent/40 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 4) * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    {metric.trend && TrendIcon && (
                      <div className={`p-1 rounded ${getTrendStyles(metric.trend.direction)}`}>
                        <TrendIcon size={12} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{metric.label}</p>
                </div>
              </div>
              {metric.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {metric.subtitle}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Bar */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-tech-neon/10 via-tech-accent/10 to-tech-highlight/10 dark:from-tech-neon/5 dark:via-tech-accent/5 dark:to-tech-highlight/5 border border-tech-accent/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center shadow-md">
                <Eye size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page Views:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {data.sections.reduce((sum, s) => sum + s.total_views, 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <MousePointerClick size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Clicks:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {data.projects.reduce((sum, p) => sum + p.total_clicks, 0) +
                 data.skills.reduce((sum, s) => sum + s.clicks, 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                <Target size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Form Submissions:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {data.conversionFunnel.form_submissions}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
            Last 7 days
          </div>
        </div>
      </div>
    </div>
  );
}
