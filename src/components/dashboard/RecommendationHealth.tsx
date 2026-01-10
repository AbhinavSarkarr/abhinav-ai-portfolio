import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RecommendationData, formatNumber } from '@/hooks/useDashboardData';
import { StatusBadge } from './GlassCard';
import { chartTheme, tooltipStyle, axisStyle } from '@/lib/chartTheme';
import {
  Sparkles,
  Target,
  MousePointerClick,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

type RecommendationHealthProps = {
  data: RecommendationData;
};

export function RecommendationHealth({ data }: RecommendationHealthProps) {
  const positionData = [
    { position: 'Pos 1', ctr: data.position_1_ctr, color: chartTheme.colors.primary },
    { position: 'Pos 2', ctr: data.position_2_ctr, color: chartTheme.colors.accent },
    { position: 'Pos 3', ctr: data.position_3_ctr, color: chartTheme.colors.highlight },
  ];

  const getHealthIcon = () => {
    switch (data.system_health) {
      case 'excellent':
        return CheckCircle;
      case 'good':
        return TrendingUp;
      default:
        return AlertTriangle;
    }
  };

  const HealthIcon = getHealthIcon();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Health Status */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 flex items-center gap-2 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
              data.system_health === 'excellent'
                ? 'bg-green-500/20'
                : data.system_health === 'good'
                ? 'bg-tech-neon/20'
                : 'bg-amber-500/20'
            }`}
          >
            <HealthIcon
              size={18}
              className={`sm:hidden ${
                data.system_health === 'excellent'
                  ? 'text-green-400'
                  : data.system_health === 'good'
                  ? 'text-tech-neon'
                  : 'text-amber-400'
              }`}
            />
            <HealthIcon
              size={24}
              className={`hidden sm:block ${
                data.system_health === 'excellent'
                  ? 'text-green-400'
                  : data.system_health === 'good'
                  ? 'text-tech-neon'
                  : 'text-amber-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Health</p>
            <StatusBadge status={data.system_health} size="sm" />
          </div>
        </motion.div>

        {/* Overall CTR */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Target size={12} className="text-tech-accent sm:hidden" />
            <Target size={16} className="text-tech-accent hidden sm:block" />
            <p className="text-xs sm:text-sm text-muted-foreground">Overall CTR</p>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-black dark:text-white">{data.overall_ctr.toFixed(1)}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
            {data.total_clicks}/{data.total_impressions}
          </p>
        </motion.div>

        {/* User Conversion */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Users size={12} className="text-tech-highlight sm:hidden" />
            <Users size={16} className="text-tech-highlight hidden sm:block" />
            <p className="text-xs sm:text-sm text-muted-foreground">User Conv.</p>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-black dark:text-white">{data.user_conversion_rate.toFixed(1)}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
            % of users who click
          </p>
        </motion.div>

        {/* Total Engagement */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Sparkles size={12} className="text-tech-neon sm:hidden" />
            <Sparkles size={16} className="text-tech-neon hidden sm:block" />
            <p className="text-xs sm:text-sm text-muted-foreground">Engagement</p>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <p className="text-xl sm:text-3xl font-bold text-black dark:text-white">{formatNumber(data.total_clicks)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">clicks</p>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
            from {formatNumber(data.total_impressions)} impressions
          </p>
        </motion.div>
      </div>

      {/* Position Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bar Chart */}
        <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5">
          <h4 className="text-xs sm:text-sm font-medium text-black dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MousePointerClick size={14} className="text-tech-accent sm:hidden" />
            <MousePointerClick size={16} className="text-tech-accent hidden sm:block" />
            Position Performance
          </h4>
          <ResponsiveContainer width="100%" height={160} className="sm:hidden">
            <BarChart data={positionData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="position"
                tick={{ ...axisStyle.tick, fontSize: 10 }}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
              />
              <YAxis
                tick={{ ...axisStyle.tick, fontSize: 10 }}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
                tickFormatter={(value) => `${value}%`}
                width={35}
              />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'CTR']}
              />
              <Bar dataKey="ctr" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {positionData.map((entry, index) => (
                  <Cell
                    key={`cell-mobile-${index}`}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={200} className="hidden sm:block">
            <BarChart data={positionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="position"
                tick={axisStyle.tick}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
              />
              <YAxis
                tick={axisStyle.tick}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'CTR']}
              />
              <Bar dataKey="ctr" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {positionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Position Cards */}
        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-xs sm:text-sm font-medium text-black dark:text-white mb-1 sm:mb-2">Position Analysis</h4>
          {positionData.map((pos, index) => {
            const isTopPerformer = pos.ctr === Math.max(...positionData.map((p) => p.ctr));
            return (
              <motion.div
                key={pos.position}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-center justify-between ${
                  isTopPerformer ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${pos.color}20` }}
                  >
                    <span className="text-xs sm:text-sm font-bold" style={{ color: pos.color }}>
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-white">{pos.position}</p>
                    {isTopPerformer && (
                      <span className="text-[10px] text-green-400">Best performer</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-black dark:text-white">{pos.ctr.toFixed(1)}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">CTR</p>
                </div>
              </motion.div>
            );
          })}

          {/* Insight */}
          <div className="p-2 sm:p-3 rounded-md sm:rounded-lg bg-tech-neon/10 border border-tech-neon/20">
            <p className="text-[10px] sm:text-xs text-tech-accent">
              {positionData[0].ctr > positionData[1].ctr && positionData[0].ctr > positionData[2].ctr
                ? 'Position 1 performs best - visitors prefer the first recommendation'
                : positionData[1].ctr > positionData[2].ctr
                ? 'Position 2 performs well - consider showing more recommendations'
                : 'All positions perform similarly - recommendations are balanced'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
