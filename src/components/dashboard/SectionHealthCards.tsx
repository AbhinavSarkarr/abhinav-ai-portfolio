import { motion } from 'framer-motion';
import { SectionRanking, getHealthColor } from '@/hooks/useDashboardData';
import { ProgressRing, StatusBadge } from './GlassCard';
import {
  Home,
  User,
  Briefcase,
  FolderKanban,
  Code2,
  Mail,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  LogOut,
} from 'lucide-react';

type SectionHealthCardsProps = {
  data: SectionRanking[];
};

const SECTION_ICONS: Record<string, typeof Home> = {
  hero: Home,
  about: User,
  experience: Briefcase,
  projects: FolderKanban,
  skills: Code2,
  contact: Mail,
};

const OPTIMIZATION_HINTS: Record<string, { label: string; icon: typeof Lightbulb }> = {
  performing_well: { label: 'Performing well', icon: CheckCircle },
  improve_content: { label: 'Improve content quality', icon: TrendingUp },
  add_cta_or_navigation: { label: 'Add CTA or better navigation', icon: Lightbulb },
  hook_earlier: { label: 'Hook visitors earlier', icon: AlertTriangle },
  make_more_engaging: { label: 'Make more engaging', icon: Lightbulb },
};

export function SectionHealthCards({ data }: SectionHealthCardsProps) {
  const sortedSections = [...data].sort((a, b) => a.engagement_rank - b.engagement_rank);

  // Calculate overall site health
  const avgHealth = data.reduce((sum, s) => sum + s.health_score, 0) / data.length;
  const criticalSections = data.filter(
    (s) => s.health_tier === 'needs_attention' || s.health_tier === 'critical'
  );

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 flex items-center gap-4">
          <ProgressRing value={avgHealth} size={70} label="avg" />
          <div>
            <p className="text-sm text-muted-foreground">Overall Health</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              {avgHealth >= 70 ? 'Good' : avgHealth >= 50 ? 'Fair' : 'Needs Work'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-sm text-muted-foreground mb-1">Sections Tracked</p>
          <p className="text-2xl font-bold text-black dark:text-white">{data.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-sm text-muted-foreground mb-1">Need Attention</p>
          <p className="text-2xl font-bold text-amber-400">{criticalSections.length}</p>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSections.map((section, index) => {
          const Icon = SECTION_ICONS[section.section_id] || FolderKanban;
          const healthColor = getHealthColor(section.health_tier);
          const hint = OPTIMIZATION_HINTS[section.optimization_hint] || OPTIMIZATION_HINTS.performing_well;

          return (
            <motion.div
              key={section.section_id}
              className="glass-card relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${healthColor}20` }}
                  >
                    <Icon size={18} style={{ color: healthColor }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black dark:text-white capitalize">
                      {section.section_id}
                    </h4>
                    <StatusBadge status={section.health_tier} size="sm" />
                  </div>
                </div>
                <ProgressRing value={section.health_score} size={50} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <span className="block text-sm font-semibold text-black dark:text-white">
                    {section.total_views}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Views</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <span className="block text-sm font-semibold text-green-400">
                    {section.avg_engagement_rate.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">Engaged</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center gap-1">
                    <LogOut size={10} className="text-red-400" />
                    <span className="text-sm font-semibold text-red-400">
                      {section.avg_exit_rate.toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Exit</span>
                </div>
              </div>

              {/* Optimization hint */}
              {section.optimization_hint !== 'performing_well' && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{ backgroundColor: `${healthColor}10` }}
                >
                  <hint.icon size={14} style={{ color: healthColor }} className="mt-0.5" />
                  <span className="text-xs" style={{ color: healthColor }}>
                    {hint.label}
                  </span>
                </div>
              )}

              {section.optimization_hint === 'performing_well' && (
                <div className="p-3 rounded-lg bg-green-500/10 flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                  <span className="text-xs text-green-400">Performing well</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Priority Actions */}
      {criticalSections.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-black dark:text-white">Priority Actions</p>
              <ul className="mt-2 space-y-1">
                {criticalSections.map((section) => {
                  const hint = OPTIMIZATION_HINTS[section.optimization_hint];
                  return (
                    <li key={section.section_id} className="text-xs text-muted-foreground">
                      <span className="capitalize text-amber-400">{section.section_id}</span>
                      : {hint?.label || section.optimization_hint.replace(/_/g, ' ')}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
