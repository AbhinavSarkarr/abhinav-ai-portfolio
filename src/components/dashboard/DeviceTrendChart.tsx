import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyMetric } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle } from '@/lib/chartTheme';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

type DeviceTrendChartProps = {
  data: DailyMetric[];
  height?: number;
};

export function DeviceTrendChart({ data, height = 280 }: DeviceTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM d'),
  }));

  // Calculate totals
  const totals = data.reduce(
    (acc, d) => ({
      desktop: acc.desktop + d.desktop,
      mobile: acc.mobile + d.mobile,
      tablet: acc.tablet + d.tablet,
    }),
    { desktop: 0, mobile: 0, tablet: 0 }
  );
  const total = totals.desktop + totals.mobile + totals.tablet;

  const deviceStats = [
    {
      name: 'Desktop',
      value: totals.desktop,
      percent: total > 0 ? (totals.desktop / total * 100).toFixed(1) : 0,
      icon: Monitor,
      color: chartTheme.colors.primary
    },
    {
      name: 'Mobile',
      value: totals.mobile,
      percent: total > 0 ? (totals.mobile / total * 100).toFixed(1) : 0,
      icon: Smartphone,
      color: chartTheme.colors.accent
    },
    {
      name: 'Tablet',
      value: totals.tablet,
      percent: total > 0 ? (totals.tablet / total * 100).toFixed(1) : 0,
      icon: Tablet,
      color: chartTheme.colors.highlight
    },
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.primary} stopOpacity={0.5} />
              <stop offset="95%" stopColor={chartTheme.colors.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mobileGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.accent} stopOpacity={0.5} />
              <stop offset="95%" stopColor={chartTheme.colors.accent} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tabletGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.highlight} stopOpacity={0.5} />
              <stop offset="95%" stopColor={chartTheme.colors.highlight} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} />
          <XAxis
            dataKey="dateLabel"
            tick={axisStyle.tick}
            axisLine={axisStyle.axisLine}
            tickLine={axisStyle.tickLine}
          />
          <YAxis
            tick={axisStyle.tick}
            axisLine={axisStyle.axisLine}
            tickLine={axisStyle.tickLine}
            width={40}
          />
          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            formatter={(value: number, name: string) => [
              value,
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="desktop"
            stackId="1"
            stroke={chartTheme.colors.primary}
            strokeWidth={2}
            fill="url(#desktopGradient)"
          />
          <Area
            type="monotone"
            dataKey="mobile"
            stackId="1"
            stroke={chartTheme.colors.accent}
            strokeWidth={2}
            fill="url(#mobileGradient)"
          />
          <Area
            type="monotone"
            dataKey="tablet"
            stackId="1"
            stroke={chartTheme.colors.highlight}
            strokeWidth={2}
            fill="url(#tabletGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Device Stats */}
      <div className="grid grid-cols-3 gap-3">
        {deviceStats.map((device) => (
          <div
            key={device.name}
            className="p-3 rounded-xl bg-white/5 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${device.color}20` }}
            >
              <device.icon size={18} style={{ color: device.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-black dark:text-white">{device.value}</p>
              <p className="text-xs text-muted-foreground">{device.percent}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
