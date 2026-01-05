import { useState, useCallback, useRef, useEffect } from 'react';

export const useBehaviorTracker = () => {
  const [currentHoveredProject, setCurrentHoveredProject] = useState<string | null>(null);
  const [currentViewingProject, setCurrentViewingProject] = useState<string | null>(null);
  const [isFromRecommendation, setIsFromRecommendation] = useState(false);
  const [triggerRecommendation, setTriggerRecommendation] = useState<{
    trigger: boolean;
    sourceProjectId: string | null;
    type: 'hover' | 'case-study' | 'long-press' | null;
  }>({ trigger: false, sourceProjectId: null, type: null });

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
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

  // Track long-press start (mobile) - triggers after 4 seconds
  const trackLongPressStart = useCallback((projectId: string) => {
    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Set 4 second timer for long-press
    longPressTimer.current = setTimeout(() => {
      setTriggerRecommendation({
        trigger: true,
        sourceProjectId: projectId,
        type: 'long-press',
      });
    }, 4000);
  }, []);

  // Track long-press end (mobile)
  const trackLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Track case study page view
  // First visit: 8 seconds, Subsequent (from recommendation): 16 seconds
  const trackCaseStudyView = useCallback((projectId: string, fromRecommendation: boolean = false) => {
    setCurrentViewingProject(projectId);

    // Update if this visit is from a recommendation click
    if (fromRecommendation) {
      setIsFromRecommendation(true);
    }

    // Clear ALL timers to prevent hover/long-press from triggering
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (caseStudyTimer.current) {
      clearTimeout(caseStudyTimer.current);
    }

    // Determine wait time: 8s for first visit, 16s if from recommendation
    const waitTime = isFromRecommendation || fromRecommendation ? 16000 : 8000;

    // Set timer
    caseStudyTimer.current = setTimeout(() => {
      setTriggerRecommendation({
        trigger: true,
        sourceProjectId: projectId,
        type: 'case-study',
      });
    }, waitTime);
  }, [isFromRecommendation]);

  // Track case study page leave
  const trackCaseStudyLeave = useCallback(() => {
    setCurrentViewingProject(null);

    if (caseStudyTimer.current) {
      clearTimeout(caseStudyTimer.current);
      caseStudyTimer.current = null;
    }
  }, []);

  // Mark that user clicked on a recommendation
  const markFromRecommendation = useCallback(() => {
    setIsFromRecommendation(true);
  }, []);

  // Reset trigger (called after recommendation is shown)
  const resetTrigger = useCallback(() => {
    setTriggerRecommendation({ trigger: false, sourceProjectId: null, type: null });
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (caseStudyTimer.current) clearTimeout(caseStudyTimer.current);
    };
  }, []);

  return {
    currentHoveredProject,
    currentViewingProject,
    triggerRecommendation,
    isFromRecommendation,
    trackHoverStart,
    trackHoverEnd,
    trackLongPressStart,
    trackLongPressEnd,
    trackCaseStudyView,
    trackCaseStudyLeave,
    markFromRecommendation,
    resetTrigger,
  };
};
