import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  Layers,
  AlertTriangle,
  MousePointer,
  Github,
  ExternalLink,
  Trophy,
  Target,
} from 'lucide-react';
import { SectionFunnel, SectionStickinessSummary } from './SectionFunnel';

// Types
interface ProjectRanking {
  project_id: string;
  project_title: string;
  total_unique_viewers: number;
  total_clicks: number;
  total_github_clicks: number;
  total_demo_clicks: number;
  total_expands: number;
  engagement_score: number;
  overall_rank: number;
  performance_tier: string;
}

interface SectionData {
  section_id: string;
  total_unique_views: number;
  total_unique_exits: number;
  total_unique_viewers: number;
  avg_exit_rate: number;
  total_views: number;
  total_exits: number;
  avg_total_exit_rate: number;
  avg_revisits_per_session: number;
  total_engaged_views: number;
  avg_engagement_rate: number;
  avg_time_spent_seconds: number;
  avg_scroll_depth_percent: number;
  health_score: number;
  engagement_rank: number;
  health_tier: string;
  dropoff_indicator: string;
  optimization_hint: string;
}

interface PortfolioEngagementCardProps {
  projects: ProjectRanking[];
  sections: SectionData[];
}

// Tooltip style
const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(17, 17, 27, 0.95)',
    border: '1px solid rgba(123, 66, 246, 0.3)',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: '#fff', fontWeight: 600 },
};

// Chart colors
const chartColors = {
  views: '#7B42F6',
  clicks: '#00E0FF',
  github: '#6e5494',
  demo: '#10B981',
};

// Format section names
function formatSectionName(sectionId: string): string {
  const nameMap: Record<string, string> = {
    'hero': 'Hero',
    'about': 'About',
    'skills': 'Skills',
    'experience': 'Experience',
    'projects': 'Projects',
    'publications': 'Publications',
    'contact': 'Contact',
    'footer': 'Footer',
  };
  return nameMap[sectionId.toLowerCase()] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

// Get health tier color
function getHealthColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'excellent': return '#10B981';
    case 'good': return '#3B82F6';
    case 'needs_attention': return '#F59E0B';
    case 'critical': return '#EF4444';
    default: return '#6B7280';
  }
}

type TabType = 'projects' | 'sections';

export function PortfolioEngagementCard({ projects, sections }: PortfolioEngagementCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'sections', label: 'Section Funnel', icon: Layers },
  ];

  return (
    <motion.div
      className="h-full rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-0 ${
                isActive
                  ? 'text-tech-neon border-b-2 border-tech-neon bg-white/50 dark:bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/50'
              }`}
            >
              <Icon size={14} className="sm:hidden" />
              <Icon size={16} className="hidden sm:block" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-3 sm:p-4 flex-1 overflow-auto">
        {activeTab === 'projects' && <ProjectsView projects={projects} />}
        {activeTab === 'sections' && <SectionsView sections={sections} />}
      </div>
    </motion.div>
  );
}

// Projects View
function ProjectsView({ projects }: { projects: ProjectRanking[] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No project data available</p>
      </div>
    );
  }

  // Top 3 podium
  const topThree = projects.slice(0, 3);

  // Chart data for bar chart
  const chartData = projects.slice(0, 6).map(p => ({
    name: p.project_title.length > 10 ? p.project_title.slice(0, 8) + '...' : p.project_title,
    Views: p.total_unique_viewers,
    Clicks: p.total_clicks,
    fullName: p.project_title,
  }));

  // Total metrics
  const totals = projects.reduce(
    (acc, p) => ({
      clicks: acc.clicks + p.total_clicks,
      github: acc.github + p.total_github_clicks,
      demo: acc.demo + p.total_demo_clicks,
      expands: acc.expands + p.total_expands,
      views: acc.views + p.total_unique_viewers,
    }),
    { clicks: 0, github: 0, demo: 0, expands: 0, views: 0 }
  );

  // Click-Through Rate data
  const ctrData = projects
    .map(p => ({
      ...p,
      ctr: p.total_unique_viewers > 0 ? (p.total_clicks / p.total_unique_viewers) * 100 : 0,
    }))
    .sort((a, b) => b.ctr - a.ctr);

  const maxCtr = Math.max(...ctrData.map(p => p.ctr));
  const avgCtr = totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0;

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Podium - Top 3 */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {topThree.map((project, index) => (
          <motion.div
            key={project.project_id}
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border text-center ${
              index === 0 ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30' :
              index === 1 ? 'bg-gradient-to-br from-gray-400/10 to-gray-400/5 border-gray-400/30' :
              'bg-gradient-to-br from-orange-600/10 to-orange-600/5 border-orange-600/30'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-sm sm:text-lg mb-0.5 sm:mb-1">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </div>
            <h4 className="text-[10px] sm:text-xs font-bold text-foreground line-clamp-1 mb-1 sm:mb-2">
              {project.project_title}
            </h4>
            <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
              <div>
                <div className="text-xs sm:text-sm font-bold text-tech-neon">{project.total_unique_viewers}</div>
                <div className="text-[8px] sm:text-[10px] text-muted-foreground">Views</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-tech-accent">{project.total_clicks}</div>
                <div className="text-[8px] sm:text-[10px] text-muted-foreground">Clicks</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-[140px] sm:h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
            />
            <Bar dataKey="Views" stackId="a" fill={chartColors.views} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Clicks" stackId="a" fill={chartColors.clicks} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        <SummaryItem icon={MousePointer} label="Clicks" value={totals.clicks} color={chartColors.clicks} />
        <SummaryItem icon={Github} label="GitHub" value={totals.github} color={chartColors.github} />
        <SummaryItem icon={ExternalLink} label="Demo" value={totals.demo} color={chartColors.demo} />
        <SummaryItem icon={Trophy} label="Expands" value={totals.expands} color="#F59E0B" />
      </div>

      {/* Click-Through Rate Section */}
      <div className="pt-2 sm:pt-3 border-t border-muted/20">
        <h4 className="text-[11px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
          <Target size={10} className="text-tech-accent sm:hidden" />
          <Target size={12} className="text-tech-accent hidden sm:block" />
          Click-Through Rate (CTR)
        </h4>
        <div className="space-y-1 sm:space-y-1.5">
          {ctrData.slice(0, 6).map((project, index) => {
            const ctrColor = project.ctr >= 100 ? '#10B981' :
                            project.ctr >= 50 ? '#3B82F6' :
                            project.ctr >= 25 ? '#F59E0B' : '#6B7280';
            const barWidth = maxCtr > 0 ? (project.ctr / maxCtr) * 100 : 0;

            return (
              <motion.div
                key={project.project_id}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-white/5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs font-medium text-foreground truncate flex-1 mr-2">
                    {project.project_title}
                  </span>
                  <span
                    className="text-[10px] sm:text-xs font-bold flex-shrink-0"
                    style={{ color: ctrColor }}
                  >
                    {project.ctr.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1 sm:h-1.5 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: ctrColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>
                <div className="flex justify-between mt-0.5 sm:mt-1">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                    {project.total_clicks} clicks / {project.total_unique_viewers} views
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTR Summary */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-2 sm:mt-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-tech-accent/10 text-center">
            <div className="text-sm sm:text-lg font-bold text-tech-accent">{avgCtr.toFixed(0)}%</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground">Avg CTR</div>
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-center">
            <div className="text-sm sm:text-lg font-bold text-emerald-400">
              {ctrData.filter(p => p.ctr >= 50).length}
            </div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground">High CTR</div>
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-tech-neon/10 text-center">
            <div className="text-sm sm:text-lg font-bold text-tech-neon">
              {ctrData[0]?.ctr.toFixed(0) || 0}%
            </div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground">Best CTR</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof MousePointer;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
      <Icon size={12} style={{ color }} className="mx-auto mb-0.5 sm:mb-1 sm:hidden" />
      <Icon size={14} style={{ color }} className="mx-auto mb-0.5 sm:mb-1 hidden sm:block" />
      <div className="text-xs sm:text-sm font-bold text-foreground">{value}</div>
      <div className="text-[8px] sm:text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

// Sections View - Full funnel with all details (slightly compact)
function SectionsView({ sections }: { sections: SectionData[] }) {
  if (!sections || sections.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No section data available</p>
      </div>
    );
  }

  // Calculate summaries
  const healthySections = sections.filter(s => s.health_tier === 'excellent' || s.health_tier === 'good').length;
  const problemSections = sections.filter(s => s.dropoff_indicator === 'high_dropoff');
  const stickySections = sections.filter(s => s.avg_revisits_per_session >= 1.5);

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Main Funnel Visualization - uses the full SectionFunnel component */}
      <div>
        <h4 className="text-[11px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
          <Layers size={10} className="text-tech-neon sm:hidden" />
          <Layers size={12} className="text-tech-neon hidden sm:block" />
          Portfolio Section Funnel
        </h4>
        <SectionFunnel data={sections} />
      </div>

      {/* Optimization Hints for Problem Sections */}
      {problemSections.length > 0 && (
        <div className="space-y-1 sm:space-y-1.5 pt-2 border-t border-muted/20">
          <h4 className="text-[11px] sm:text-xs font-semibold text-amber-400 flex items-center gap-1 sm:gap-1.5">
            <AlertTriangle size={10} className="sm:hidden" />
            <AlertTriangle size={12} className="hidden sm:block" />
            Needs Attention ({problemSections.length})
          </h4>
          {problemSections.slice(0, 1).map((section) => (
            <div
              key={section.section_id}
              className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-xs font-medium text-foreground">
                  {formatSectionName(section.section_id)}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-red-400">
                  {section.avg_exit_rate.toFixed(0)}% exit
                </span>
              </div>
              {section.optimization_hint && (
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                  {section.optimization_hint}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-muted/20 mb-1 sm:mb-2">
        <div className="p-1.5 sm:p-2.5 rounded-lg bg-emerald-500/10 text-center">
          <div className="text-sm sm:text-lg font-bold text-emerald-400">{healthySections}</div>
          <div className="text-[8px] sm:text-[10px] text-muted-foreground">Healthy</div>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-lg bg-red-500/10 text-center">
          <div className="text-sm sm:text-lg font-bold text-red-400">{problemSections.length}</div>
          <div className="text-[8px] sm:text-[10px] text-muted-foreground">High Drop-off</div>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-lg bg-purple-500/10 text-center">
          <div className="text-sm sm:text-lg font-bold text-purple-400">{stickySections.length}</div>
          <div className="text-[8px] sm:text-[10px] text-muted-foreground">Sticky</div>
        </div>
      </div>
    </div>
  );
}
