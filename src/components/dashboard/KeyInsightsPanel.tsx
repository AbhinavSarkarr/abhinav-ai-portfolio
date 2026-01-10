import { useMemo } from 'react';
import { DashboardData } from '@/hooks/useDashboardData';
import { ChevronRight } from 'lucide-react';

type KeyInsightsPanelProps = {
  data: DashboardData;
};

type Insight = {
  id: string;
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  metric?: string;
  action?: string;
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
        description: `Averaging ${avgDailyVisitors.toFixed(1)} visitors/day`,
        metric: `${data.overview.total_visitors_7d} total`,
      });
    }

    if (data.overview.engagement_rate > 50) {
      generatedInsights.push({
        id: 'high-engagement',
        type: 'success',
        title: 'Excellent Engagement',
        description: 'Over half of visitors engage with content',
        metric: `${data.overview.engagement_rate.toFixed(1)}%`,
      });
    } else if (data.overview.engagement_rate < 30) {
      generatedInsights.push({
        id: 'low-engagement',
        type: 'warning',
        title: 'Low Engagement',
        description: 'Consider adding more interactive elements',
        metric: `${data.overview.engagement_rate.toFixed(1)}%`,
        action: 'Add CTAs',
      });
    }

    if (data.overview.bounce_rate > 40) {
      generatedInsights.push({
        id: 'high-bounce',
        type: 'warning',
        title: 'High Bounce Rate',
        description: 'Many visitors leave after one page',
        metric: `${data.overview.bounce_rate.toFixed(1)}%`,
        action: 'Improve content',
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
        description: `${sourceShare.toFixed(0)}% of all sessions`,
        metric: `${topSource.sessions} sessions`,
      });
    }

    const topProject = data.projects.find(p => p.overall_rank === 1);
    if (topProject) {
      generatedInsights.push({
        id: 'top-project',
        type: 'success',
        title: `Top Project`,
        description: topProject.project_title,
        metric: `${topProject.total_clicks} clicks`,
      });
    }

    const hotSkills = data.skills.filter(s => s.demand_tier === 'high_demand');
    if (hotSkills.length > 0) {
      generatedInsights.push({
        id: 'hot-skills',
        type: 'opportunity',
        title: `${hotSkills.length} High-Demand Skills`,
        description: hotSkills.slice(0, 3).map(s => s.skill_name).join(', '),
        action: 'Feature prominently',
      });
    }

    const criticalSections = data.sections.filter(s => s.health_tier === 'critical' || s.health_tier === 'needs_attention');
    if (criticalSections.length > 0) {
      generatedInsights.push({
        id: 'section-health',
        type: 'warning',
        title: `${criticalSections.length} Section(s) Need Work`,
        description: criticalSections.map(s => s.section_id).join(', '),
        action: 'Optimize',
      });
    }

    const ctaClickRate = data.conversionFunnel.cta_views > 0
      ? (data.conversionFunnel.cta_clicks / data.conversionFunnel.cta_views) * 100
      : 0;
    if (ctaClickRate < 10 && data.conversionFunnel.cta_views > 0) {
      generatedInsights.push({
        id: 'weak-cta',
        type: 'opportunity',
        title: 'CTA Optimization',
        description: 'Click rate below average',
        metric: `${ctaClickRate.toFixed(1)}%`,
        action: 'Test variations',
      });
    }

    if (data.overview.resume_downloads > 5) {
      generatedInsights.push({
        id: 'resume-downloads',
        type: 'success',
        title: 'Resume Interest',
        description: 'Strong download activity',
        metric: `${data.overview.resume_downloads} downloads`,
      });
    }

    return generatedInsights;
  }, [data]);

  const getConfig = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return {
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'warning':
        return {
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'opportunity':
        return {
          dotColor: 'bg-tech-neon',
          textColor: 'text-violet-600 dark:text-tech-neon',
        };
      case 'info':
      default:
        return {
          dotColor: 'bg-tech-accent',
          textColor: 'text-cyan-600 dark:text-tech-accent',
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
    <div className="rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 sm:p-5">
      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 pb-4 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{groupedInsights.success.length} Wins</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{groupedInsights.warning.length} Warnings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tech-neon flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{groupedInsights.opportunity.length} Opportunities</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tech-accent flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{groupedInsights.info.length} Insights</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {insights.map((insight) => {
          const config = getConfig(insight.type);

          return (
            <div
              key={insight.id}
              className="py-3 flex items-start sm:items-center gap-3 sm:gap-4 group hover:bg-gray-50 dark:hover:bg-white/5 -mx-2 sm:-mx-3 px-2 sm:px-3 rounded-lg transition-colors"
            >
              {/* Status Dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 sm:mt-0 ${config.dotColor}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{insight.title}</span>
                  {insight.metric && (
                    <span className={`text-xs font-semibold ${config.textColor}`}>
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 sm:truncate">{insight.description}</p>
              </div>

              {/* Action */}
              {insight.action && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{insight.action}</span>
                  <ChevronRight size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
