import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

// Types
interface TechDemand {
  skill_name: string;
  total_interactions: number;
  demand_rank: number;
  demand_tier: string;
}

interface ExperienceRanking {
  experience_id: string;
  experience_title: string;
  company: string;
  total_interactions: number;
  interest_rank: number;
  role_attractiveness: string;
  positioning_suggestion?: string;
}

interface MarketDemandCardProps {
  skills: TechDemand[];
  experiences: ExperienceRanking[];
}

type TabType = 'skills' | 'experience';

export function MarketDemandCard({ skills, experiences }: MarketDemandCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('skills');

  const tabs: { id: TabType; label: string; icon: typeof Code }[] = [
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
  ];

  return (
    <motion.div
      className="rounded-2xl bg-white/70 dark:bg-tech-glass backdrop-blur-xl border border-black/5 dark:border-white/10 overflow-hidden"
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
        {activeTab === 'skills' && <SkillsView skills={skills} />}
        {activeTab === 'experience' && <ExperienceView experiences={experiences} />}
      </div>
    </motion.div>
  );
}

// Skills View
function SkillsView({ skills }: { skills: TechDemand[] }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No skill data available</p>
      </div>
    );
  }

  const maxInteractions = Math.max(...skills.map(s => s.total_interactions));
  const highDemand = skills.filter(s => s.demand_tier === 'high_demand');

  return (
    <div className="space-y-4">
      {/* Skill Rankings */}
      <div className="space-y-1.5">
        {skills.slice(0, 6).map((skill, index) => {
          const tierColor = skill.demand_tier === 'high_demand' ? '#10B981' :
                           skill.demand_tier === 'moderate_demand' ? '#3B82F6' : '#6B7280';
          const barWidth = (skill.total_interactions / maxInteractions) * 100;

          return (
            <motion.div
              key={skill.skill_name}
              className="p-2 rounded-lg bg-gray-50 dark:bg-white/5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    skill.demand_rank <= 3 ? 'bg-tech-neon/20 text-tech-neon' : 'bg-gray-500/20 text-muted-foreground'
                  }`}
                >
                  {skill.demand_rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-foreground truncate">
                      {skill.skill_name}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: tierColor }}
                    >
                      {skill.total_interactions}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: tierColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
          <div className="text-lg font-bold text-tech-neon">{skills.length}</div>
          <div className="text-[10px] text-muted-foreground">Skills Tracked</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
          <div className="text-lg font-bold text-emerald-400">{highDemand.length}</div>
          <div className="text-[10px] text-muted-foreground">High Demand</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
          <div className="text-lg font-bold text-tech-accent">
            {skills.reduce((s, t) => s + t.total_interactions, 0)}
          </div>
          <div className="text-[10px] text-muted-foreground">Interactions</div>
        </div>
      </div>
    </div>
  );
}

// Experience View
function ExperienceView({ experiences }: { experiences: ExperienceRanking[] }) {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No experience data available</p>
      </div>
    );
  }

  const maxInteractions = Math.max(...experiences.map(e => e.total_interactions));

  return (
    <div className="space-y-2">
      {experiences.map((exp, index) => {
        const attractivenessColor = exp.role_attractiveness === 'high' ? '#10B981' :
                                    exp.role_attractiveness === 'medium' ? '#3B82F6' : '#6B7280';
        const barWidth = (exp.total_interactions / maxInteractions) * 100;

        return (
          <motion.div
            key={exp.experience_id}
            className="p-3 rounded-lg bg-gray-50 dark:bg-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-2">
              <span
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  exp.interest_rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                  exp.interest_rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                  exp.interest_rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-500/20 text-muted-foreground'
                }`}
              >
                {exp.interest_rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {exp.experience_title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate">{exp.company}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ backgroundColor: `${attractivenessColor}20`, color: attractivenessColor }}
                    >
                      {exp.role_attractiveness || 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {exp.total_interactions} views
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden mt-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: attractivenessColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>

                {/* Positioning suggestion */}
                {exp.positioning_suggestion && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-start gap-1">
                    <TrendingUp size={10} className="flex-shrink-0 mt-0.5 text-tech-accent" />
                    {exp.positioning_suggestion}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-muted/20">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
          <div className="text-lg font-bold text-tech-neon">
            {experiences.reduce((s, e) => s + e.total_interactions, 0)}
          </div>
          <div className="text-[10px] text-muted-foreground">Total Views</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
          <div className="text-lg font-bold text-emerald-400">
            {experiences.filter(e => e.role_attractiveness === 'high').length}
          </div>
          <div className="text-[10px] text-muted-foreground">High Attractiveness</div>
        </div>
      </div>
    </div>
  );
}
