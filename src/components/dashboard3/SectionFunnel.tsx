import { motion } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle, TrendingDown, Eye, LogOut, RefreshCw, Sparkles } from 'lucide-react';

interface SectionData {
  section_id: string;
  // Unique metrics (for funnel analysis - each session counts once)
  total_unique_views: number;
  total_unique_exits: number;
  total_unique_viewers: number;
  avg_exit_rate: number;  // Based on unique, always <=100%
  // Total metrics (for engagement analysis - includes revisits)
  total_views: number;
  total_exits: number;
  avg_total_exit_rate: number;
  avg_revisits_per_session: number;
  // Engagement metrics
  total_engaged_views: number;
  avg_engagement_rate: number;
  avg_time_spent_seconds: number;
  avg_scroll_depth_percent: number;
  // Scores and rankings
  health_score: number;
  engagement_rank: number;
  health_tier: string;
  dropoff_indicator: string;
  optimization_hint: string;
}

interface SectionFunnelProps {
  data: SectionData[];
}

// Format section names for display
function formatSectionName(sectionId: string): string {
  const nameMap: Record<string, string> = {
    'hero': 'Hero / Introduction',
    'about': 'About Me',
    'skills': 'Skills & Technologies',
    'experience': 'Work Experience',
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

// Get dropoff indicator icon and color
function getDropoffConfig(indicator: string) {
  switch (indicator.toLowerCase()) {
    case 'high_dropoff':
      return { icon: AlertTriangle, color: '#EF4444', label: 'High Drop-off', bgColor: 'bg-red-500/10' };
    case 'moderate_dropoff':
      return { icon: TrendingDown, color: '#F59E0B', label: 'Moderate', bgColor: 'bg-amber-500/10' };
    case 'low_dropoff':
      return { icon: CheckCircle, color: '#10B981', label: 'Good Retention', bgColor: 'bg-emerald-500/10' };
    default:
      return { icon: Eye, color: '#6B7280', label: 'Unknown', bgColor: 'bg-gray-500/10' };
  }
}

// Get stickiness indicator based on revisit rate
function getStickinessConfig(revisits: number) {
  if (revisits >= 2.0) {
    return { color: '#8B5CF6', label: 'Very Sticky', bgColor: 'bg-purple-500/10', isSticky: true };
  } else if (revisits >= 1.5) {
    return { color: '#3B82F6', label: 'Sticky', bgColor: 'bg-blue-500/10', isSticky: true };
  } else if (revisits >= 1.2) {
    return { color: '#6B7280', label: 'Normal', bgColor: 'bg-gray-500/10', isSticky: false };
  } else {
    return { color: '#6B7280', label: 'Linear', bgColor: 'bg-gray-500/10', isSticky: false };
  }
}

export function SectionFunnel({ data }: SectionFunnelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No section data available yet</p>
      </div>
    );
  }

  // Sort by unique views descending (natural funnel order - each session counts once)
  const sortedSections = [...data].sort((a, b) => b.total_unique_views - a.total_unique_views);
  const maxViews = sortedSections[0]?.total_unique_views || 1;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {sortedSections.map((section, index) => {
        const widthPercent = (section.total_unique_views / maxViews) * 100;
        const dropoffConfig = getDropoffConfig(section.dropoff_indicator);
        const DropoffIcon = dropoffConfig.icon;
        const healthColor = getHealthColor(section.health_tier);
        const stickinessConfig = getStickinessConfig(section.avg_revisits_per_session);

        return (
          <motion.div
            key={section.section_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            {/* Section Row */}
            <div className="relative">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-0.5 sm:mb-1">
                {/* Rank Badge */}
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: `${healthColor}20`, color: healthColor }}
                >
                  {index + 1}
                </div>

                {/* Section Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground truncate">
                      {formatSectionName(section.section_id)}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">
                        {section.total_unique_views}
                      </span>
                      {/* Stickiness Badge - only show if sticky */}
                      {stickinessConfig.isSticky && (
                        <span
                          className={`hidden md:flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-medium ${stickinessConfig.bgColor}`}
                          style={{ color: stickinessConfig.color }}
                          title={`${section.avg_revisits_per_session.toFixed(1)}x revisits per session`}
                        >
                          <RefreshCw size={10} />
                          {section.avg_revisits_per_session.toFixed(1)}x
                        </span>
                      )}
                      {/* Exit Rate Badge */}
                      <span
                        className={`flex items-center gap-0.5 px-1 sm:px-1.5 md:px-2 py-0.5 rounded text-[9px] sm:text-[10px] md:text-xs font-medium ${dropoffConfig.bgColor}`}
                        style={{ color: dropoffConfig.color }}
                      >
                        <DropoffIcon size={8} className="sm:hidden" />
                        <DropoffIcon size={10} className="hidden sm:block md:hidden" />
                        <DropoffIcon size={12} className="hidden md:block" />
                        {section.avg_exit_rate.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (funnel shape) */}
                  <div className="h-3 sm:h-4 md:h-6 bg-muted/20 rounded-md sm:rounded-lg overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-md sm:rounded-lg flex items-center justify-end pr-1.5 sm:pr-2 md:pr-3"
                      style={{
                        background: `linear-gradient(90deg, ${healthColor}40, ${healthColor}20)`,
                        borderLeft: `2px solid ${healthColor}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      {widthPercent > 50 && (
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-foreground/80">
                          {section.avg_time_spent_seconds.toFixed(0)}s
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Drop-off Indicator Arrow - Hidden on mobile */}
              {index < sortedSections.length - 1 && section.total_unique_exits > 0 && (
                <div className="hidden md:flex ml-11 items-center gap-2 py-1">
                  <ChevronDown size={14} className="text-muted-foreground" />
                  <span className="text-sm text-red-400 flex items-center gap-1">
                    <LogOut size={12} />
                    {section.total_unique_exits} sessions ended here
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

    </div>
  );
}

// Compact version for dashboard overview
interface SectionDropoffSummaryProps {
  data: SectionData[];
}

export function SectionDropoffSummary({ data }: SectionDropoffSummaryProps) {
  if (!data || data.length === 0) return null;

  // Find sections with highest drop-off
  const highDropoff = data
    .filter(s => s.dropoff_indicator === 'high_dropoff' || s.avg_exit_rate > 40)
    .sort((a, b) => b.avg_exit_rate - a.avg_exit_rate)
    .slice(0, 3);

  if (highDropoff.length === 0) return null;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h4 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
        <AlertTriangle size={12} className="text-amber-400 sm:hidden" />
        <AlertTriangle size={14} className="text-amber-400 hidden sm:block" />
        Sections with High Drop-off
      </h4>
      {highDropoff.map((section) => (
        <div
          key={section.section_id}
          className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <span className="text-xs sm:text-sm text-foreground">{formatSectionName(section.section_id)}</span>
          <span className="text-xs sm:text-sm font-bold text-red-400">{section.avg_exit_rate.toFixed(0)}% exit</span>
        </div>
      ))}
    </div>
  );
}

// Stickiness Summary - shows sections users revisit most
interface SectionStickinessSummaryProps {
  data: SectionData[];
}

export function SectionStickinessSummary({ data }: SectionStickinessSummaryProps) {
  if (!data || data.length === 0) return null;

  // Find sections with highest stickiness (revisits >= 1.5)
  const stickySections = data
    .filter(s => s.avg_revisits_per_session >= 1.5)
    .sort((a, b) => b.avg_revisits_per_session - a.avg_revisits_per_session)
    .slice(0, 3);

  if (stickySections.length === 0) return null;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h4 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
        <Sparkles size={12} className="text-purple-400 sm:hidden" />
        <Sparkles size={14} className="text-purple-400 hidden sm:block" />
        Most Engaging Sections
      </h4>
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
        Sections users revisit multiple times per session
      </p>
      {stickySections.map((section) => {
        const config = getStickinessConfig(section.avg_revisits_per_session);
        return (
          <div
            key={section.section_id}
            className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg ${config.bgColor} border border-purple-500/20`}
          >
            <span className="text-xs sm:text-sm text-foreground">{formatSectionName(section.section_id)}</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <RefreshCw size={10} className="sm:hidden" style={{ color: config.color }} />
              <RefreshCw size={12} className="hidden sm:block" style={{ color: config.color }} />
              <span className="text-xs sm:text-sm font-bold" style={{ color: config.color }}>
                {section.avg_revisits_per_session.toFixed(1)}x
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
