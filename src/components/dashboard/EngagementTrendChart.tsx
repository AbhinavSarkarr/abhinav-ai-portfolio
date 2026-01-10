import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyMetric } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle } from '@/lib/chartTheme';

type EngagementTrendChartProps = {
  data: DailyMetric[];
  height?: number;
};

export function EngagementTrendChart({ data, height = 280 }: EngagementTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM d'),
  }));

  // Calculate averages for reference lines
  const avgEngagement = data.reduce((sum, d) => sum + d.engagement_rate, 0) / data.length;
  const avgBounce = data.reduce((sum, d) => sum + d.bounce_rate, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          width={45}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={tooltipStyle.contentStyle}
          labelStyle={tooltipStyle.labelStyle}
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}%`,
            name === 'engagement_rate' ? 'Engagement Rate' : 'Bounce Rate',
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {value === 'engagement_rate' ? 'Engagement Rate' : 'Bounce Rate'}
            </span>
          )}
        />
        <ReferenceLine
          y={avgEngagement}
          stroke={chartTheme.colors.success}
          strokeDasharray="5 5"
          strokeOpacity={0.5}
        />
        <ReferenceLine
          y={avgBounce}
          stroke={chartTheme.colors.danger}
          strokeDasharray="5 5"
          strokeOpacity={0.5}
        />
        <Line
          type="monotone"
          dataKey="engagement_rate"
          stroke={chartTheme.colors.success}
          strokeWidth={2}
          dot={{ r: 4, fill: chartTheme.colors.success, stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: chartTheme.colors.success, stroke: '#fff', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="bounce_rate"
          stroke={chartTheme.colors.danger}
          strokeWidth={2}
          dot={{ r: 4, fill: chartTheme.colors.danger, stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: chartTheme.colors.danger, stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
