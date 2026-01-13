import { useMemo } from 'react';
import { DashboardData } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  MousePointerClick,
  FileDown,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

type KeyInsightsPanelProps = {
  data: DashboardData;
};

type Insight = {
  id: string;
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  metric?: string;
  impact?: string;
  icon: React.ReactNode;
};

export function KeyInsightsPanel({ data }: KeyInsightsPanelProps) {
  const insights = useMemo(() => {
    const generatedInsights: Insight[] = [];

    const avgDailyVisitors = data.overview.total_visitors_7d / 7;
    if (avgDailyVisitors > 10) {
      generatedInsights.push({
        id: 'high-traffic',
        type: 'success',
        title: 'Strong Traffic',
        description: `${avgDailyVisitors.toFixed(1)} visitors/day average`,
        metric: `${data.overview.total_visitors_7d}`,
        impact: 'total visitors',
        icon: <Users size={16} />,
      });
    }

    if (data.overview.engagement_rate > 50) {
      generatedInsights.push({
        id: 'high-engagement',
        type: 'success',
        title: 'Excellent Engagement',
        description: 'Over half of visitors engage',
        metric: `${data.overview.engagement_rate.toFixed(1)}%`,
        impact: 'engagement rate',
        icon: <MousePointerClick size={16} />,
      });
    } else if (data.overview.engagement_rate < 30) {
      generatedInsights.push({
        id: 'low-engagement',
        type: 'warning',
        title: 'Low Engagement',
        description: 'Add more interactive elements',
        metric: `${data.overview.engagement_rate.toFixed(1)}%`,
        impact: 'engagement rate',
        icon: <TrendingDown size={16} />,
      });
    }

    if (data.overview.bounce_rate > 40) {
      generatedInsights.push({
        id: 'high-bounce',
        type: 'warning',
        title: 'High Bounce Rate',
        description: 'Visitors leaving after one page',
        metric: `${data.overview.bounce_rate.toFixed(1)}%`,
        impact: 'bounce rate',
        icon: <AlertTriangle size={16} />,
      });
    }

    const topSource = data.trafficSources.reduce((max, s) =>
      s.sessions > max.sessions ? s : max, data.trafficSources[0]);
    if (topSource) {
      const sourceShare = (topSource.sessions / data.overview.total_sessions_7d) * 100;
      generatedInsights.push({
        id: 'top-source',
        type: 'info',
        title: `Top Source: ${topSource.source === 'direct' ? 'Direct' : topSource.source}`,
        description: `${sourceShare.toFixed(0)}% of all traffic`,
        metric: `${topSource.sessions}`,
        impact: 'sessions',
        icon: <BarChart3 size={16} />,
      });
    }

    const topProject = data.projects.find(p => p.overall_rank === 1);
    if (topProject) {
      generatedInsights.push({
        id: 'top-project',
        type: 'success',
        title: 'Top Project',
        description: topProject.project_title,
        metric: `${topProject.total_clicks}`,
        impact: 'clicks',
        icon: <Target size={16} />,
      });
    }

    const hotSkills = data.skills.filter(s => s.demand_tier === 'high_demand');
    if (hotSkills.length > 0) {
      generatedInsights.push({
        id: 'hot-skills',
        type: 'opportunity',
        title: `${hotSkills.length} Hot Skills`,
        description: hotSkills.slice(0, 3).map(s => s.skill_name).join(', '),
        icon: <Zap size={16} />,
      });
    }

    const criticalSections = data.sections.filter(s => s.health_tier === 'critical' || s.health_tier === 'needs_attention');
    if (criticalSections.length > 0) {
      generatedInsights.push({
        id: 'section-health',
        type: 'warning',
        title: `${criticalSections.length} Sections Need Work`,
        description: criticalSections.map(s => s.section_id).join(', '),
        icon: <AlertCircle size={16} />,
      });
    }

    if (data.overview.resume_downloads > 5) {
      generatedInsights.push({
        id: 'resume-downloads',
        type: 'success',
        title: 'Resume Interest',
        description: 'Strong download activity',
        metric: `${data.overview.resume_downloads}`,
        impact: 'downloads',
        icon: <FileDown size={16} />,
      });
    }

    return generatedInsights;
  }, [data]);

  const getTypeConfig = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-emerald-500 to-tech-accent',
          glow: 'shadow-emerald-500/20',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: <CheckCircle2 size={14} className="text-emerald-400" />,
          label: 'WIN'
        };
      case 'warning':
        return {
          gradient: 'from-amber-500 to-orange-500',
          glow: 'shadow-amber-500/20',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: <AlertTriangle size={14} className="text-amber-400" />,
          label: 'ATTENTION'
        };
      case 'opportunity':
        return {
          gradient: 'from-tech-neon to-purple-500',
          glow: 'shadow-tech-neon/20',
          text: 'text-tech-neon',
          bg: 'bg-tech-neon/10',
          border: 'border-tech-neon/30',
          icon: <Sparkles size={14} className="text-tech-neon" />,
          label: 'OPPORTUNITY'
        };
      case 'info':
      default:
        return {
          gradient: 'from-tech-accent to-blue-500',
          glow: 'shadow-tech-accent/20',
          text: 'text-tech-accent',
          bg: 'bg-tech-accent/10',
          border: 'border-tech-accent/30',
          icon: <Info size={14} className="text-tech-accent" />,
          label: 'INSIGHT'
        };
    }
  };

  const groupedInsights = {
    success: insights.filter(i => i.type === 'success'),
    warning: insights.filter(i => i.type === 'warning'),
    opportunity: insights.filter(i => i.type === 'opportunity'),
    info: insights.filter(i => i.type === 'info'),
  };

  return (
    <div className="glass-card !p-0 overflow-hidden">
      {/* Header Stats Bar */}
      <div className="flex items-stretch border-b border-white/10">
        <div className="flex-1 p-3 sm:p-4 text-center border-r border-white/10 group">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">{groupedInsights.success.length}</span>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Wins</span>
        </div>
        <div className="flex-1 p-3 sm:p-4 text-center border-r border-white/10 group">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xl sm:text-2xl font-bold text-amber-400">{groupedInsights.warning.length}</span>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Risks</span>
        </div>
        <div className="flex-1 p-3 sm:p-4 text-center border-r border-white/10 group">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-tech-neon animate-pulse" />
            <span className="text-xl sm:text-2xl font-bold text-tech-neon">{groupedInsights.opportunity.length}</span>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Opportunities</span>
        </div>
        <div className="flex-1 p-3 sm:p-4 text-center group">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-tech-accent animate-pulse" />
            <span className="text-xl sm:text-2xl font-bold text-tech-accent">{groupedInsights.info.length}</span>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Insights</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-3 sm:p-4 space-y-2">
        {insights.map((insight, index) => {
          const config = getTypeConfig(insight.type);

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex items-center gap-3 p-3 rounded-xl ${config.bg} border ${config.border} group`}
            >
              {/* Left accent line */}
              <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b ${config.gradient}`} />

              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center ${config.text}`}>
                {insight.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${config.text}`}>{insight.title}</span>
                  {insight.metric && (
                    <span className="text-white font-bold text-sm">
                      {insight.metric}
                      {insight.impact && <span className="text-gray-400 font-normal text-xs ml-1">{insight.impact}</span>}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{insight.description}</p>
              </div>

              {/* Type badge */}
              <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
                {config.icon}
                <span>{config.label}</span>
              </div>
            </motion.div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insights available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
