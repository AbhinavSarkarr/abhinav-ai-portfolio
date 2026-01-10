import { useState, useEffect } from 'react';

// GitHub Gist URL for rankings data
const GIST_URL = 'https://gist.githubusercontent.com/AbhinavSarkarr/7983bb85c69ec4cc45fe37b6a8d2d391/raw/skill-rankings.json';

// Skill ranking types
export type SkillRanking = {
  skill_name: string;
  skill_category: string;
  clicks: number;
  demand_rank: number;
  demand_tier: 'high_demand' | 'moderate_demand' | 'emerging' | 'niche';
  learning_priority: string;
};

// Project ranking types
export type ProjectRanking = {
  project_id: string;
  project_title: string;
  overall_rank: number;
  total_views: number;
  total_clicks: number;
  engagement_score: number;
  recommended_position: string;
};

// Section ranking types
export type SectionRanking = {
  section_id: string;
  health_score: number;
  engagement_rank: number;
  health_tier: string;
  optimization_hint: string;
};

// Client ranking types
export type ClientRanking = {
  client_id: string;
  client_name: string;
  experience_id: string;
  domain: string;
  engagement_rank: number;
  total_views: number;
  total_clicks: number;
};

// Full response type
type RankingsResponse = {
  skills: SkillRanking[];
  projects: ProjectRanking[];
  sections: SectionRanking[];
  clients: ClientRanking[];
  updated_at: string;
};

// Module-level cache to prevent multiple fetches
let cachedData: RankingsResponse | null = null;
let fetchPromise: Promise<RankingsResponse | null> | null = null;

// Shared fetch function that caches results
async function fetchRankingsData(): Promise<RankingsResponse | null> {
  // Return cached data if available
  if (cachedData) return cachedData;

  // If fetch is in progress, wait for it
  if (fetchPromise) return fetchPromise;

  // Start new fetch
  fetchPromise = fetch(GIST_URL)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    })
    .then(data => {
      cachedData = data;
      return data;
    })
    .catch(() => {
      return null;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

// Hook return type
type AnalyticsRankingsData = {
  skillRankings: Map<string, SkillRanking>;
  projectRankings: Map<string, ProjectRanking>;
  sectionRankings: Map<string, SectionRanking>;
  clientRankings: Map<string, ClientRanking>;
  isLoading: boolean;
  error: Error | null;
  updatedAt: string | null;
};

export function useAnalyticsRankings(): AnalyticsRankingsData {
  const [skillRankings, setSkillRankings] = useState<Map<string, SkillRanking>>(new Map());
  const [projectRankings, setProjectRankings] = useState<Map<string, ProjectRanking>>(new Map());
  const [sectionRankings, setSectionRankings] = useState<Map<string, SectionRanking>>(new Map());
  const [clientRankings, setClientRankings] = useState<Map<string, ClientRanking>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function loadRankings() {
      try {
        const data = await fetchRankingsData();

        if (data) {

          // Process skill rankings
          if (data.skills && Array.isArray(data.skills)) {
            const skillsMap = new Map<string, SkillRanking>();
            data.skills.forEach((skill) => {
              const normalizedName = skill.skill_name?.toLowerCase().trim();
              if (normalizedName) {
                skillsMap.set(normalizedName, skill);
              }
            });
            setSkillRankings(skillsMap);
          }

          // Process project rankings
          if (data.projects && Array.isArray(data.projects)) {
            const projectsMap = new Map<string, ProjectRanking>();
            data.projects.forEach((project) => {
              if (project.project_id) {
                projectsMap.set(project.project_id, project);
              }
            });
            setProjectRankings(projectsMap);
          }

          // Process section rankings
          if (data.sections && Array.isArray(data.sections)) {
            const sectionsMap = new Map<string, SectionRanking>();
            data.sections.forEach((section) => {
              if (section.section_id) {
                sectionsMap.set(section.section_id, section);
              }
            });
            setSectionRankings(sectionsMap);
          }

          // Process client rankings
          if (data.clients && Array.isArray(data.clients)) {
            const clientsMap = new Map<string, ClientRanking>();
            data.clients.forEach((client) => {
              if (client.client_id) {
                clientsMap.set(client.client_id, client);
              }
            });
            setClientRankings(clientsMap);
          }

          setUpdatedAt(data.updated_at || null);
        }
      } catch (err) {
        console.log('Rankings data not available yet, using default order');
      } finally {
        setIsLoading(false);
      }
    }

    loadRankings();
  }, []);

  return { skillRankings, projectRankings, sectionRankings, clientRankings, isLoading, error, updatedAt };
}

// ==================== SKILL HELPERS ====================

export function sortSkillsByRanking(
  skills: string[],
  rankings: Map<string, SkillRanking>
): string[] {
  if (rankings.size === 0) return skills;

  return [...skills].sort((a, b) => {
    const rankA = rankings.get(a.toLowerCase().trim());
    const rankB = rankings.get(b.toLowerCase().trim());

    if (rankA && rankB) {
      return rankA.demand_rank - rankB.demand_rank;
    }
    if (rankA) return -1;
    if (rankB) return 1;
    return 0;
  });
}

export function isHighDemandSkill(
  skillName: string,
  rankings: Map<string, SkillRanking>
): boolean {
  const ranking = rankings.get(skillName.toLowerCase().trim());
  return ranking?.demand_tier === 'high_demand' || ranking?.demand_tier === 'moderate_demand';
}

export function getSkillDemandTier(
  skillName: string,
  rankings: Map<string, SkillRanking>
): string | null {
  const ranking = rankings.get(skillName.toLowerCase().trim());
  return ranking?.demand_tier || null;
}

// ==================== PROJECT HELPERS ====================

export function sortProjectsByRanking<T extends { id: string }>(
  projects: T[],
  rankings: Map<string, ProjectRanking>
): T[] {
  if (rankings.size === 0) return projects;

  return [...projects].sort((a, b) => {
    const rankA = rankings.get(a.id);
    const rankB = rankings.get(b.id);

    if (rankA && rankB) {
      return rankA.overall_rank - rankB.overall_rank;
    }
    if (rankA) return -1;
    if (rankB) return 1;
    return 0;
  });
}

export function getProjectBadge(
  projectId: string,
  rankings: Map<string, ProjectRanking>
): { label: string; type: 'popular' | 'trending' | 'featured' | null } {
  const ranking = rankings.get(projectId);

  if (!ranking) return { label: '', type: null };

  // Top 1 project
  if (ranking.overall_rank === 1) {
    return { label: 'Most Viewed', type: 'popular' };
  }

  // Top 2-3 projects
  if (ranking.overall_rank <= 3) {
    return { label: 'Popular', type: 'trending' };
  }

  // Featured position
  if (ranking.recommended_position === 'featured') {
    return { label: 'Featured', type: 'featured' };
  }

  return { label: '', type: null };
}

export function getProjectStats(
  projectId: string,
  rankings: Map<string, ProjectRanking>
): { views: number; clicks: number } | null {
  const ranking = rankings.get(projectId);
  if (!ranking) return null;

  return {
    views: ranking.total_views || 0,
    clicks: ranking.total_clicks || 0,
  };
}

// ==================== CLIENT HELPERS ====================

// For sorting clients within an experience
export function sortClientsByEngagement<T extends { id: string }>(
  clients: T[],
  clientRankings: Map<string, ClientRanking>
): T[] {
  if (clientRankings.size === 0) return clients;

  return [...clients].sort((a, b) => {
    const rankA = clientRankings.get(a.id);
    const rankB = clientRankings.get(b.id);

    if (rankA && rankB) {
      return rankA.engagement_rank - rankB.engagement_rank;
    }
    if (rankA) return -1;
    if (rankB) return 1;
    return 0;
  });
}

// Get client badge based on engagement
export function getClientBadge(
  clientId: string,
  rankings: Map<string, ClientRanking>
): { label: string; type: 'popular' | 'trending' | null } {
  const ranking = rankings.get(clientId);

  if (!ranking) return { label: '', type: null };

  // Top ranked client in their experience
  if (ranking.engagement_rank === 1) {
    return { label: 'Most Viewed', type: 'popular' };
  }

  // Top 3 within experience
  if (ranking.engagement_rank <= 3 && ranking.total_views > 0) {
    return { label: 'Popular', type: 'trending' };
  }

  return { label: '', type: null };
}
