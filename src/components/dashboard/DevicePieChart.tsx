import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { chartTheme, tooltipStyle } from '@/lib/chartTheme';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

type DeviceData = {
  desktop: number;
  mobile: number;
  tablet: number;
};

type DevicePieChartProps = {
  data: DeviceData;
  height?: number;
};

const DEVICE_COLORS = {
  desktop: chartTheme.colors.primary,
  mobile: chartTheme.colors.accent,
  tablet: chartTheme.colors.highlight,
};

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export function DevicePieChart({ data, height = 250 }: DevicePieChartProps) {
  const chartData = [
    { name: 'Desktop', value: data.desktop, color: DEVICE_COLORS.desktop },
    { name: 'Mobile', value: data.mobile, color: DEVICE_COLORS.mobile },
    { name: 'Tablet', value: data.tablet, color: DEVICE_COLORS.tablet },
  ].filter((d) => d.value > 0);

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
    if (percent < 0.05) return null;
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
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={90}
            innerRadius={50}
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
            formatter={(value: number, name: string) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {chartData.map((item) => {
          const Icon =
            DEVICE_ICONS[item.name.toLowerCase() as keyof typeof DEVICE_ICONS];
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {Icon && <Icon size={14} className="text-muted-foreground" />}
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <span className="text-sm font-medium text-white">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
