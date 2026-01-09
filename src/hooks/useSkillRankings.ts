import { useState, useEffect } from 'react';

export type SkillRanking = {
  skill_name: string;
  skill_category: string;
  clicks: number;
  demand_rank: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'emerging' | 'niche';
  learning_priority: string;
};

type SkillRankingsData = {
  rankings: Map<string, SkillRanking>;
  isLoading: boolean;
  error: Error | null;
  updatedAt: string | null;
};

export function useSkillRankings(): SkillRankingsData {
  const [rankings, setRankings] = useState<Map<string, SkillRanking>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const [rankingsRes, metaRes] = await Promise.all([
          fetch('/data/skill-rankings.json'),
          fetch('/data/rankings-meta.json'),
        ]);

        if (rankingsRes.ok) {
          const data: SkillRanking[] = await rankingsRes.json();
          const rankingsMap = new Map<string, SkillRanking>();

          data.forEach((skill) => {
            // Normalize skill name for matching (lowercase, no special chars)
            const normalizedName = skill.skill_name.toLowerCase().trim();
            rankingsMap.set(normalizedName, skill);
          });

          setRankings(rankingsMap);
        }

        if (metaRes.ok) {
          const meta = await metaRes.json();
          setUpdatedAt(meta.updated_at);
        }
      } catch (err) {
        // Don't set error - just use default ordering if fetch fails
        console.log('Rankings data not available yet, using default order');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRankings();
  }, []);

  return { rankings, isLoading, error, updatedAt };
}

// Helper function to sort skills by ranking
export function sortSkillsByRanking(
  skills: string[],
  rankings: Map<string, SkillRanking>
): string[] {
  if (rankings.size === 0) return skills;

  return [...skills].sort((a, b) => {
    const rankA = rankings.get(a.toLowerCase().trim());
    const rankB = rankings.get(b.toLowerCase().trim());

    // If both have rankings, sort by demand_rank (lower is better)
    if (rankA && rankB) {
      return rankA.demand_rank - rankB.demand_rank;
    }
    // If only one has ranking, prioritize the one with ranking
    if (rankA) return -1;
    if (rankB) return 1;
    // If neither has ranking, keep original order
    return 0;
  });
}

// Helper to check if skill is high demand
export function isHighDemand(
  skillName: string,
  rankings: Map<string, SkillRanking>
): boolean {
  const ranking = rankings.get(skillName.toLowerCase().trim());
  return ranking?.demand_tier === 'high_demand' || ranking?.demand_tier === 'moderate_demand';
}

// Helper to get demand tier
export function getDemandTier(
  skillName: string,
  rankings: Map<string, SkillRanking>
): string | null {
  const ranking = rankings.get(skillName.toLowerCase().trim());
  return ranking?.demand_tier || null;
}
