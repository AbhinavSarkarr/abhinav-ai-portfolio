import { motion } from 'framer-motion';
import { ProjectRanking, formatNumber } from '@/hooks/useDashboardData';
import { Eye, MousePointerClick, TrendingUp, Star, Award, Medal } from 'lucide-react';
import { chartTheme } from '@/lib/chartTheme';

type ProjectRankingListProps = {
  data: ProjectRanking[];
};

const RANK_BADGES = [
  { icon: Award, color: '#FFD700', bg: 'bg-yellow-500/20' },
  { icon: Medal, color: '#C0C0C0', bg: 'bg-gray-400/20' },
  { icon: Medal, color: '#CD7F32', bg: 'bg-orange-500/20' },
];

export function ProjectRankingList({ data }: ProjectRankingListProps) {
  const sortedProjects = [...data].sort((a, b) => a.overall_rank - b.overall_rank);

  return (
    <div className="space-y-4">
      {/* Header info */}
      <p className="text-sm text-muted-foreground">
        Projects ranked by engagement score (views, clicks, and interaction depth)
      </p>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedProjects.map((project, index) => {
          const rankBadge = RANK_BADGES[index];
          const isTop3 = index < 3;
          const ctr = project.total_views > 0
            ? ((project.total_clicks / project.total_views) * 100).toFixed(1)
            : '0';

          return (
            <motion.div
              key={project.project_id}
              className={`glass-card relative overflow-hidden ${
                isTop3 ? 'ring-1 ring-tech-neon/30' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              {/* Rank badge */}
              <div
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${
                  rankBadge?.bg || 'bg-white/10'
                }`}
              >
                {rankBadge ? (
                  <rankBadge.icon size={16} style={{ color: rankBadge.color }} />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    #{project.overall_rank}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="pr-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-tech-accent">
                    #{project.overall_rank}
                  </span>
                  {project.recommended_position === 'featured' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      Featured
                    </span>
                  )}
                </div>

                <h4 className="font-semibold text-black dark:text-white mb-3 line-clamp-2">
                  {project.project_title}
                </h4>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <Eye size={14} className="mx-auto text-tech-neon mb-1" />
                    <span className="block text-sm font-semibold text-black dark:text-white">
                      {formatNumber(project.total_views)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Views</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <MousePointerClick size={14} className="mx-auto text-tech-accent mb-1" />
                    <span className="block text-sm font-semibold text-black dark:text-white">
                      {formatNumber(project.total_clicks)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Clicks</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <TrendingUp size={14} className="mx-auto text-green-400 mb-1" />
                    <span className="block text-sm font-semibold text-black dark:text-white">
                      {ctr}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">CTR</span>
                  </div>
                </div>

                {/* Engagement score bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Engagement Score</span>
                    <span className="text-black dark:text-white font-medium">
                      {project.engagement_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${chartTheme.colors.primary}, ${chartTheme.colors.accent})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(project.engagement_score, 100)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary insight */}
      <div className="p-4 rounded-xl bg-tech-neon/10 border border-tech-neon/20">
        <div className="flex items-start gap-3">
          <Star size={18} className="text-tech-neon mt-0.5" />
          <div>
            <p className="text-sm font-medium text-black dark:text-white">Recommended Order</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on visitor engagement, consider ordering your projects as shown above.
              {sortedProjects[0] && (
                <span className="text-tech-accent">
                  {' '}{sortedProjects[0].project_title} should be featured prominently.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
