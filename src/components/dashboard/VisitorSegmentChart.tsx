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
    <div className="flex flex-col md:flex-row items-center gap-3">
      {/* Pie Chart */}
      <div className="flex-shrink-0 w-[140px] h-[140px] md:w-[200px] md:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius="85%"
              innerRadius="50%"
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              formatter={(value: number, name: string) => {
                const segment = chartData.find((d) => d.name === name);
                return [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  segment?.label || name,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-1">
        {chartData.map((segment) => {
          const Icon = segment.icon;
          const percentage = ((segment.value / total) * 100).toFixed(1);
          return (
            <div
              key={segment.name}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center"
                style={{ backgroundColor: `${segment.color}20` }}
              >
                <Icon size={11} style={{ color: segment.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-black dark:text-white truncate">
                    {segment.label}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white ml-2">
                    {segment.value}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground hidden md:block">
                  {segment.description} • {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
