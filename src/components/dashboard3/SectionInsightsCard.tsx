import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sparkles, RefreshCw } from 'lucide-react';

interface SectionData {
  section_id: string;
  health_score: number;
  health_tier: string;
  avg_revisits_per_session: number;
}

interface SectionInsightsCardProps {
  sections: SectionData[];
}

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
    'data-pipeline': 'Data-Pipeline',
  };
  return nameMap[sectionId.toLowerCase()] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

function getHealthColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'excellent': return '#10B981';
    case 'good': return '#3B82F6';
    case 'needs_attention': return '#F59E0B';
    case 'critical': return '#EF4444';
    default: return '#6B7280';
  }
}

type TabType = 'health' | 'engaging';

export function SectionInsightsCard({ sections }: SectionInsightsCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('health');

  if (!sections || sections.length === 0) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: typeof Activity }[] = [
    { id: 'health', label: 'Section Health', icon: Activity },
    { id: 'engaging', label: 'Most Engaging', icon: Sparkles },
  ];

  return (
    <motion.div
      className="rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-tech-neon border-b-2 border-tech-neon bg-white/50 dark:bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'health' && <HealthView sections={sections} />}
        {activeTab === 'engaging' && <EngagingView sections={sections} />}
      </div>
    </motion.div>
  );
}

// Section Health View
function HealthView({ sections }: { sections: SectionData[] }) {
  const sortedByHealth = [...sections].sort((a, b) => b.health_score - a.health_score);

  // Summary stats
  const excellentCount = sections.filter(s => s.health_tier === 'excellent').length;
  const goodCount = sections.filter(s => s.health_tier === 'good').length;
  const avgHealth = Math.round(sections.reduce((sum, s) => sum + s.health_score, 0) / sections.length);

  return (
    <div className="space-y-4">
      {/* Health List */}
      <div className="space-y-2">
        {sortedByHealth.slice(0, 8).map((section, index) => {
          const healthColor = getHealthColor(section.health_tier);
          return (
            <motion.div
              key={section.section_id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <span className="text-sm text-foreground capitalize">
                {formatSectionName(section.section_id)}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: healthColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${section.health_score}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right" style={{ color: healthColor }}>
                  {section.health_score.toFixed(section.health_score % 1 === 0 ? 0 : 2)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-muted/20">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
          <div className="text-lg font-bold text-emerald-400">{excellentCount}</div>
          <div className="text-[10px] text-muted-foreground">Excellent</div>
        </div>
        <div className="p-2 rounded-lg bg-blue-500/10 text-center">
          <div className="text-lg font-bold text-blue-400">{goodCount}</div>
          <div className="text-[10px] text-muted-foreground">Good</div>
        </div>
        <div className="p-2 rounded-lg bg-tech-accent/10 text-center">
          <div className="text-lg font-bold text-tech-accent">{avgHealth}</div>
          <div className="text-[10px] text-muted-foreground">Avg Score</div>
        </div>
      </div>
    </div>
  );
}

// Most Engaging View
function EngagingView({ sections }: { sections: SectionData[] }) {
  const stickySections = [...sections]
    .filter(s => s.avg_revisits_per_session > 0)
    .sort((a, b) => b.avg_revisits_per_session - a.avg_revisits_per_session);

  const highlyEngaging = stickySections.filter(s => s.avg_revisits_per_session >= 2.0);
  const moderatelyEngaging = stickySections.filter(s => s.avg_revisits_per_session >= 1.0 && s.avg_revisits_per_session < 2.0);
  const avgRevisits = stickySections.length > 0
    ? (stickySections.reduce((sum, s) => sum + s.avg_revisits_per_session, 0) / stickySections.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Sections users revisit multiple times
      </p>

      {/* Engaging Sections List */}
      {stickySections.length > 0 ? (
        <div className="space-y-2">
          {stickySections.slice(0, 8).map((section, index) => {
            const color = section.avg_revisits_per_session >= 2.0 ? '#8B5CF6' :
                         section.avg_revisits_per_session >= 1.0 ? '#3B82F6' : '#6B7280';
            return (
              <motion.div
                key={section.section_id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <span className="text-sm text-foreground">
                  {formatSectionName(section.section_id)}
                </span>
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} style={{ color }} />
                  <span className="text-sm font-bold" style={{ color }}>
                    {section.avg_revisits_per_session.toFixed(1)}x
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20 text-center">
          <div className="text-sm font-medium text-muted-foreground">No sticky sections yet</div>
          <p className="text-xs text-muted-foreground mt-1">Users viewing sections once and moving on</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-muted/20">
        <div className="p-2 rounded-lg bg-purple-500/10 text-center">
          <div className="text-lg font-bold text-purple-400">{highlyEngaging.length}</div>
          <div className="text-[10px] text-muted-foreground">Highly Engaging</div>
        </div>
        <div className="p-2 rounded-lg bg-blue-500/10 text-center">
          <div className="text-lg font-bold text-blue-400">{moderatelyEngaging.length}</div>
          <div className="text-[10px] text-muted-foreground">Moderate</div>
        </div>
        <div className="p-2 rounded-lg bg-tech-accent/10 text-center">
          <div className="text-lg font-bold text-tech-accent">{avgRevisits}x</div>
          <div className="text-[10px] text-muted-foreground">Avg Revisits</div>
        </div>
      </div>
    </div>
  );
}
