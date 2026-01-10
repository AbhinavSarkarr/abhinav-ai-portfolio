import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { VisitorSegments } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle } from '@/lib/chartTheme';
import { UserCheck, Target, Compass, RefreshCw, Eye } from 'lucide-react';

type VisitorSegmentChartProps = {
  data: VisitorSegments;
  height?: number;
};

const SEGMENT_CONFIG = {
  converters: {
    label: 'Converters',
    color: '#10B981',
    icon: UserCheck,
    description: 'Submitted contact form',
  },
  high_intent: {
    label: 'High Intent',
    color: '#F59E0B',
    icon: Target,
    description: 'Downloaded resume',
  },
  engaged_explorers: {
    label: 'Engaged Explorers',
    color: chartTheme.colors.primary,
    icon: Compass,
    description: 'Viewed 3+ projects',
  },
  returning_visitors: {
    label: 'Returning',
    color: chartTheme.colors.accent,
    icon: RefreshCw,
    description: 'Multiple sessions',
  },
  casual_browsers: {
    label: 'Casual Browsers',
    color: '#6B7280',
    icon: Eye,
    description: 'Quick visit',
  },
};

export function VisitorSegmentChart({ data, height = 280 }: VisitorSegmentChartProps) {
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: key,
      value,
      ...SEGMENT_CONFIG[key as keyof typeof SEGMENT_CONFIG],
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Pie Chart */}
      <div className="w-full lg:w-1/2">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={60}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              formatter={(value: number, name: string) => {
                const segment = chartData.find((d) => d.name === name);
                return [
                  `${value} visitors (${((value / total) * 100).toFixed(1)}%)`,
                  segment?.label || name,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="w-full lg:w-1/2 space-y-3">
        {chartData.map((segment) => {
          const Icon = segment.icon;
          const percentage = ((segment.value / total) * 100).toFixed(1);
          return (
            <div
              key={segment.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${segment.color}20` }}
              >
                <Icon size={18} style={{ color: segment.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black dark:text-white">
                    {segment.label}
                  </span>
                  <span className="text-sm font-bold text-black dark:text-white">
                    {segment.value}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {segment.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {percentage}%
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
