import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { SectionRanking, getHealthColor } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle } from '@/lib/chartTheme';
import { TrendingUp, TrendingDown, Eye, LogOut, Activity } from 'lucide-react';

type SectionRadarChartProps = {
  data: SectionRanking[];
  height?: number;
};

export function SectionRadarChart({ data, height = 350 }: SectionRadarChartProps) {
  // Transform data for radar chart
  const radarData = data.map((section) => ({
    section: section.section_id.charAt(0).toUpperCase() + section.section_id.slice(1),
    health: section.health_score,
    engagement: section.avg_engagement_rate,
    retention: 100 - section.avg_exit_rate, // Inverse of exit rate
    views: Math.min(100, (section.total_views / Math.max(...data.map(d => d.total_views))) * 100),
  }));

  // Calculate overall metrics
  const avgHealth = data.reduce((sum, d) => sum + d.health_score, 0) / data.length;
  const avgEngagement = data.reduce((sum, d) => sum + d.avg_engagement_rate, 0) / data.length;
  const avgExitRate = data.reduce((sum, d) => sum + d.avg_exit_rate, 0) / data.length;

  const overallMetrics = [
    {
      label: 'Overall Health',
      value: avgHealth.toFixed(0),
      suffix: '%',
      icon: Activity,
      color: getHealthColor(avgHealth >= 70 ? 'excellent' : avgHealth >= 50 ? 'good' : 'needs_attention'),
    },
    {
      label: 'Avg Engagement',
      value: avgEngagement.toFixed(1),
      suffix: '%',
      icon: TrendingUp,
      color: chartTheme.colors.success,
    },
    {
      label: 'Avg Exit Rate',
      value: avgExitRate.toFixed(1),
      suffix: '%',
      icon: LogOut,
      color: avgExitRate > 30 ? chartTheme.colors.danger : chartTheme.colors.warning,
    },
    {
      label: 'Total Views',
      value: data.reduce((sum, d) => sum + d.total_views, 0),
      suffix: '',
      icon: Eye,
      color: chartTheme.colors.info,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Radar Chart */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-black dark:text-white mb-2 sm:mb-3">
            Section Performance Radar
          </h4>
          {/* Mobile Radar Chart */}
          <div className="sm:hidden">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="section"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  labelStyle={tooltipStyle.labelStyle}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => (
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />
                <Radar
                  name="health"
                  dataKey="health"
                  stroke={chartTheme.colors.success}
                  fill={chartTheme.colors.success}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="engagement"
                  dataKey="engagement"
                  stroke={chartTheme.colors.primary}
                  fill={chartTheme.colors.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="retention"
                  dataKey="retention"
                  stroke={chartTheme.colors.accent}
                  fill={chartTheme.colors.accent}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Desktop Radar Chart */}
          <div className="hidden sm:block">
            <ResponsiveContainer width="100%" height={height}>
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="section"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  labelStyle={tooltipStyle.labelStyle}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => (
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />
                <Radar
                  name="health"
                  dataKey="health"
                  stroke={chartTheme.colors.success}
                  fill={chartTheme.colors.success}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="engagement"
                  dataKey="engagement"
                  stroke={chartTheme.colors.primary}
                  fill={chartTheme.colors.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="retention"
                  dataKey="retention"
                  stroke={chartTheme.colors.accent}
                  fill={chartTheme.colors.accent}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Breakdown */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-black dark:text-white mb-2 sm:mb-3">
            Section Breakdown
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {data.sort((a, b) => a.engagement_rank - b.engagement_rank).map((section, index) => {
              const healthColor = getHealthColor(section.health_tier);
              return (
                <motion.div
                  key={section.section_id}
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">#{section.engagement_rank}</span>
                      <span className="text-xs sm:text-sm font-medium text-black dark:text-white capitalize">{section.section_id}</span>
                    </div>
                    <span
                      className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${healthColor}15`,
                        borderColor: `${healthColor}40`,
                        color: healthColor,
                      }}
                    >
                      {section.health_tier.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Health</p>
                      <p className="font-semibold text-black dark:text-white">{section.health_score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-semibold text-black dark:text-white">{section.total_views}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engage</p>
                      <p className="font-semibold text-green-400">{section.avg_engagement_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exit</p>
                      <p className="font-semibold" style={{ color: section.avg_exit_rate > 30 ? '#EF4444' : '#F59E0B' }}>
                        {section.avg_exit_rate}%
                      </p>
                    </div>
                  </div>
                  {section.optimization_hint !== 'performing_well' && (
                    <p className="text-xs text-amber-400 mt-1.5 sm:mt-2 flex items-center gap-1">
                      <TrendingUp size={10} className="sm:hidden" />
                      <TrendingUp size={12} className="hidden sm:block" />
                      <span className="truncate">{section.optimization_hint.replace(/_/g, ' ')}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {overallMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <metric.icon size={12} className="sm:hidden" style={{ color: metric.color }} />
              <metric.icon size={16} className="hidden sm:block" style={{ color: metric.color }} />
              <span className="text-xs text-muted-foreground truncate">{metric.label}</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold" style={{ color: metric.color }}>
              {metric.value}{metric.suffix}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
