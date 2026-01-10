import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { motion } from 'framer-motion';
import { DomainRanking } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle, chartColorPalette } from '@/lib/chartTheme';
import { Briefcase, TrendingUp, Star, Target, Building2 } from 'lucide-react';

type DomainInterestChartProps = {
  data: DomainRanking[];
  height?: number;
};

const DEMAND_CONFIG = {
  high_demand: { label: 'High Demand', color: '#F97316', icon: Star },
  moderate_demand: { label: 'Moderate', color: '#10B981', icon: TrendingUp },
  niche_interest: { label: 'Niche', color: '#8B5CF6', icon: Target },
};

const RECOMMENDATION_CONFIG: Record<string, { label: string; color: string }> = {
  primary_strength: { label: 'Primary Strength', color: '#10B981' },
  showcase_more: { label: 'Showcase More', color: '#F59E0B' },
  consider_expanding: { label: 'Expand', color: '#3B82F6' },
  maintain: { label: 'Maintain', color: '#6B7280' },
};

export function DomainInterestChart({ data, height = 280 }: DomainInterestChartProps) {
  const enrichedData = data.map((domain, index) => ({
    ...domain,
    color: chartColorPalette[index % chartColorPalette.length],
  }));

  const totalScore = data.reduce((sum, d) => sum + d.total_interest_score, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-black dark:text-white mb-3">
            Domain Interest Score
          </h4>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={enrichedData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis
                type="number"
                tick={axisStyle.tick}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
              />
              <YAxis
                type="category"
                dataKey="domain"
                tick={axisStyle.tick}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                formatter={(value: number) => [value, 'Interest Score']}
              />
              <Bar dataKey="total_interest_score" radius={[0, 6, 6, 0]} maxBarSize={30}>
                {enrichedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 6px ${entry.color}50)` }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-black dark:text-white mb-3">
            Interest Distribution
          </h4>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={height}>
              <PieChart>
                <Pie
                  data={enrichedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="total_interest_score"
                  nameKey="domain"
                >
                  {enrichedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 8px ${entry.color}60)` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  formatter={(value: number, name: string) => [
                    `${value} (${(value / totalScore * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {enrichedData.map((domain, index) => (
                <div key={domain.domain} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: domain.color }}
                  />
                  <span className="text-xs text-black dark:text-white flex-1 truncate">{domain.domain}</span>
                  <span className="text-xs text-muted-foreground">
                    {(domain.total_interest_score / totalScore * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedData.map((domain, index) => {
          const demandConfig = DEMAND_CONFIG[domain.demand_tier] || DEMAND_CONFIG.niche_interest;
          const recConfig = RECOMMENDATION_CONFIG[domain.portfolio_recommendation] || RECOMMENDATION_CONFIG.maintain;
          const DemandIcon = demandConfig.icon;

          return (
            <motion.div
              key={domain.domain}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${domain.color}20` }}
                  >
                    <Building2 size={22} style={{ color: domain.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-black dark:text-white">{domain.domain}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: `${demandConfig.color}15`,
                          color: demandConfig.color,
                        }}
                      >
                        <DemandIcon size={10} />
                        {demandConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-black dark:text-white">#{domain.interest_rank}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-xl font-bold" style={{ color: domain.color }}>
                    {domain.total_interest_score}
                  </p>
                  <p className="text-xs text-muted-foreground">Interest Score</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-xl font-bold text-black dark:text-white">
                    {(domain.total_interest_score / totalScore * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Share</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Strategy:</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${recConfig.color}15`,
                    color: recConfig.color,
                  }}
                >
                  {recConfig.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
