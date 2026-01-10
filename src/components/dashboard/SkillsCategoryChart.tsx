import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { SkillRanking, getDemandColor, getDemandLabel } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle, chartColorPalette } from '@/lib/chartTheme';
import { Layers, Code2, Database, Brain, Cloud, Paintbrush } from 'lucide-react';

type SkillsCategoryChartProps = {
  data: SkillRanking[];
  height?: number;
};

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Languages: Code2,
  'ML/AI': Brain,
  Frontend: Paintbrush,
  GenAI: Brain,
  Databases: Database,
  DevOps: Cloud,
  Backend: Layers,
};

const CATEGORY_COLORS: Record<string, string> = {
  Languages: '#7B42F6',
  'ML/AI': '#00E0FF',
  Frontend: '#FF3DDB',
  GenAI: '#10B981',
  Databases: '#F59E0B',
  DevOps: '#3B82F6',
  Backend: '#8B5CF6',
};

export function SkillsCategoryChart({ data, height = 300 }: SkillsCategoryChartProps) {
  // Group skills by category
  const categoryData = data.reduce((acc, skill) => {
    const category = skill.skill_category || 'Other';
    if (!acc[category]) {
      acc[category] = { category, clicks: 0, skills: [], color: CATEGORY_COLORS[category] || '#6B7280' };
    }
    acc[category].clicks += skill.clicks;
    acc[category].skills.push(skill);
    return acc;
  }, {} as Record<string, { category: string; clicks: number; skills: SkillRanking[]; color: string }>);

  const categoryArray = Object.values(categoryData).sort((a, b) => b.clicks - a.clicks);
  const totalClicks = categoryArray.reduce((sum, c) => sum + c.clicks, 0);

  // Group by demand tier
  const demandTierData = data.reduce((acc, skill) => {
    const tier = skill.demand_tier;
    if (!acc[tier]) {
      acc[tier] = { tier, count: 0, clicks: 0 };
    }
    acc[tier].count++;
    acc[tier].clicks += skill.clicks;
    return acc;
  }, {} as Record<string, { tier: string; count: number; clicks: number }>);

  const demandArray = Object.values(demandTierData).map(d => ({
    ...d,
    label: getDemandLabel(d.tier),
    color: getDemandColor(d.tier),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie */}
        <div>
          <h4 className="text-sm font-medium text-black dark:text-white mb-3">
            Interest by Category
          </h4>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={height}>
              <PieChart>
                <Pie
                  data={categoryArray}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="clicks"
                  nameKey="category"
                >
                  {categoryArray.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  labelStyle={tooltipStyle.labelStyle}
                  formatter={(value: number, name: string) => [
                    `${value} clicks (${(value / totalClicks * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Category Legend */}
            <div className="flex-1 space-y-2">
              {categoryArray.map((cat, index) => {
                const Icon = CATEGORY_ICONS[cat.category] || Layers;
                return (
                  <motion.div
                    key={cat.category}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Icon size={14} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white truncate">{cat.category}</p>
                      <p className="text-xs text-muted-foreground">{cat.skills.length} skills</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black dark:text-white">{cat.clicks}</p>
                      <p className="text-xs text-muted-foreground">
                        {(cat.clicks / totalClicks * 100).toFixed(0)}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demand Tier Distribution */}
        <div>
          <h4 className="text-sm font-medium text-black dark:text-white mb-3">
            Skills by Demand Tier
          </h4>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={demandArray} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis
                type="number"
                tick={axisStyle.tick}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={axisStyle.tick}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                formatter={(value: number, name: string, props: { payload: { count: number } }) => {
                  if (name === 'clicks') return [value, 'Total Clicks'];
                  return [`${props.payload.count} skills`, 'Count'];
                }}
              />
              <Bar dataKey="clicks" radius={[0, 4, 4, 0]} maxBarSize={25}>
                {demandArray.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}40)` }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Grid by Category */}
      <div>
        <h4 className="text-sm font-medium text-black dark:text-white mb-3">
          Skills Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryArray.map((category, catIndex) => {
            const Icon = CATEGORY_ICONS[category.category] || Layers;
            return (
              <motion.div
                key={category.category}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon size={16} style={{ color: category.color }} />
                  </div>
                  <span className="font-medium text-black dark:text-white">{category.category}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {category.clicks} clicks
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.sort((a, b) => b.clicks - a.clicks).map((skill) => {
                    const demandColor = getDemandColor(skill.demand_tier);
                    return (
                      <span
                        key={skill.skill_name}
                        className="text-xs px-2 py-1 rounded-full border flex items-center gap-1"
                        style={{
                          backgroundColor: `${demandColor}10`,
                          borderColor: `${demandColor}30`,
                          color: demandColor,
                        }}
                      >
                        {skill.skill_name}
                        <span className="opacity-60">({skill.clicks})</span>
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
