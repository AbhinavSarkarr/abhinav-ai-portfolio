/**
 * TrackedSection Component
 * Automatically tracks section visibility, time spent, and scroll depth
 *
 * Tracks EVERY view and exit for granular engagement data.
 * SQL views will calculate both:
 * - Unique views/exits per session (for funnel analysis)
 * - Total views/exits (for engagement/stickiness analysis)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';
import {
  trackSectionView,
  trackSectionEngagement,
  trackSectionExit,
} from '@/hooks/useAnalytics';

interface TrackedSectionProps {
  children: React.ReactNode;
  sectionId: string;
  sectionName: string;
  sectionPosition: number;  // 1 = first section, 2 = second, etc.
  className?: string;
}

export function TrackedSection({
  children,
  sectionId,
  sectionName,
  sectionPosition,
  className = '',
}: TrackedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  const enterTime = useRef<number | null>(null);
  const currentViewTime = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const lastEngagementSent = useRef<number>(0);
  const viewCount = useRef<number>(0);

  // Calculate scroll depth within section
  const calculateScrollDepth = useCallback(() => {
    if (!sectionRef.current) return 0;

    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;

    if (rect.top >= viewportHeight || rect.bottom <= 0) {
      return 0;
    }

    // Calculate how much of the section has been scrolled through
    const scrolledThrough = Math.max(0, -rect.top + viewportHeight);
    const scrollDepth = Math.min(100, (scrolledThrough / sectionHeight) * 100);

    return Math.round(scrollDepth);
  }, []);

  // Track section enter and exit - EVERY time
  useEffect(() => {
    if (isInView) {
      // Section entered
      enterTime.current = Date.now();
      currentViewTime.current = 0;
      maxScrollDepth.current = 0;
      viewCount.current += 1;

      // Track view every time section comes into view
      trackSectionView(sectionId, sectionName, sectionPosition);

    } else if (enterTime.current !== null) {
      // Section left - track exit with time spent in this view
      const timeInSection = (Date.now() - enterTime.current) / 1000;
      currentViewTime.current = timeInSection;
      const scrollDepth = calculateScrollDepth();
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollDepth);

      // Track exit every time section goes out of view
      trackSectionExit(sectionId, sectionName, timeInSection, maxScrollDepth.current, sectionPosition);

      enterTime.current = null;
    }
  }, [isInView, sectionId, sectionName, sectionPosition, calculateScrollDepth]);

  // Track engagement periodically while in view
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      if (enterTime.current === null) return;

      const currentTime = Date.now();
      const timeSinceEnter = (currentTime - enterTime.current) / 1000;
      const scrollDepth = calculateScrollDepth();
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollDepth);

      // Send engagement update every 10 seconds
      if (currentTime - lastEngagementSent.current >= 10000) {
        trackSectionEngagement(
          sectionId,
          sectionName,
          timeSinceEnter,
          maxScrollDepth.current,
          sectionPosition
        );
        lastEngagementSent.current = currentTime;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView, sectionId, sectionName, sectionPosition, calculateScrollDepth]);

  // Track scroll depth changes
  useEffect(() => {
    if (!isInView) return;

    const handleScroll = () => {
      const scrollDepth = calculateScrollDepth();
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollDepth);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInView, calculateScrollDepth]);

  // Track final exit on page hide (user navigates away or closes tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && enterTime.current !== null) {
        const finalTime = (Date.now() - enterTime.current) / 1000;
        trackSectionExit(sectionId, sectionName, finalTime, maxScrollDepth.current, sectionPosition);
        enterTime.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sectionId, sectionName, sectionPosition]);

  // Cleanup on unmount - track exit if currently in view
  useEffect(() => {
    return () => {
      if (enterTime.current !== null) {
        const finalTime = (Date.now() - enterTime.current) / 1000;
        trackSectionExit(sectionId, sectionName, finalTime, maxScrollDepth.current, sectionPosition);
      }
    };
  }, [sectionId, sectionName, sectionPosition]);

  return (
    <div
      ref={sectionRef}
      className={className}
      data-tracked-section={sectionId}
    >
      {children}
    </div>
  );
}

export default TrackedSection;
