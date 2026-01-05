import { useState, useCallback, useRef, useEffect } from 'react';

export const useBehaviorTracker = () => {
  const [currentHoveredProject, setCurrentHoveredProject] = useState<string | null>(null);
  const [currentViewingProject, setCurrentViewingProject] = useState<string | null>(null);
  const [triggerRecommendation, setTriggerRecommendation] = useState<{
    trigger: boolean;
    sourceProjectId: string | null;
    type: 'hover' | 'case-study' | null;
  }>({ trigger: false, sourceProjectId: null, type: null });

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const caseStudyTimer = useRef<NodeJS.Timeout | null>(null);

  // Track project hover start - triggers after 4 seconds
  const trackHoverStart = useCallback((projectId: string) => {
    setCurrentHoveredProject(projectId);

    // Clear any existing timer
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }

    // Set 4 second timer
    hoverTimer.current = setTimeout(() => {
      setTriggerRecommendation({
        trigger: true,
        sourceProjectId: projectId,
        type: 'hover',
      });
    }, 4000);
  }, []);

  // Track project hover end
  const trackHoverEnd = useCallback(() => {
    setCurrentHoveredProject(null);

    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  // Track case study page view - triggers after 6 seconds
  const trackCaseStudyView = useCallback((projectId: string) => {
    setCurrentViewingProject(projectId);

    // Clear any existing timer
    if (caseStudyTimer.current) {
      clearTimeout(caseStudyTimer.current);
    }

    // Set 6 second timer
    caseStudyTimer.current = setTimeout(() => {
      setTriggerRecommendation({
        trigger: true,
        sourceProjectId: projectId,
        type: 'case-study',
      });
    }, 6000);
  }, []);

  // Track case study page leave
  const trackCaseStudyLeave = useCallback(() => {
    setCurrentViewingProject(null);

    if (caseStudyTimer.current) {
      clearTimeout(caseStudyTimer.current);
      caseStudyTimer.current = null;
    }
  }, []);

  // Reset trigger (called after recommendation is shown)
  const resetTrigger = useCallback(() => {
    setTriggerRecommendation({ trigger: false, sourceProjectId: null, type: null });
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (caseStudyTimer.current) clearTimeout(caseStudyTimer.current);
    };
  }, []);

  return {
    currentHoveredProject,
    currentViewingProject,
    triggerRecommendation,
    trackHoverStart,
    trackHoverEnd,
    trackCaseStudyView,
    trackCaseStudyLeave,
    resetTrigger,
  };
};
