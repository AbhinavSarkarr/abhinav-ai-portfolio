import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { ProjectRanking } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle, chartColorPalette } from '@/lib/chartTheme';
import { Trophy, Eye, MousePointerClick, Sparkles, TrendingUp } from 'lucide-react';

type ProjectScatterPlotProps = {
  data: ProjectRanking[];
  height?: number;
};

export function ProjectScatterPlot({ data, height = 350 }: ProjectScatterPlotProps) {
  const enrichedData = data.map((project, index) => ({
    ...project,
    color: chartColorPalette[index % chartColorPalette.length],
    ctr: project.total_views > 0 ? (project.total_clicks / project.total_views * 100) : 0,
  }));

  // Calculate averages for reference lines
  const avgViews = data.reduce((sum, p) => sum + p.total_views, 0) / data.length;
  const avgEngagement = data.reduce((sum, p) => sum + p.engagement_score, 0) / data.length;

  // Get performance tier
  const getPerformanceTier = (project: typeof enrichedData[0]) => {
    if (project.engagement_score >= 70 && project.total_views >= avgViews) {
      return { label: 'Star Performer', color: '#FFD700', icon: Trophy };
    }
    if (project.engagement_score >= avgEngagement) {
      return { label: 'High Engagement', color: '#10B981', icon: Sparkles };
    }
    if (project.total_views >= avgViews) {
      return { label: 'High Visibility', color: '#3B82F6', icon: Eye };
    }
    return { label: 'Growing', color: '#8B5CF6', icon: TrendingUp };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Scatter Plot */}
      <div>
        <h4 className="text-xs sm:text-sm font-medium text-black dark:text-white mb-0.5 sm:mb-1">
          Project Performance Matrix
        </h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
          Views vs Engagement Score (bubble size = clicks)
        </p>
        {/* Mobile Scatter Chart */}
        <div className="sm:hidden">
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis
                type="number"
                dataKey="total_views"
                name="Views"
                tick={{ ...axisStyle.tick, fontSize: 9 }}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
                label={{ value: 'Views', position: 'bottom', fill: 'rgba(255,255,255,0.5)', fontSize: 9, offset: 10 }}
              />
              <YAxis
                type="number"
                dataKey="engagement_score"
                name="Engagement"
                tick={{ ...axisStyle.tick, fontSize: 9 }}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
                domain={[0, 100]}
                width={35}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
              />
              <ZAxis type="number" dataKey="total_clicks" range={[50, 300]} name="Clicks" />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                content={({ payload }) => {
                  if (!payload?.[0]?.payload) return null;
                  const project = payload[0].payload as typeof enrichedData[0];
                  return (
                    <div className="p-2 rounded-lg bg-[rgba(10,4,38,0.95)] border border-white/20">
                      <p className="font-semibold text-black dark:text-white text-xs mb-1 truncate max-w-[150px]">{project.project_title}</p>
                      <div className="space-y-0.5 text-[10px]">
                        <p><span className="text-muted-foreground">Views:</span> <span className="text-black dark:text-white">{project.total_views}</span></p>
                        <p><span className="text-muted-foreground">Score:</span> <span className="text-tech-neon">{project.engagement_score.toFixed(0)}</span></p>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={enrichedData}>
                {enrichedData.map((entry, index) => (
                  <Cell
                    key={`cell-mobile-${index}`}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 6px ${entry.color}80)`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {/* Desktop Scatter Chart */}
        <div className="hidden sm:block">
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis
                type="number"
                dataKey="total_views"
                name="Views"
                tick={axisStyle.tick}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
                label={{ value: 'Total Views', position: 'bottom', fill: 'rgba(255,255,255,0.5)', fontSize: 11, offset: 15 }}
              />
              <YAxis
                type="number"
                dataKey="engagement_score"
                name="Engagement"
                tick={axisStyle.tick}
                axisLine={axisStyle.axisLine}
                tickLine={axisStyle.tickLine}
                domain={[0, 100]}
                width={50}
                label={{ value: 'Engagement Score', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="total_clicks" range={[100, 600]} name="Clicks" />
              <ReferenceLine
                x={avgViews}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="5 5"
                label={{ value: 'Avg Views', position: 'top', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              />
              <ReferenceLine
                y={avgEngagement}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="5 5"
                label={{ value: 'Avg Engagement', position: 'right', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                content={({ payload }) => {
                  if (!payload?.[0]?.payload) return null;
                  const project = payload[0].payload as typeof enrichedData[0];
                  return (
                    <div className="p-3 rounded-xl bg-[rgba(10,4,38,0.95)] border border-white/20">
                      <p className="font-semibold text-black dark:text-white mb-2">{project.project_title}</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="text-muted-foreground">Views:</span> <span className="text-black dark:text-white">{project.total_views}</span></p>
                        <p><span className="text-muted-foreground">Clicks:</span> <span className="text-black dark:text-white">{project.total_clicks}</span></p>
                        <p><span className="text-muted-foreground">CTR:</span> <span className="text-green-400">{project.ctr.toFixed(1)}%</span></p>
                        <p><span className="text-muted-foreground">Engagement:</span> <span className="text-tech-neon">{project.engagement_score.toFixed(1)}</span></p>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={enrichedData}>
                {enrichedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 10px ${entry.color}80)`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {enrichedData.sort((a, b) => a.overall_rank - b.overall_rank).map((project, index) => {
          const tier = getPerformanceTier(project);
          const TierIcon = tier.icon;

          return (
            <motion.div
              key={project.project_id}
              className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                    style={{ backgroundColor: `${project.color}20`, color: project.color }}
                  >
                    #{project.overall_rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-white truncate">{project.project_title}</p>
                    <span
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1"
                      style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                    >
                      <TierIcon size={8} className="sm:hidden" />
                      <TierIcon size={10} className="hidden sm:block" />
                      {tier.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                <div className="text-center p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/5">
                  <Eye size={12} className="mx-auto mb-0.5 sm:mb-1 text-blue-400 sm:hidden" />
                  <Eye size={14} className="mx-auto mb-0.5 sm:mb-1 text-blue-400 hidden sm:block" />
                  <p className="text-sm sm:text-lg font-bold text-black dark:text-white">{project.total_views}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">Views</p>
                </div>
                <div className="text-center p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/5">
                  <MousePointerClick size={12} className="mx-auto mb-0.5 sm:mb-1 text-green-400 sm:hidden" />
                  <MousePointerClick size={14} className="mx-auto mb-0.5 sm:mb-1 text-green-400 hidden sm:block" />
                  <p className="text-sm sm:text-lg font-bold text-black dark:text-white">{project.total_clicks}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">Clicks</p>
                </div>
                <div className="text-center p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/5">
                  <TrendingUp size={12} className="mx-auto mb-0.5 sm:mb-1 text-cyan-400 sm:hidden" />
                  <TrendingUp size={14} className="mx-auto mb-0.5 sm:mb-1 text-cyan-400 hidden sm:block" />
                  <p className="text-sm sm:text-lg font-bold text-black dark:text-white">{project.ctr.toFixed(1)}%</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">CTR</p>
                </div>
                <div className="text-center p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/5">
                  <Sparkles size={12} className="mx-auto mb-0.5 sm:mb-1 text-purple-400 sm:hidden" />
                  <Sparkles size={14} className="mx-auto mb-0.5 sm:mb-1 text-purple-400 hidden sm:block" />
                  <p className="text-sm sm:text-lg font-bold text-black dark:text-white">{project.engagement_score.toFixed(0)}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">Score</p>
                </div>
              </div>

              {/* Position badge */}
              <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Recommended:</span>
                <span
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full capitalize"
                  style={{
                    backgroundColor: project.recommended_position === 'featured' ? '#FFD70020' : 'rgba(255,255,255,0.1)',
                    color: project.recommended_position === 'featured' ? '#FFD700' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {project.recommended_position}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
