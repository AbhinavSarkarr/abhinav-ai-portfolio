/**
 * Analytics Context Provider
 * Provides analytics functions throughout the app
 */

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initGA4,
  trackPageView,
  trackSessionStart,
  trackSessionEnd,
  identifyVisitorType,
  trackEvent,
  trackProjectView,
  trackProjectClick,
  trackCaseStudyOpen,
  trackCaseStudyEngagement,
  trackProjectLinkClick,
  trackRecommendationShown,
  trackRecommendationClick,
  trackClick,
  trackCTAClick,
  trackContactFormStart,
  trackContactFormSubmit,
  trackResumeDownload,
  trackSocialClick,
  trackCertificationClick,
  trackPublicationClick,
  trackOutboundLink,
  trackContentCopy,
  // Client work tracking
  trackClientView,
  trackClientClick,
  trackClientCaseStudyOpen,
  trackClientCaseStudyEngagement,
  trackDomainInterest,
  trackClientTechStackClick,
  trackExperienceLevelInterest,
  trackContributionView,
  trackProblemStatementRead,
  trackSolutionRead,
} from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  // Project tracking
  trackProjectView: typeof trackProjectView;
  trackProjectClick: typeof trackProjectClick;
  trackCaseStudyOpen: typeof trackCaseStudyOpen;
  trackCaseStudyEngagement: typeof trackCaseStudyEngagement;
  trackProjectLinkClick: typeof trackProjectLinkClick;

  // Client work tracking
  trackClientView: typeof trackClientView;
  trackClientClick: typeof trackClientClick;
  trackClientCaseStudyOpen: typeof trackClientCaseStudyOpen;
  trackClientCaseStudyEngagement: typeof trackClientCaseStudyEngagement;
  trackDomainInterest: typeof trackDomainInterest;
  trackClientTechStackClick: typeof trackClientTechStackClick;
  trackExperienceLevelInterest: typeof trackExperienceLevelInterest;
  trackContributionView: typeof trackContributionView;
  trackProblemStatementRead: typeof trackProblemStatementRead;
  trackSolutionRead: typeof trackSolutionRead;

  // Recommendation tracking
  trackRecommendationShown: typeof trackRecommendationShown;
  trackRecommendationClick: typeof trackRecommendationClick;

  // Interaction tracking
  trackClick: typeof trackClick;
  trackCTAClick: typeof trackCTAClick;

  // Conversion tracking
  trackContactFormStart: typeof trackContactFormStart;
  trackContactFormSubmit: typeof trackContactFormSubmit;
  trackResumeDownload: typeof trackResumeDownload;
  trackSocialClick: typeof trackSocialClick;
  trackCertificationClick: typeof trackCertificationClick;
  trackPublicationClick: typeof trackPublicationClick;

  // Generic event
  trackEvent: typeof trackEvent;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();
  const sessionStartTime = useRef<number>(Date.now());
  const pagesViewed = useRef<number>(0);
  const initialized = useRef<boolean>(false);

  // Initialize GA4 on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initGA4();
    trackSessionStart();

    // Check if returning visitor
    const hasVisited = localStorage.getItem('portfolio_visited');
    const visitCount = parseInt(localStorage.getItem('portfolio_visit_count') || '0', 10);

    identifyVisitorType(!!hasVisited);

    localStorage.setItem('portfolio_visited', 'true');
    localStorage.setItem('portfolio_visit_count', String(visitCount + 1));
    localStorage.setItem('portfolio_last_visit', new Date().toISOString());

    // Track session end on unload
    const handleUnload = () => {
      const sessionDuration = (Date.now() - sessionStartTime.current) / 1000;
      trackSessionEnd(sessionDuration, pagesViewed.current);
    };

    // Track content copy events
    const handleCopy = () => {
      const selectedText = window.getSelection()?.toString() || '';
      if (selectedText.length > 0) {
        // Determine content type based on selection context
        const activeElement = document.activeElement;
        let contentType = 'text';
        if (activeElement?.closest('pre, code')) {
          contentType = 'code';
        } else if (activeElement?.closest('a[href^="mailto:"]') || selectedText.includes('@')) {
          contentType = 'email';
        } else if (activeElement?.closest('.contact, #contact')) {
          contentType = 'contact_info';
        }
        trackContentCopy(contentType, selectedText.substring(0, 100));
      }
    };

    // Track outbound link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement | null;

      if (link) {
        const href = link.href;
        const isExternal = href && (
          href.startsWith('http') &&
          !href.includes(window.location.hostname)
        );

        if (isExternal) {
          const linkText = link.textContent?.trim() || link.getAttribute('aria-label') || 'Unknown';
          const context = link.closest('section')?.id ||
                         link.closest('[data-section]')?.getAttribute('data-section') ||
                         'unknown';
          trackOutboundLink(href, linkText, context);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    pagesViewed.current += 1;
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  const value: AnalyticsContextType = {
    // Project tracking
    trackProjectView,
    trackProjectClick,
    trackCaseStudyOpen,
    trackCaseStudyEngagement,
    trackProjectLinkClick,

    // Client work tracking
    trackClientView,
    trackClientClick,
    trackClientCaseStudyOpen,
    trackClientCaseStudyEngagement,
    trackDomainInterest,
    trackClientTechStackClick,
    trackExperienceLevelInterest,
    trackContributionView,
    trackProblemStatementRead,
    trackSolutionRead,

    // Recommendation tracking
    trackRecommendationShown,
    trackRecommendationClick,

    // Interaction tracking
    trackClick,
    trackCTAClick,

    // Conversion tracking
    trackContactFormStart,
    trackContactFormSubmit,
    trackResumeDownload,
    trackSocialClick,
    trackCertificationClick,
    trackPublicationClick,

    // Generic event
    trackEvent,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

export default AnalyticsProvider;
