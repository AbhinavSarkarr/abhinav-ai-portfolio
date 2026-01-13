import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SkillRanking, getDemandColor, getDemandLabel } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle } from '@/lib/chartTheme';
import { Flame, TrendingUp, Rocket, Sparkles, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

type SkillDemandChartProps = {
  data: SkillRanking[];
  height?: number;
};

const DEMAND_ICONS = {
  high_demand: Flame,
  moderate_demand: TrendingUp,
  emerging: Rocket,
  niche: Sparkles,
};

const PRIORITY_CONFIG = {
  maintain_expertise: { label: 'Maintain', icon: CheckCircle, color: '#10B981' },
  showcase_more: { label: 'Showcase More', icon: TrendingUp, color: '#F59E0B' },
  consider_learning: { label: 'Learn', icon: BookOpen, color: '#3B82F6' },
  retire: { label: 'Consider Retiring', icon: AlertCircle, color: '#EF4444' },
};

export function SkillDemandChart({ data, height = 350 }: SkillDemandChartProps) {
  const sortedData = [...data].sort((a, b) => a.demand_rank - b.demand_rank);

  const chartData = sortedData.map((skill) => ({
    ...skill,
    fill: getDemandColor(skill.demand_tier),
  }));

  // Group by learning priority
  const priorityGroups = sortedData.reduce((acc, skill) => {
    const priority = skill.learning_priority || 'maintain_expertise';
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(skill);
    return acc;
  }, {} as Record<string, SkillRanking[]>);

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={axisStyle.tick}
              axisLine={axisStyle.axisLine}
              tickLine={axisStyle.tickLine}
            />
            <YAxis
              type="category"
              dataKey="skill_name"
              tick={axisStyle.tick}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              formatter={(value: number, name: string, props: { payload: SkillRanking }) => {
                return [
                  <div key="content" className="space-y-1">
                    <div>{value} clicks</div>
                    <div className="text-xs text-muted-foreground">
                      Category: {props.payload.skill_category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Priority: {props.payload.learning_priority?.replace(/_/g, ' ')}
                    </div>
                  </div>,
                  'Interest',
                ];
              }}
            />
            <Bar dataKey="clicks" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  style={{
                    filter: `drop-shadow(0 0 4px ${entry.fill}40)`,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills with badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedData.slice(0, 8).map((skill, index) => {
          const DemandIcon = DEMAND_ICONS[skill.demand_tier] || Sparkles;
          const demandColor = getDemandColor(skill.demand_tier);
          const demandLabel = getDemandLabel(skill.demand_tier);

          return (
            <motion.div
              key={skill.skill_name}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black dark:text-white truncate">
                  {skill.skill_name}
                </span>
                <span className="text-xs text-muted-foreground">#{skill.demand_rank}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${demandColor}20`,
                    borderColor: `${demandColor}40`,
                    color: demandColor,
                  }}
                >
                  <DemandIcon size={10} />
                  {demandLabel}
                </span>
                <span className="text-xs text-muted-foreground">
                  {skill.clicks} clicks
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Learning Priority Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
          const skills = priorityGroups[key] || [];
          if (skills.length === 0) return null;

          return (
            <div
              key={key}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <config.icon size={16} style={{ color: config.color }} />
                <span className="text-sm font-medium text-black dark:text-white">{config.label}</span>
                <span className="text-xs text-muted-foreground">({skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill.skill_name}
                    className="text-xs px-2 py-1 rounded-full bg-white/10 text-muted-foreground"
                  >
                    {skill.skill_name}
                  </span>
                ))}
                {skills.length > 5 && (
                  <span className="text-xs px-2 py-1 text-muted-foreground">
                    +{skills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
