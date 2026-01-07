/**
 * TrackedSection Component
 * Automatically tracks section visibility, time spent, and scroll depth
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
  className?: string;
}

export function TrackedSection({
  children,
  sectionId,
  sectionName,
  className = '',
}: TrackedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  const enterTime = useRef<number | null>(null);
  const totalTime = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const hasTrackedView = useRef<boolean>(false);
  const lastEngagementSent = useRef<number>(0);

  // Calculate scroll depth within section
  const calculateScrollDepth = useCallback(() => {
    if (!sectionRef.current) return 0;

    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;

    if (rect.top >= viewportHeight || rect.bottom <= 0) {
      return 0;
    }

    const visibleTop = Math.max(0, -rect.top);
    const visibleBottom = Math.min(sectionHeight, viewportHeight - rect.top);
    const visibleHeight = visibleBottom - visibleTop;

    // Calculate how much of the section has been scrolled through
    const scrolledThrough = Math.max(0, -rect.top + viewportHeight);
    const scrollDepth = Math.min(100, (scrolledThrough / sectionHeight) * 100);

    return Math.round(scrollDepth);
  }, []);

  // Track section enter
  useEffect(() => {
    if (isInView) {
      enterTime.current = Date.now();

      if (!hasTrackedView.current) {
        trackSectionView(sectionId, sectionName);
        hasTrackedView.current = true;
      }
    } else if (enterTime.current !== null) {
      // Section left
      const timeInSection = (Date.now() - enterTime.current) / 1000;
      totalTime.current += timeInSection;
      const scrollDepth = calculateScrollDepth();
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollDepth);

      trackSectionExit(sectionId, sectionName, totalTime.current, maxScrollDepth.current);

      enterTime.current = null;
    }
  }, [isInView, sectionId, sectionName, calculateScrollDepth]);

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
          totalTime.current + timeSinceEnter,
          maxScrollDepth.current
        );
        lastEngagementSent.current = currentTime;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView, sectionId, sectionName, calculateScrollDepth]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enterTime.current !== null) {
        const timeInSection = (Date.now() - enterTime.current) / 1000;
        trackSectionExit(
          sectionId,
          sectionName,
          totalTime.current + timeInSection,
          maxScrollDepth.current
        );
      }
    };
  }, [sectionId, sectionName]);

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
