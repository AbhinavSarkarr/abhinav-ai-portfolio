import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyMetric, formatDuration } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle } from '@/lib/chartTheme';

type SessionDurationChartProps = {
  data: DailyMetric[];
  height?: number;
};

export function SessionDurationChart({ data, height = 280 }: SessionDurationChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM d'),
    duration_mins: d.avg_session_duration_sec / 60,
  }));

  const avgDuration = data.reduce((sum, d) => sum + d.avg_session_duration_sec, 0) / data.length;

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.info} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartTheme.colors.info} stopOpacity={0.2} />
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
            yAxisId="left"
            tick={axisStyle.tick}
            axisLine={axisStyle.axisLine}
            tickLine={axisStyle.tickLine}
            width={50}
            tickFormatter={(value) => `${value}s`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={axisStyle.tick}
            axisLine={axisStyle.axisLine}
            tickLine={axisStyle.tickLine}
            width={40}
          />
          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            formatter={(value: number, name: string) => {
              if (name === 'avg_session_duration_sec') {
                return [formatDuration(value), 'Avg Duration'];
              }
              return [value, name === 'sessions' ? 'Sessions' : name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {value === 'avg_session_duration_sec' ? 'Session Duration' : 'Sessions'}
              </span>
            )}
          />
          <Bar
            yAxisId="right"
            dataKey="sessions"
            fill="url(#durationGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avg_session_duration_sec"
            stroke={chartTheme.colors.warning}
            strokeWidth={2}
            dot={{ r: 4, fill: chartTheme.colors.warning, stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="text-lg font-bold text-amber-400">{formatDuration(avgDuration)}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Max</p>
          <p className="text-lg font-bold text-green-400">
            {formatDuration(Math.max(...data.map(d => d.avg_session_duration_sec)))}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Min</p>
          <p className="text-lg font-bold text-blue-400">
            {formatDuration(Math.min(...data.map(d => d.avg_session_duration_sec)))}
          </p>
        </div>
      </div>
    </div>
  );
}
