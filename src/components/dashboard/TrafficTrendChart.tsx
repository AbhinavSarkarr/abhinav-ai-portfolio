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

type TrafficTrendChartProps = {
  data: DailyMetric[];
  height?: number;
};

export function TrafficTrendChart({ data, height = 300 }: TrafficTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.colors.primary} stopOpacity={0.4} />
            <stop offset="95%" stopColor={chartTheme.colors.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.colors.accent} stopOpacity={0.4} />
            <stop offset="95%" stopColor={chartTheme.colors.accent} stopOpacity={0} />
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
          itemStyle={tooltipStyle.itemStyle}
          formatter={(value: number, name: string) => [
            value,
            name === 'visitors' ? 'Visitors' : 'Sessions',
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {value === 'visitors' ? 'Visitors' : 'Sessions'}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke={chartTheme.colors.primary}
          strokeWidth={2}
          fill="url(#visitorsGradient)"
          dot={false}
          activeDot={{
            r: 6,
            fill: chartTheme.colors.primary,
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke={chartTheme.colors.accent}
          strokeWidth={2}
          fill="url(#sessionsGradient)"
          dot={false}
          activeDot={{
            r: 6,
            fill: chartTheme.colors.accent,
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
