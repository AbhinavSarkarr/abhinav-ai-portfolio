import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { TrafficSource } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle, chartColorPalette } from '@/lib/chartTheme';
import { Globe, Linkedin, Search, Instagram, Facebook, Link2 } from 'lucide-react';

type TrafficSourceAnalysisProps = {
  data: TrafficSource[];
  height?: number;
};

const SOURCE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  direct: Globe,
  'linkedin.com': Linkedin,
  google: Search,
  instagram: Instagram,
  'facebook.com': Facebook,
};

export function TrafficSourceAnalysis({ data, height = 300 }: TrafficSourceAnalysisProps) {
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);

  const enrichedData = data.map((source, index) => ({
    ...source,
    percentage: totalSessions > 0 ? (source.sessions / totalSessions * 100).toFixed(1) : 0,
    color: chartColorPalette[index % chartColorPalette.length],
    displayName: source.source === 'direct' ? 'Direct' :
                 source.source === 'linkedin.com' ? 'LinkedIn' :
                 source.source === 'google' ? 'Google' :
                 source.source === 'instagram' ? 'Instagram' :
                 source.source === 'facebook.com' ? 'Facebook' :
                 source.source,
  }));

  // Quality score based on engagement
  const getQualityLabel = (engagement: number) => {
    if (engagement >= 60) return { label: 'Excellent', color: '#10B981' };
    if (engagement >= 45) return { label: 'Good', color: '#7B42F6' };
    if (engagement >= 30) return { label: 'Average', color: '#F59E0B' };
    return { label: 'Low', color: '#EF4444' };
  };

  return (
    <div className="space-y-6">
      {/* Scatter Plot: Sessions vs Engagement */}
      <div>
        <h4 className="text-sm font-medium text-black dark:text-white mb-3">
          Traffic Quality Matrix
          <span className="text-xs text-muted-foreground ml-2">(Sessions vs Engagement)</span>
        </h4>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis
              type="number"
              dataKey="sessions"
              name="Sessions"
              tick={axisStyle.tick}
              axisLine={axisStyle.axisLine}
              tickLine={axisStyle.tickLine}
              label={{ value: 'Sessions', position: 'bottom', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="engagement_rate"
              name="Engagement"
              tick={axisStyle.tick}
              axisLine={axisStyle.axisLine}
              tickLine={axisStyle.tickLine}
              domain={[0, 100]}
              width={45}
              tickFormatter={(v) => `${v}%`}
              label={{ value: 'Engagement %', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="sessions" range={[100, 1000]} />
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              formatter={(value: number, name: string) => {
                if (name === 'Engagement') return [`${value.toFixed(1)}%`, name];
                return [value, name];
              }}
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload) {
                  return payload[0].payload.displayName;
                }
                return '';
              }}
            />
            <Scatter data={enrichedData} fill={chartTheme.colors.primary}>
              {enrichedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color}60)` }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Source Cards with Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrichedData.map((source, index) => {
          const Icon = SOURCE_ICONS[source.source] || Link2;
          const quality = getQualityLabel(source.engagement_rate);

          return (
            <motion.div
              key={source.source}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${source.color}20` }}
                  >
                    <Icon size={18} style={{ color: source.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-black dark:text-white">{source.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{source.medium}</p>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${quality.color}15`,
                    borderColor: `${quality.color}40`,
                    color: quality.color,
                  }}
                >
                  {quality.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">{source.sessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: quality.color }}>
                    {source.engagement_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>

              {/* Progress bar for share */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Traffic Share</span>
                  <span className="text-black dark:text-white">{source.percentage}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: source.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
