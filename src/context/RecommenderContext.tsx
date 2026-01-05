import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { portfolioData, ProjectItem } from '@/data/portfolioData';

type RecommendationState = {
  show: boolean;
  project: ProjectItem | null;
  sourceProject: ProjectItem | null;
  type: 'hover' | 'case-study' | null;
};

type RecommenderContextType = {
  trackHoverStart: (projectId: string) => void;
  trackHoverEnd: () => void;
  trackCaseStudyView: (projectId: string) => void;
  trackCaseStudyLeave: () => void;
  recommendation: RecommendationState;
  dismissRecommendation: () => void;
};

const RecommenderContext = createContext<RecommenderContextType | null>(null);

export const useRecommender = () => {
  const context = useContext(RecommenderContext);
  if (!context) {
    throw new Error('useRecommender must be used within a RecommenderProvider');
  }
  return context;
};

export const RecommenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    triggerRecommendation,
    trackHoverStart,
    trackHoverEnd,
    trackCaseStudyView,
    trackCaseStudyLeave,
    resetTrigger,
  } = useBehaviorTracker();

  const [recommendation, setRecommendation] = useState<RecommendationState>({
    show: false,
    project: null,
    sourceProject: null,
    type: null,
  });

  const [shownProjectIds, setShownProjectIds] = useState<Set<string>>(new Set());

  // Find a project to recommend (guaranteed to return one if there are other projects)
  const findRecommendation = useCallback((excludeProjectId: string): ProjectItem | null => {
    const { projects } = portfolioData;

    // Get the source project to find similar ones
    const sourceProject = projects.find(p => p.id === excludeProjectId);
    if (!sourceProject) return null;

    // First, try to find a project in the same category that hasn't been shown
    const sameCategoryProjects = projects.filter(
      p => p.id !== excludeProjectId &&
           p.category === sourceProject.category &&
           !shownProjectIds.has(p.id)
    );

    if (sameCategoryProjects.length > 0) {
      return sameCategoryProjects[Math.floor(Math.random() * sameCategoryProjects.length)];
    }

    // Second, try any project that hasn't been shown yet
    const unseenProjects = projects.filter(
      p => p.id !== excludeProjectId && !shownProjectIds.has(p.id)
    );

    if (unseenProjects.length > 0) {
      return unseenProjects[Math.floor(Math.random() * unseenProjects.length)];
    }

    // Finally, just pick any other project (reset the cycle)
    const otherProjects = projects.filter(p => p.id !== excludeProjectId);

    if (otherProjects.length > 0) {
      // Reset shown projects since we've cycled through all
      setShownProjectIds(new Set());
      return otherProjects[Math.floor(Math.random() * otherProjects.length)];
    }

    return null;
  }, [shownProjectIds]);

  // Watch for trigger and show recommendation
  useEffect(() => {
    if (triggerRecommendation.trigger && triggerRecommendation.sourceProjectId) {
      const sourceProject = portfolioData.projects.find(
        p => p.id === triggerRecommendation.sourceProjectId
      );
      const recommendedProject = findRecommendation(triggerRecommendation.sourceProjectId);

      if (recommendedProject && sourceProject) {
        setRecommendation({
          show: true,
          project: recommendedProject,
          sourceProject: sourceProject,
          type: triggerRecommendation.type,
        });

        // Track that we've shown this project
        setShownProjectIds(prev => new Set([...prev, recommendedProject.id]));
      }

      // Reset the trigger
      resetTrigger();
    }
  }, [triggerRecommendation, findRecommendation, resetTrigger]);

  const dismissRecommendation = useCallback(() => {
    setRecommendation(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <RecommenderContext.Provider
      value={{
        trackHoverStart,
        trackHoverEnd,
        trackCaseStudyView,
        trackCaseStudyLeave,
        recommendation,
        dismissRecommendation,
      }}
    >
      {children}
    </RecommenderContext.Provider>
  );
};
