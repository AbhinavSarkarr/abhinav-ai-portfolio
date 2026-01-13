import { motion } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle, TrendingDown, Eye, LogOut } from 'lucide-react';

interface SectionData {
  section_id: string;
  total_views: number;
  total_unique_viewers: number;
  total_engaged_views: number;
  avg_engagement_rate: number;
  avg_time_spent_seconds: number;
  avg_scroll_depth_percent: number;
  total_exits: number;
  avg_exit_rate: number;
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

export function SectionFunnel({ data }: SectionFunnelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No section data available yet</p>
      </div>
    );
  }

  // Sort by views descending (natural funnel order)
  const sortedSections = [...data].sort((a, b) => b.total_views - a.total_views);
  const maxViews = sortedSections[0]?.total_views || 1;

  return (
    <div className="space-y-2">
      {sortedSections.map((section, index) => {
        const widthPercent = (section.total_views / maxViews) * 100;
        const dropoffConfig = getDropoffConfig(section.dropoff_indicator);
        const DropoffIcon = dropoffConfig.icon;
        const healthColor = getHealthColor(section.health_tier);

        return (
          <motion.div
            key={section.section_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            {/* Section Row */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-1">
                {/* Rank Badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: `${healthColor}20`, color: healthColor }}
                >
                  {index + 1}
                </div>

                {/* Section Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {formatSectionName(section.section_id)}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-foreground">
                        {section.total_views} views
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${dropoffConfig.bgColor}`}
                        style={{ color: dropoffConfig.color }}
                      >
                        <DropoffIcon size={12} />
                        {section.avg_exit_rate.toFixed(0)}% exit
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (funnel shape) */}
                  <div className="h-6 bg-muted/20 rounded-lg overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-lg flex items-center justify-end pr-3"
                      style={{
                        background: `linear-gradient(90deg, ${healthColor}40, ${healthColor}20)`,
                        borderLeft: `3px solid ${healthColor}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      {widthPercent > 30 && (
                        <span className="text-xs font-medium text-foreground/80">
                          {section.avg_time_spent_seconds.toFixed(0)}s avg
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Drop-off Indicator Arrow */}
              {index < sortedSections.length - 1 && section.total_exits > 0 && (
                <div className="ml-11 flex items-center gap-2 py-1">
                  <ChevronDown size={14} className="text-muted-foreground" />
                  <span className="text-sm text-red-400 flex items-center gap-1">
                    <LogOut size={12} />
                    {section.total_exits} visitors left here
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
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-400" />
        Sections with High Drop-off
      </h4>
      {highDropoff.map((section) => (
        <div
          key={section.section_id}
          className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <span className="text-sm text-foreground">{formatSectionName(section.section_id)}</span>
          <span className="text-sm font-bold text-red-400">{section.avg_exit_rate.toFixed(0)}% exit</span>
        </div>
      ))}
    </div>
  );
}
