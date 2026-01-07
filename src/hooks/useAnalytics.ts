/**
 * GA4 Analytics Hook
 * Comprehensive tracking for portfolio analytics
 */

import { useCallback, useEffect, useRef } from 'react';

// GA4 Measurement ID - Replace with your actual ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Type definitions
interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

interface SectionEngagement {
  sectionId: string;
  sectionName: string;
  enterTime: number;
  totalTime: number;
  maxScrollDepth: number;
  isVisible: boolean;
}

// Declare gtag globally
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

// Initialize GA4
export function initGA4() {
  if (typeof window === 'undefined') return;

  // Don't initialize if already done
  if (window.gtag) return;

  // Add gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('GA4 initialized:', GA_MEASUREMENT_ID);
}

// Track custom event
export function trackEvent(eventName: string, params?: GtagEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    ...params,
    timestamp: new Date().toISOString(),
  });

  if (import.meta.env.DEV) {
    console.log('📊 GA4 Event:', eventName, params);
  }
}

// Track page view
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });

  trackEvent('page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

// ============================================
// SECTION TRACKING
// ============================================

export function trackSectionView(sectionId: string, sectionName: string) {
  trackEvent('section_view', {
    event_category: 'Section',
    event_label: sectionName,
    section_id: sectionId,
    section_name: sectionName,
  });
}

export function trackSectionEngagement(
  sectionId: string,
  sectionName: string,
  timeSpent: number,
  scrollDepth: number
) {
  trackEvent('section_engagement', {
    event_category: 'Section',
    event_label: sectionName,
    section_id: sectionId,
    section_name: sectionName,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
    value: Math.round(timeSpent),
  });
}

export function trackSectionExit(
  sectionId: string,
  sectionName: string,
  timeSpent: number,
  scrollDepth: number
) {
  trackEvent('section_exit', {
    event_category: 'Section',
    event_label: sectionName,
    section_id: sectionId,
    section_name: sectionName,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
  });
}

// ============================================
// PROJECT TRACKING
// ============================================

export function trackProjectView(
  projectId: string,
  projectTitle: string,
  projectCategory: string
) {
  trackEvent('project_view', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
  });
}

export function trackProjectClick(
  projectId: string,
  projectTitle: string,
  projectCategory: string
) {
  trackEvent('project_click', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
  });
}

export function trackCaseStudyOpen(
  projectId: string,
  projectTitle: string,
  projectCategory: string
) {
  trackEvent('case_study_open', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
  });
}

export function trackCaseStudyEngagement(
  projectId: string,
  projectTitle: string,
  timeSpent: number,
  scrollDepth: number
) {
  trackEvent('case_study_engagement', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
    value: Math.round(timeSpent),
  });
}

export function trackProjectLinkClick(
  projectId: string,
  projectTitle: string,
  linkType: 'github' | 'demo' | 'whatsapp'
) {
  trackEvent('project_link_click', {
    event_category: 'Project',
    event_label: `${projectTitle} - ${linkType}`,
    project_id: projectId,
    project_title: projectTitle,
    link_type: linkType,
  });
}

// ============================================
// RECOMMENDATION TRACKING
// ============================================

export function trackRecommendationShown(
  recommendedProjectId: string,
  recommendedProjectTitle: string,
  sourceProjectId: string,
  position: number
) {
  trackEvent('recommendation_shown', {
    event_category: 'Recommendation',
    event_label: recommendedProjectTitle,
    recommended_project_id: recommendedProjectId,
    recommended_project_title: recommendedProjectTitle,
    source_project_id: sourceProjectId,
    position: position,
  });
}

export function trackRecommendationClick(
  recommendedProjectId: string,
  recommendedProjectTitle: string,
  sourceProjectId: string,
  position: number
) {
  trackEvent('recommendation_click', {
    event_category: 'Recommendation',
    event_label: recommendedProjectTitle,
    recommended_project_id: recommendedProjectId,
    recommended_project_title: recommendedProjectTitle,
    source_project_id: sourceProjectId,
    position: position,
  });
}

// ============================================
// INTERACTION TRACKING
// ============================================

export function trackClick(
  elementType: string,
  elementId: string,
  elementText: string,
  sectionId?: string
) {
  trackEvent('element_click', {
    event_category: 'Click',
    event_label: elementText,
    element_type: elementType,
    element_id: elementId,
    element_text: elementText.substring(0, 100),
    section_id: sectionId,
  });
}

export function trackCTAClick(ctaName: string, ctaLocation: string) {
  trackEvent('cta_click', {
    event_category: 'CTA',
    event_label: ctaName,
    cta_name: ctaName,
    cta_location: ctaLocation,
  });
}

export function trackNavigation(from: string, to: string) {
  trackEvent('navigation', {
    event_category: 'Navigation',
    event_label: `${from} -> ${to}`,
    from_section: from,
    to_section: to,
  });
}

export function trackScrollDepth(depth: number, sectionId?: string) {
  // Only track at 25%, 50%, 75%, 100%
  const milestone = Math.floor(depth / 25) * 25;

  trackEvent('scroll_depth', {
    event_category: 'Engagement',
    event_label: `${milestone}%`,
    scroll_depth_percent: milestone,
    section_id: sectionId,
  });
}

// ============================================
// CONVERSION TRACKING
// ============================================

export function trackContactFormStart() {
  trackEvent('contact_form_start', {
    event_category: 'Conversion',
    event_label: 'Form Started',
  });
}

export function trackContactFormSubmit(formData: { hasName: boolean; hasEmail: boolean; hasMessage: boolean }) {
  trackEvent('contact_form_submit', {
    event_category: 'Conversion',
    event_label: 'Form Submitted',
    has_name: formData.hasName,
    has_email: formData.hasEmail,
    has_message: formData.hasMessage,
  });

  // Also track as a conversion
  trackEvent('conversion', {
    event_category: 'Conversion',
    event_label: 'Contact Form',
    conversion_type: 'contact',
  });
}

export function trackResumeDownload() {
  trackEvent('resume_download', {
    event_category: 'Conversion',
    event_label: 'Resume Downloaded',
  });

  trackEvent('conversion', {
    event_category: 'Conversion',
    event_label: 'Resume Download',
    conversion_type: 'resume',
  });
}

export function trackSocialClick(platform: string, url: string) {
  trackEvent('social_click', {
    event_category: 'Social',
    event_label: platform,
    platform: platform,
    url: url,
  });
}

export function trackCertificationClick(certTitle: string, certIssuer: string) {
  trackEvent('certification_click', {
    event_category: 'Certification',
    event_label: certTitle,
    cert_title: certTitle,
    cert_issuer: certIssuer,
  });
}

export function trackPublicationClick(pubTitle: string) {
  trackEvent('publication_click', {
    event_category: 'Publication',
    event_label: pubTitle,
    pub_title: pubTitle,
  });
}

// ============================================
// SKILL & INTEREST TRACKING
// ============================================

export function trackSkillClick(skillName: string, category: string) {
  trackEvent('skill_click', {
    event_category: 'Skills',
    event_label: skillName,
    skill_name: skillName,
    skill_category: category,
  });
}

export function trackSkillCategoryView(category: string) {
  trackEvent('skill_category_view', {
    event_category: 'Skills',
    event_label: category,
    skill_category: category,
  });
}

export function trackTechnologyInterest(technology: string, projectId: string) {
  trackEvent('technology_interest', {
    event_category: 'Interest',
    event_label: technology,
    technology: technology,
    source_project: projectId,
  });
}

export function trackProjectCategoryInterest(category: string) {
  trackEvent('project_category_interest', {
    event_category: 'Interest',
    event_label: category,
    project_category: category,
  });
}

// ============================================
// OUTBOUND & EXIT TRACKING
// ============================================

export function trackOutboundLink(url: string, linkText: string, context: string) {
  trackEvent('outbound_link', {
    event_category: 'Outbound',
    event_label: linkText,
    outbound_url: url,
    link_text: linkText,
    context: context,
  });
}

export function trackExitIntent(lastSection: string, timeOnPage: number, scrollDepth: number) {
  trackEvent('exit_intent', {
    event_category: 'Engagement',
    event_label: lastSection,
    last_section: lastSection,
    time_on_page_seconds: Math.round(timeOnPage),
    scroll_depth_percent: Math.round(scrollDepth),
  });
}

// ============================================
// CTA & ENGAGEMENT TRACKING
// ============================================

export function trackCTAView(ctaName: string, ctaLocation: string) {
  trackEvent('cta_view', {
    event_category: 'CTA',
    event_label: ctaName,
    cta_name: ctaName,
    cta_location: ctaLocation,
  });
}

export function trackScrollMilestone(milestone: number, sectionId?: string) {
  trackEvent('scroll_milestone', {
    event_category: 'Engagement',
    event_label: `${milestone}%`,
    scroll_milestone: milestone,
    section_id: sectionId,
  });
}

// ============================================
// CONTENT QUALITY SIGNALS
// ============================================

export function trackContentCopy(contentType: string, contentSnippet: string) {
  trackEvent('content_copy', {
    event_category: 'Engagement',
    event_label: contentType,
    content_type: contentType,
    content_snippet: contentSnippet.substring(0, 50),
  });
}

export function trackTimeThreshold(section: string, threshold: number) {
  trackEvent('time_threshold', {
    event_category: 'Engagement',
    event_label: `${section} - ${threshold}s`,
    section: section,
    threshold_seconds: threshold,
  });
}

// ============================================
// SESSION TRACKING
// ============================================

export function trackSessionStart() {
  const sessionData = {
    referrer: document.referrer || 'direct',
    landing_page: window.location.pathname,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    device_type: getDeviceType(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),
  };

  trackEvent('session_start', {
    event_category: 'Session',
    event_label: 'Session Started',
    ...sessionData,
  });

  return sessionData;
}

export function trackSessionEnd(sessionDuration: number, pagesViewed: number) {
  trackEvent('session_end', {
    event_category: 'Session',
    event_label: 'Session Ended',
    session_duration_seconds: Math.round(sessionDuration),
    pages_viewed: pagesViewed,
    value: Math.round(sessionDuration),
  });
}

// ============================================
// USER PROPERTIES
// ============================================

export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
}

export function identifyVisitorType(isReturning: boolean) {
  setUserProperties({
    visitor_type: isReturning ? 'returning' : 'new',
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function getUTMParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// ============================================
// REACT HOOK
// ============================================

export function useAnalytics() {
  const sessionStartTime = useRef<number>(Date.now());
  const pagesViewed = useRef<number>(0);
  const sectionEngagements = useRef<Map<string, SectionEngagement>>(new Map());
  const scrollMilestones = useRef<Set<number>>(new Set());

  // Initialize GA4 on mount
  useEffect(() => {
    initGA4();
    trackSessionStart();

    // Check if returning visitor
    const hasVisited = localStorage.getItem('portfolio_visited');
    identifyVisitorType(!!hasVisited);
    localStorage.setItem('portfolio_visited', 'true');

    // Track session end on page unload
    const handleUnload = () => {
      const sessionDuration = (Date.now() - sessionStartTime.current) / 1000;
      trackSessionEnd(sessionDuration, pagesViewed.current);

      // Send remaining section engagements
      sectionEngagements.current.forEach((engagement, sectionId) => {
        if (engagement.totalTime > 0) {
          trackSectionExit(
            sectionId,
            engagement.sectionName,
            engagement.totalTime,
            engagement.maxScrollDepth
          );
        }
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Page view tracking
  const trackPage = useCallback((path: string, title?: string) => {
    pagesViewed.current += 1;
    trackPageView(path, title);
  }, []);

  // Section visibility tracking
  const trackSectionEnter = useCallback((sectionId: string, sectionName: string) => {
    const existing = sectionEngagements.current.get(sectionId);

    if (existing) {
      existing.enterTime = Date.now();
      existing.isVisible = true;
    } else {
      sectionEngagements.current.set(sectionId, {
        sectionId,
        sectionName,
        enterTime: Date.now(),
        totalTime: 0,
        maxScrollDepth: 0,
        isVisible: true,
      });
      trackSectionView(sectionId, sectionName);
    }
  }, []);

  const trackSectionLeave = useCallback((sectionId: string, scrollDepth: number = 0) => {
    const engagement = sectionEngagements.current.get(sectionId);

    if (engagement && engagement.isVisible) {
      const timeInSection = (Date.now() - engagement.enterTime) / 1000;
      engagement.totalTime += timeInSection;
      engagement.maxScrollDepth = Math.max(engagement.maxScrollDepth, scrollDepth);
      engagement.isVisible = false;

      trackSectionEngagement(
        sectionId,
        engagement.sectionName,
        engagement.totalTime,
        engagement.maxScrollDepth
      );
    }
  }, []);

  // Scroll tracking with milestones
  const trackScroll = useCallback((depth: number, sectionId?: string) => {
    const milestone = Math.floor(depth / 25) * 25;

    if (milestone > 0 && !scrollMilestones.current.has(milestone)) {
      scrollMilestones.current.add(milestone);
      trackScrollDepth(milestone, sectionId);
    }
  }, []);

  return {
    // Page tracking
    trackPage,

    // Section tracking
    trackSectionEnter,
    trackSectionLeave,
    trackScroll,

    // Project tracking
    trackProjectView,
    trackProjectClick,
    trackCaseStudyOpen,
    trackCaseStudyEngagement,
    trackProjectLinkClick,

    // Recommendation tracking
    trackRecommendationShown,
    trackRecommendationClick,

    // Interaction tracking
    trackClick,
    trackCTAClick,
    trackNavigation,

    // Conversion tracking
    trackContactFormStart,
    trackContactFormSubmit,
    trackResumeDownload,
    trackSocialClick,
    trackCertificationClick,
    trackPublicationClick,
  };
}

export default useAnalytics;
