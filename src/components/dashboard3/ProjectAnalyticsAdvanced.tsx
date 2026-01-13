import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  Area,
} from 'recharts';
import { Github, ExternalLink, Eye, MousePointer, Maximize2, Link2 } from 'lucide-react';

interface ProjectRanking {
  project_id: string;
  project_title: string;
  project_category: string;
  total_views: number;
  total_unique_viewers: number;
  total_clicks: number;
  total_expands: number;
  total_link_clicks: number;
  total_github_clicks: number;
  total_demo_clicks: number;
  engagement_score: number;
  overall_rank: number;
  performance_tier: string;
  recommended_position: string;
  engagement_percentile: number;
}

interface ProjectAnalyticsProps {
  data: ProjectRanking[];
}

const chartColors = {
  views: '#7B42F6',
  clicks: '#00E0FF',
  github: '#6e5494',
  demo: '#10B981',
  expands: '#F59E0B',
  links: '#FF3DDB',
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(17, 17, 27, 0.95)',
    border: '1px solid rgba(123, 66, 246, 0.3)',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: '#fff', fontWeight: 600 },
};

// Multi-metric stacked bar chart
export function ProjectMetricsChart({ data }: ProjectAnalyticsProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 6).map(p => ({
    name: p.project_title.length > 12 ? p.project_title.slice(0, 10) + '...' : p.project_title,
    Views: p.total_unique_viewers,
    Clicks: p.total_clicks,
    GitHub: p.total_github_clicks,
    Demo: p.total_demo_clicks,
    Expands: p.total_expands,
  }));

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }} />
        <Bar dataKey="Views" stackId="a" fill={chartColors.views} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Clicks" stackId="a" fill={chartColors.clicks} radius={[0, 0, 0, 0]} />
        <Bar dataKey="GitHub" stackId="a" fill={chartColors.github} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Demo" stackId="a" fill={chartColors.demo} radius={[4, 4, 0, 0]} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Detailed breakdown per project
export function ProjectDetailedBreakdown({ data }: ProjectAnalyticsProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-2">
      {data.slice(0, 3).map((project, index) => {
        const totalInteractions = project.total_clicks + project.total_github_clicks +
                                  project.total_demo_clicks + project.total_expands;
        const maxWidth = Math.max(
          project.total_clicks,
          project.total_github_clicks,
          project.total_demo_clicks,
          project.total_expands,
          1
        );

        return (
          <motion.div
            key={project.project_id}
            className="p-2.5 rounded-lg bg-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground truncate flex-1">
                {project.project_title}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {totalInteractions} actions
              </span>
            </div>

            {/* Multi-metric mini bars - 2 columns */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <MetricBar
                icon={MousePointer}
                label="Clicks"
                value={project.total_clicks}
                max={maxWidth}
                color={chartColors.clicks}
              />
              <MetricBar
                icon={Github}
                label="GitHub"
                value={project.total_github_clicks}
                max={maxWidth}
                color={chartColors.github}
              />
              <MetricBar
                icon={ExternalLink}
                label="Demo"
                value={project.total_demo_clicks}
                max={maxWidth}
                color={chartColors.demo}
              />
              <MetricBar
                icon={Maximize2}
                label="Expands"
                value={project.total_expands}
                max={maxWidth}
                color={chartColors.expands}
              />
            </div>

            {/* Recommendation badge */}
            {project.recommended_position && (
              <div className="mt-2 pt-1.5 border-t border-muted/20">
                <span className="text-xs text-muted-foreground">
                  Suggested: <span className="text-tech-accent font-medium">{project.recommended_position}</span>
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Helper component for metric bars
function MetricBar({
  icon: Icon,
  label,
  value,
  max,
  color,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const width = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} style={{ color }} className="flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-12">{label}</span>
      <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-xs font-bold text-foreground w-6 text-right">{value}</span>
    </div>
  );
}

// Summary stats for all projects
export function ProjectActionsSummary({ data }: ProjectAnalyticsProps) {
  if (!data || data.length === 0) return null;

  const totals = data.reduce(
    (acc, p) => ({
      clicks: acc.clicks + p.total_clicks,
      github: acc.github + p.total_github_clicks,
      demo: acc.demo + p.total_demo_clicks,
      expands: acc.expands + p.total_expands,
      links: acc.links + p.total_link_clicks,
    }),
    { clicks: 0, github: 0, demo: 0, expands: 0, links: 0 }
  );

  return (
    <div className="grid grid-cols-5 gap-2">
      <SummaryItem icon={MousePointer} label="Clicks" value={totals.clicks} color={chartColors.clicks} />
      <SummaryItem icon={Github} label="GitHub" value={totals.github} color={chartColors.github} />
      <SummaryItem icon={ExternalLink} label="Demo" value={totals.demo} color={chartColors.demo} />
      <SummaryItem icon={Maximize2} label="Expands" value={totals.expands} color={chartColors.expands} />
      <SummaryItem icon={Link2} label="Links" value={totals.links} color={chartColors.links} />
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-white/5 text-center">
      <Icon size={18} style={{ color }} className="mx-auto mb-1" />
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
