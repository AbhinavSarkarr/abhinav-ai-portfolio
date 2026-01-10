import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrafficSource } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle } from '@/lib/chartTheme';
import { Globe, Linkedin, Search, Instagram, Facebook, ExternalLink } from 'lucide-react';

type SourceBarChartProps = {
  data: TrafficSource[];
  height?: number;
};

const SOURCE_ICONS: Record<string, typeof Globe> = {
  direct: Globe,
  google: Search,
  'linkedin.com': Linkedin,
  instagram: Instagram,
  'facebook.com': Facebook,
};

const SOURCE_COLORS: Record<string, string> = {
  direct: chartTheme.colors.primary,
  google: '#EA4335',
  'linkedin.com': '#0A66C2',
  instagram: '#E4405F',
  'facebook.com': '#1877F2',
};

export function SourceBarChart({ data, height = 250 }: SourceBarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    displayName: d.source === '(direct)' ? 'Direct' : d.source.replace('.com', ''),
    fill: SOURCE_COLORS[d.source] || chartTheme.colors.accent,
  }));

  return (
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
            dataKey="displayName"
            tick={axisStyle.tick}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            formatter={(value: number, name: string, props: { payload: TrafficSource }) => {
              if (name === 'sessions') {
                return [
                  <span key="sessions">
                    {value} sessions ({props.payload.engagement_rate.toFixed(1)}% engaged)
                  </span>,
                  'Traffic',
                ];
              }
              return [value, name];
            }}
          />
          <Bar
            dataKey="sessions"
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          >
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

      {/* Source details */}
      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((source) => {
          const Icon = SOURCE_ICONS[source.source] || ExternalLink;
          const color = SOURCE_COLORS[source.source] || chartTheme.colors.accent;
          return (
            <div
              key={source.source}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-muted-foreground capitalize">
                  {source.source === '(direct)'
                    ? 'Direct'
                    : source.source.replace('.com', '')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{source.sessions}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    source.engagement_rate >= 50
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {source.engagement_rate.toFixed(0)}% engaged
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
