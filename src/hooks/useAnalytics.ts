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

// Module-level state for page tracking
let sessionStartTime: number = Date.now();
let previousPage: string | null = null;
let previousPageEnterTime: number = Date.now();
let pageCount: number = 0;

// Module-level state for engagement tracking
let projectsViewed: string[] = [];
let projectsClicked: string[] = [];
let sectionsViewed: string[] = [];
let maxScrollDepth: number = 0;
let conversionsCount: number = 0;
let recommendationsShown: Map<string, { time: number; position: number }> = new Map();
let projectHoverTimes: Map<string, number> = new Map();
let skillToProjectJourney: { skill: string; timestamp: number } | null = null;

// Reset engagement tracking (call on session start)
function resetEngagementTracking() {
  projectsViewed = [];
  projectsClicked = [];
  sectionsViewed = [];
  maxScrollDepth = 0;
  conversionsCount = 0;
  recommendationsShown.clear();
  projectHoverTimes.clear();
  skillToProjectJourney = null;
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

  const now = Date.now();
  pageCount += 1;

  // Calculate time on previous page
  const timeOnPreviousPage = previousPage
    ? Math.round((now - previousPageEnterTime) / 1000)
    : null;

  // Calculate time since session start
  const timeSinceSessionStart = Math.round((now - sessionStartTime) / 1000);

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });

  trackEvent('page_view', {
    // Original fields
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,

    // New fields
    previous_page: previousPage,
    page_type: getPageType(path),
    page_number: pageCount,
    time_on_previous_page: timeOnPreviousPage,
    time_since_session_start: timeSinceSessionStart,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  });

  // Update state for next page view
  previousPage = path;
  previousPageEnterTime = now;

  // Reset section tracking for new page
  resetSectionTracking();
}

// Reset page tracking state (call on session start)
export function resetPageTracking() {
  sessionStartTime = Date.now();
  previousPage = null;
  previousPageEnterTime = Date.now();
  pageCount = 0;
}

// Determine page type from path
function getPageType(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/project/')) return 'project';
  if (path.startsWith('/client/')) return 'client';
  if (path === '/dashboard') return 'dashboard';
  if (path.startsWith('/li') || path.startsWith('/tw') || path.startsWith('/gh') ||
      path.startsWith('/em') || path.startsWith('/wa') || path.startsWith('/cv') ||
      path.startsWith('/dc') || path.startsWith('/rd') || path.startsWith('/md') ||
      path === '/qr' || path === '/cl') return 'redirect';
  return 'other';
}

// ============================================
// SECTION TRACKING
// ============================================

// Module-level state for section tracking
let lastScrollY: number = 0;
let currentSection: string | null = null;
const sectionViewCounts: Map<string, number> = new Map();

// Get scroll direction
function getScrollDirection(): 'up' | 'down' {
  const currentScrollY = window.scrollY;
  const direction = currentScrollY > lastScrollY ? 'down' : 'up';
  lastScrollY = currentScrollY;
  return direction;
}

// Update current section and return previous
function updateCurrentSection(newSection: string): string | null {
  const previous = currentSection;
  currentSection = newSection;
  return previous;
}

// Increment and get view count for section
function incrementSectionViewCount(sectionId: string): number {
  const count = (sectionViewCounts.get(sectionId) || 0) + 1;
  sectionViewCounts.set(sectionId, count);
  return count;
}

export function trackSectionView(
  sectionId: string,
  sectionName: string,
  sectionPosition: number
) {
  const entryDirection = getScrollDirection();
  const previousSection = updateCurrentSection(sectionId);
  const viewCount = incrementSectionViewCount(sectionId);

  // Track unique sections viewed
  if (!sectionsViewed.includes(sectionId)) {
    sectionsViewed.push(sectionId);
  }

  trackEvent('section_view', {
    event_category: 'Section',
    event_label: sectionName,
    section_id: sectionId,
    section_name: sectionName,
    entry_direction: entryDirection,
    previous_section: previousSection,
    view_count: viewCount,
    section_position: sectionPosition,
    total_sections_viewed: sectionsViewed.length,
  });
}

export function trackSectionEngagement(
  sectionId: string,
  sectionName: string,
  timeSpent: number,
  scrollDepth: number,
  sectionPosition: number
) {
  trackEvent('section_engagement', {
    event_category: 'Section',
    event_label: sectionName,
    section_id: sectionId,
    section_name: sectionName,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
    section_position: sectionPosition,
    view_count: sectionViewCounts.get(sectionId) || 1,
    value: Math.round(timeSpent),
  });
}

export function trackSectionExit(
  sectionId: string,
  sectionName: string,
  timeSpent: number,
  scrollDepth: number,
  sectionPosition: number
) {
  const exitDirection = getScrollDirection();

  trackEvent('section_exit', {
    event_category: 'Section',
    event_label: sectionName,
    section_id: sectionId,
    section_name: sectionName,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
    exit_direction: exitDirection,
    section_position: sectionPosition,
    view_count: sectionViewCounts.get(sectionId) || 1,
  });
}

// Reset section tracking (call on new page)
export function resetSectionTracking() {
  lastScrollY = 0;
  currentSection = null;
  sectionViewCounts.clear();
}

// ============================================
// PROJECT TRACKING
// ============================================

export function trackProjectView(
  projectId: string,
  projectTitle: string,
  projectCategory: string,
  options?: {
    positionInList?: number;
    wasScrolledTo?: boolean;
    wasRecommended?: boolean;
    viewportPosition?: 'above_fold' | 'below_fold';
  }
) {
  // Track unique projects viewed
  const isFirstView = !projectsViewed.includes(projectId);
  if (isFirstView) {
    projectsViewed.push(projectId);
  }

  // Calculate time to first view (from session start)
  const timeToFirstView = isFirstView
    ? Math.round((Date.now() - sessionStartTime) / 1000)
    : null;

  trackEvent('project_view', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
    // New fields
    is_first_view: isFirstView,
    time_to_first_view: timeToFirstView,
    projects_viewed_before: projectsViewed.length - 1,
    position_in_list: options?.positionInList ?? null,
    was_scrolled_to: options?.wasScrolledTo ?? true,
    was_recommended: options?.wasRecommended ?? false,
    viewport_position: options?.viewportPosition ?? getViewportPosition(),
  });
}

// Helper to determine if element is above or below fold
function getViewportPosition(): 'above_fold' | 'below_fold' {
  return window.scrollY < window.innerHeight ? 'above_fold' : 'below_fold';
}

// Track project hover start (call on mouseenter)
export function trackProjectHoverStart(projectId: string) {
  projectHoverTimes.set(projectId, Date.now());
}

// Track project hover end (call on mouseleave without click)
export function trackProjectHoverEnd(projectId: string) {
  projectHoverTimes.delete(projectId);
}

export function trackProjectClick(
  projectId: string,
  projectTitle: string,
  projectCategory: string,
  options?: {
    positionInList?: number;
    wasRecommended?: boolean;
  }
) {
  // Calculate hover duration before click
  const hoverStartTime = projectHoverTimes.get(projectId);
  const hoverDuration = hoverStartTime
    ? Math.round((Date.now() - hoverStartTime) / 1000)
    : null;
  projectHoverTimes.delete(projectId);

  // Track unique projects clicked
  if (!projectsClicked.includes(projectId)) {
    projectsClicked.push(projectId);
  }

  // Check if this click follows skill-to-project journey
  const isFromSkillClick = skillToProjectJourney &&
    (Date.now() - skillToProjectJourney.timestamp) < 30000; // Within 30 seconds

  trackEvent('project_click', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
    // New fields
    hover_duration_seconds: hoverDuration,
    position_in_list: options?.positionInList ?? null,
    was_recommended: options?.wasRecommended ?? false,
    projects_viewed_before: projectsViewed.length,
    projects_clicked_before: projectsClicked.length - 1,
    time_since_session_start: Math.round((Date.now() - sessionStartTime) / 1000),
    is_from_skill_click: isFromSkillClick,
    source_skill: isFromSkillClick ? skillToProjectJourney?.skill : null,
  });

  // Track skill-to-project journey if applicable
  if (isFromSkillClick && skillToProjectJourney) {
    trackSkillToProjectJourney(
      skillToProjectJourney.skill,
      projectId,
      projectTitle,
      projectCategory
    );
    skillToProjectJourney = null;
  }
}

// Track when case study was clicked from project
let lastProjectClickTime: number | null = null;
let lastProjectClickSection: string | null = null;

export function setLastProjectClick(section: string) {
  lastProjectClickTime = Date.now();
  lastProjectClickSection = section;
}

export function trackCaseStudyOpen(
  projectId: string,
  projectTitle: string,
  projectCategory: string,
  options?: {
    referrerSection?: string;
  }
) {
  // Calculate time since project card was clicked
  const timeSinceProjectClick = lastProjectClickTime
    ? Math.round((Date.now() - lastProjectClickTime) / 1000)
    : null;

  trackEvent('case_study_open', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
    // New fields
    referrer_section: options?.referrerSection ?? lastProjectClickSection ?? currentSection,
    time_since_project_click: timeSinceProjectClick,
    projects_viewed_in_session: projectsViewed.length,
    sections_viewed_before: sectionsViewed.length,
  });
}

export function trackCaseStudyEngagement(
  projectId: string,
  projectTitle: string,
  timeSpent: number,
  scrollDepth: number,
  options?: {
    sectionsRead?: string[];
    imagesViewed?: number;
  }
) {
  // Calculate completion rate based on scroll depth and time
  const expectedReadTime = 120; // 2 minutes expected for full read
  const timeCompletionRate = Math.min(100, (timeSpent / expectedReadTime) * 100);
  const completionRate = Math.round((scrollDepth + timeCompletionRate) / 2);

  trackEvent('case_study_engagement', {
    event_category: 'Project',
    event_label: projectTitle,
    project_id: projectId,
    project_title: projectTitle,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
    value: Math.round(timeSpent),
    // New fields
    sections_read: options?.sectionsRead ?? [],
    sections_read_count: options?.sectionsRead?.length ?? 0,
    images_viewed: options?.imagesViewed ?? 0,
    completion_rate: completionRate,
    is_deep_read: timeSpent > 60 && scrollDepth > 75,
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
// CLIENT WORK & EXPERIENCE TRACKING
// ============================================

export function trackClientView(
  clientId: string,
  clientName: string,
  domain: string,
  experienceId: string,
  experienceTitle: string
) {
  trackEvent('client_view', {
    event_category: 'Client Work',
    event_label: clientName,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
    experience_id: experienceId,
    experience_title: experienceTitle,
  });
}

export function trackClientClick(
  clientId: string,
  clientName: string,
  domain: string,
  experienceId: string
) {
  trackEvent('client_click', {
    event_category: 'Client Work',
    event_label: clientName,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
    experience_id: experienceId,
  });
}

export function trackClientCaseStudyOpen(
  clientId: string,
  clientName: string,
  domain: string,
  experienceTitle: string
) {
  trackEvent('client_case_study_open', {
    event_category: 'Client Work',
    event_label: clientName,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
    experience_title: experienceTitle,
  });
}

export function trackClientCaseStudyEngagement(
  clientId: string,
  clientName: string,
  domain: string,
  timeSpent: number,
  scrollDepth: number
) {
  trackEvent('client_case_study_engagement', {
    event_category: 'Client Work',
    event_label: clientName,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
    time_spent_seconds: Math.round(timeSpent),
    scroll_depth_percent: Math.round(scrollDepth),
    value: Math.round(timeSpent),
  });
}

export function trackDomainInterest(domain: string, clientId: string, clientName: string) {
  trackEvent('domain_interest', {
    event_category: 'Career Insights',
    event_label: domain,
    domain: domain,
    source_client_id: clientId,
    source_client_name: clientName,
  });
}

export function trackClientTechStackClick(
  technology: string,
  clientId: string,
  clientName: string,
  domain: string
) {
  trackEvent('client_tech_stack_click', {
    event_category: 'Tech Demand',
    event_label: technology,
    technology: technology,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
  });
}

export function trackExperienceLevelInterest(
  experienceId: string,
  experienceTitle: string,
  company: string
) {
  trackEvent('experience_level_interest', {
    event_category: 'Career Insights',
    event_label: experienceTitle,
    experience_id: experienceId,
    experience_title: experienceTitle,
    company: company,
  });
}

export function trackContributionView(
  clientId: string,
  clientName: string,
  contributionIndex: number
) {
  trackEvent('contribution_view', {
    event_category: 'Client Work',
    event_label: `${clientName} - Contribution ${contributionIndex + 1}`,
    client_id: clientId,
    client_name: clientName,
    contribution_index: contributionIndex,
  });
}

export function trackProblemStatementRead(
  clientId: string,
  clientName: string,
  domain: string,
  readTime: number
) {
  trackEvent('problem_statement_read', {
    event_category: 'Client Work',
    event_label: clientName,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
    read_time_seconds: Math.round(readTime),
  });
}

export function trackSolutionRead(
  clientId: string,
  clientName: string,
  domain: string,
  readTime: number
) {
  trackEvent('solution_read', {
    event_category: 'Client Work',
    event_label: clientName,
    client_id: clientId,
    client_name: clientName,
    domain: domain,
    read_time_seconds: Math.round(readTime),
  });
}

// ============================================
// RECOMMENDATION TRACKING
// ============================================

export function trackRecommendationShown(
  recommendedProjectId: string,
  recommendedProjectTitle: string,
  sourceProjectId: string,
  position: number,
  options?: {
    recommendationAlgorithm?: 'category_match' | 'tech_match' | 'popularity' | 'recent';
    contextCategory?: string;
  }
) {
  // Store when recommendation was shown
  recommendationsShown.set(recommendedProjectId, {
    time: Date.now(),
    position: position,
  });

  // Check if user has viewed similar projects
  const userViewedSimilar = projectsViewed.some(
    p => p !== sourceProjectId && p !== recommendedProjectId
  );

  trackEvent('recommendation_shown', {
    event_category: 'Recommendation',
    event_label: recommendedProjectTitle,
    recommended_project_id: recommendedProjectId,
    recommended_project_title: recommendedProjectTitle,
    source_project_id: sourceProjectId,
    position: position,
    // New fields
    recommendation_algorithm: options?.recommendationAlgorithm ?? 'category_match',
    context_category: options?.contextCategory ?? null,
    user_viewed_similar: userViewedSimilar,
    total_recommendations_shown: recommendationsShown.size,
    viewport_position: getViewportPosition(),
    is_above_fold: position <= 2 && window.scrollY < window.innerHeight,
  });
}

export function trackRecommendationClick(
  recommendedProjectId: string,
  recommendedProjectTitle: string,
  sourceProjectId: string,
  position: number,
  options?: {
    recommendationAlgorithm?: string;
  }
) {
  // Get time since recommendation was shown
  const shownData = recommendationsShown.get(recommendedProjectId);
  const timeSinceShown = shownData
    ? Math.round((Date.now() - shownData.time) / 1000)
    : null;
  const wasAboveFold = shownData ? shownData.position <= 2 : null;

  trackEvent('recommendation_click', {
    event_category: 'Recommendation',
    event_label: recommendedProjectTitle,
    recommended_project_id: recommendedProjectId,
    recommended_project_title: recommendedProjectTitle,
    source_project_id: sourceProjectId,
    position: position,
    // New fields
    time_since_shown: timeSinceShown,
    was_above_fold: wasAboveFold,
    click_position_in_list: position,
    recommendation_algorithm: options?.recommendationAlgorithm ?? null,
    total_recommendations_shown: recommendationsShown.size,
    projects_viewed_before: projectsViewed.length,
  });

  // Increment conversions count for engagement score
  conversionsCount++;
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

// Track scroll metrics
let lastScrollTime: number = Date.now();
let scrollStartTime: number = Date.now();
let lastScrollDepth: number = 0;
const scrollMilestonesTimes: Map<number, number> = new Map();

export function trackScrollDepth(depth: number, sectionId?: string) {
  // Only track at 25%, 50%, 75%, 100%
  const milestone = Math.floor(depth / 25) * 25;
  const now = Date.now();

  // Update max scroll depth
  if (depth > maxScrollDepth) {
    maxScrollDepth = depth;
  }

  // Calculate scroll velocity (% per second)
  const timeSinceLastScroll = (now - lastScrollTime) / 1000;
  const depthChange = depth - lastScrollDepth;
  const scrollVelocity = timeSinceLastScroll > 0
    ? Math.round(depthChange / timeSinceLastScroll)
    : 0;

  // Track time to reach this milestone
  const timeToReachDepth = Math.round((now - scrollStartTime) / 1000);
  if (!scrollMilestonesTimes.has(milestone)) {
    scrollMilestonesTimes.set(milestone, timeToReachDepth);
  }

  // Detect if user is bouncing (fast scroll without stopping)
  const isBouncing = scrollVelocity > 50 && depth < 25;

  trackEvent('scroll_depth', {
    event_category: 'Engagement',
    event_label: `${milestone}%`,
    scroll_depth_percent: milestone,
    section_id: sectionId,
    // New fields
    scroll_velocity: Math.abs(scrollVelocity),
    time_to_reach_depth: scrollMilestonesTimes.get(milestone) ?? timeToReachDepth,
    is_bouncing: isBouncing,
    scroll_direction: depthChange > 0 ? 'down' : 'up',
    current_section: currentSection,
  });

  // Update tracking state
  lastScrollTime = now;
  lastScrollDepth = depth;
}

// Reset scroll tracking (call on new page)
export function resetScrollTracking() {
  lastScrollTime = Date.now();
  scrollStartTime = Date.now();
  lastScrollDepth = 0;
  scrollMilestonesTimes.clear();
}

// ============================================
// CONVERSION TRACKING
// ============================================

// Track contact form state
let contactFormStartTime: number | null = null;
let contactFormFieldsCompleted: string[] = [];

export function trackContactFormStart(options?: {
  triggerAction?: 'scroll_to_section' | 'nav_click' | 'cta_click' | 'direct';
  fieldsVisible?: string[];
}) {
  contactFormStartTime = Date.now();
  contactFormFieldsCompleted = [];

  trackEvent('contact_form_start', {
    event_category: 'Conversion',
    event_label: 'Form Started',
    // New fields
    trigger_action: options?.triggerAction ?? 'scroll_to_section',
    fields_visible: options?.fieldsVisible ?? ['name', 'email', 'message'],
    time_on_site_before_start: Math.round((Date.now() - sessionStartTime) / 1000),
    sections_viewed: sectionsViewed.length,
    projects_viewed: projectsViewed.length,
    scroll_depth_at_start: maxScrollDepth,
  });
}

export function trackContactFormFieldComplete(fieldName: string) {
  if (!contactFormFieldsCompleted.includes(fieldName)) {
    contactFormFieldsCompleted.push(fieldName);
  }
}

export function trackContactFormSubmit(formData: {
  hasName: boolean;
  hasEmail: boolean;
  hasMessage: boolean;
  messageLength?: number;
}) {
  // Ensure form_start is tracked before form_submit (handles page refresh edge case)
  if (!contactFormStartTime) {
    trackContactFormStart({ triggerAction: 'direct' });
  }

  // Calculate time to submit
  const timeToSubmit = contactFormStartTime
    ? Math.round((Date.now() - contactFormStartTime) / 1000)
    : null;

  // Calculate form completion rate
  const totalFields = 3;
  const completedFields = [formData.hasName, formData.hasEmail, formData.hasMessage]
    .filter(Boolean).length;
  const formCompletionRate = Math.round((completedFields / totalFields) * 100);

  trackEvent('contact_form_submit', {
    event_category: 'Conversion',
    event_label: 'Form Submitted',
    has_name: formData.hasName,
    has_email: formData.hasEmail,
    has_message: formData.hasMessage,
    // New fields
    message_length: formData.messageLength ?? 0,
    time_to_submit: timeToSubmit,
    form_completion_rate: formCompletionRate,
    sections_viewed_before: sectionsViewed.length,
    projects_clicked_before: projectsClicked.length,
    time_on_site: Math.round((Date.now() - sessionStartTime) / 1000),
  });

  // Also track as a conversion
  trackEvent('conversion', {
    event_category: 'Conversion',
    event_label: 'Contact Form',
    conversion_type: 'contact',
  });

  conversionsCount++;
  contactFormStartTime = null;
}

export function trackResumeDownload(options?: {
  downloadSource?: 'navbar' | 'hero' | 'about' | 'footer' | 'floating';
}) {
  trackEvent('resume_download', {
    event_category: 'Conversion',
    event_label: 'Resume Downloaded',
    // New fields
    download_source: options?.downloadSource ?? 'unknown',
    sections_viewed_before: sectionsViewed.length,
    projects_clicked_before: projectsClicked.length,
    time_on_site_before_download: Math.round((Date.now() - sessionStartTime) / 1000),
    scroll_depth_at_download: maxScrollDepth,
    current_section: currentSection,
    is_first_visit: localStorage.getItem('portfolio_visit_count') === '1',
  });

  trackEvent('conversion', {
    event_category: 'Conversion',
    event_label: 'Resume Download',
    conversion_type: 'resume',
  });

  conversionsCount++;
}

export function trackSocialClick(
  platform: string,
  url: string,
  options?: {
    clickContext?: 'header' | 'footer' | 'hero' | 'contact' | 'about';
  }
) {
  trackEvent('social_click', {
    event_category: 'Social',
    event_label: platform,
    platform: platform,
    url: url,
    // New fields
    click_context: options?.clickContext ?? currentSection ?? 'unknown',
    time_on_site_before_click: Math.round((Date.now() - sessionStartTime) / 1000),
    sections_viewed: sectionsViewed.length,
    projects_viewed: projectsViewed.length,
    is_returning_visitor: localStorage.getItem('portfolio_visited') === 'true',
  });
}

export function trackCertificationClick(
  certTitle: string,
  certIssuer: string,
  options?: {
    certYear?: number;
    isExpired?: boolean;
    certCategory?: 'cloud' | 'ml' | 'data' | 'security' | 'other';
  }
) {
  trackEvent('certification_click', {
    event_category: 'Certification',
    event_label: certTitle,
    cert_title: certTitle,
    cert_issuer: certIssuer,
    // New fields
    cert_year: options?.certYear ?? null,
    is_expired: options?.isExpired ?? false,
    cert_category: options?.certCategory ?? 'other',
    time_on_site: Math.round((Date.now() - sessionStartTime) / 1000),
    current_section: currentSection,
  });
}

export function trackPublicationClick(
  pubTitle: string,
  options?: {
    pubType?: 'journal' | 'conference' | 'preprint' | 'blog' | 'patent';
    pubYear?: number;
    coAuthorsCount?: number;
  }
) {
  trackEvent('publication_click', {
    event_category: 'Publication',
    event_label: pubTitle,
    pub_title: pubTitle,
    // New fields
    pub_type: options?.pubType ?? 'journal',
    pub_year: options?.pubYear ?? null,
    co_authors_count: options?.coAuthorsCount ?? 0,
    time_on_site: Math.round((Date.now() - sessionStartTime) / 1000),
    sections_viewed: sectionsViewed.length,
  });
}

// ============================================
// SKILL & INTEREST TRACKING
// ============================================

// Track skill clicks for skill-to-project journey
export function trackSkillClick(
  skillName: string,
  category: string,
  options?: {
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    relatedProjectsCount?: number;
    wasInViewport?: boolean;
  }
) {
  // Start tracking skill-to-project journey
  skillToProjectJourney = {
    skill: skillName,
    timestamp: Date.now(),
  };

  trackEvent('skill_click', {
    event_category: 'Skills',
    event_label: skillName,
    skill_name: skillName,
    skill_category: category,
    // New fields
    skill_level: options?.skillLevel ?? 'intermediate',
    related_projects_count: options?.relatedProjectsCount ?? 0,
    was_in_viewport: options?.wasInViewport ?? true,
    time_on_site: Math.round((Date.now() - sessionStartTime) / 1000),
    projects_viewed_before: projectsViewed.length,
    sections_viewed: sectionsViewed.length,
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

// Track idle time for exit intent
let lastActivityTime: number = Date.now();

export function updateLastActivity() {
  lastActivityTime = Date.now();
}

export function trackExitIntent(
  lastSection: string,
  timeOnPage: number,
  scrollDepth: number,
  options?: {
    mouseExitPosition?: { x: number; y: number };
    exitTrigger?: 'mouse_leave' | 'tab_blur' | 'idle' | 'back_button';
  }
) {
  // Calculate if user was idle before exit
  const idleTime = Math.round((Date.now() - lastActivityTime) / 1000);
  const wasIdle = idleTime > 30; // 30 seconds of no activity

  trackEvent('exit_intent', {
    event_category: 'Engagement',
    event_label: lastSection,
    last_section: lastSection,
    time_on_page_seconds: Math.round(timeOnPage),
    scroll_depth_percent: Math.round(scrollDepth),
    // New fields
    mouse_exit_x: options?.mouseExitPosition?.x ?? null,
    mouse_exit_y: options?.mouseExitPosition?.y ?? null,
    exit_trigger: options?.exitTrigger ?? 'mouse_leave',
    final_section_time: Math.round(timeOnPage - (sectionViewCounts.size > 0 ? timeOnPage * 0.7 : 0)),
    was_idle: wasIdle,
    idle_time_seconds: idleTime,
    sections_viewed: sectionsViewed.length,
    projects_clicked: projectsClicked.length,
    conversions_count: conversionsCount,
  });
}

// ============================================
// CTA & ENGAGEMENT TRACKING
// ============================================

// Track CTA visibility timing
const ctaViewTimes: Map<string, number> = new Map();

export function trackCTAView(
  ctaName: string,
  ctaLocation: string,
  options?: {
    wasAnimated?: boolean;
  }
) {
  // Store when CTA was first viewed
  const ctaKey = `${ctaName}-${ctaLocation}`;
  if (!ctaViewTimes.has(ctaKey)) {
    ctaViewTimes.set(ctaKey, Date.now());
  }

  const timeInViewport = ctaViewTimes.has(ctaKey)
    ? Math.round((Date.now() - ctaViewTimes.get(ctaKey)!) / 1000)
    : 0;

  trackEvent('cta_view', {
    event_category: 'CTA',
    event_label: ctaName,
    cta_name: ctaName,
    cta_location: ctaLocation,
    // New fields
    viewport_position: getViewportPosition(),
    time_in_viewport: timeInViewport,
    was_animated: options?.wasAnimated ?? false,
    time_on_site: Math.round((Date.now() - sessionStartTime) / 1000),
    scroll_depth: maxScrollDepth,
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
// ADVANCED ENGAGEMENT TRACKING (NEW)
// ============================================

/**
 * Track real-time engagement score
 * Call periodically (every 30 seconds) to track engagement progression
 */
export function trackEngagementScore() {
  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);

  // Calculate current engagement score
  const timeScore = Math.min(30, Math.round(sessionDuration / 10));
  const sectionScore = Math.min(20, sectionsViewed.length * 2.5);
  const projectScore = Math.min(20, projectsClicked.length * 5);
  const scrollScore = Math.min(15, Math.round(maxScrollDepth / 6.67));
  const conversionScore = Math.min(15, conversionsCount * 5);
  const engagementScore = Math.round(timeScore + sectionScore + projectScore + scrollScore + conversionScore);

  trackEvent('engagement_score', {
    event_category: 'Engagement',
    event_label: `Score: ${engagementScore}`,
    engagement_score: engagementScore,
    time_score: timeScore,
    section_score: sectionScore,
    project_score: projectScore,
    scroll_score: scrollScore,
    conversion_score: conversionScore,
    session_duration: sessionDuration,
    sections_viewed: sectionsViewed.length,
    projects_clicked: projectsClicked.length,
    max_scroll_depth: maxScrollDepth,
    conversions: conversionsCount,
  });

  return engagementScore;
}

/**
 * Track when user views multiple similar projects (project comparison behavior)
 */
export function trackProjectComparison(
  projectIds: string[],
  projectTitles: string[],
  sharedCategory: string
) {
  if (projectIds.length < 2) return;

  trackEvent('project_comparison', {
    event_category: 'Behavior',
    event_label: `Comparing ${projectIds.length} projects`,
    project_ids: projectIds,
    project_titles: projectTitles,
    shared_category: sharedCategory,
    comparison_count: projectIds.length,
    time_between_views: Math.round((Date.now() - sessionStartTime) / 1000 / projectIds.length),
    session_duration: Math.round((Date.now() - sessionStartTime) / 1000),
  });
}

/**
 * Track skill-to-project journey (when user clicks skill then views related project)
 */
export function trackSkillToProjectJourney(
  skillName: string,
  projectId: string,
  projectTitle: string,
  projectCategory: string
) {
  const timeBetween = skillToProjectJourney
    ? Math.round((Date.now() - skillToProjectJourney.timestamp) / 1000)
    : null;

  trackEvent('skill_to_project_journey', {
    event_category: 'Behavior',
    event_label: `${skillName} → ${projectTitle}`,
    skill_name: skillName,
    project_id: projectId,
    project_title: projectTitle,
    project_category: projectCategory,
    time_between_seconds: timeBetween,
    is_quick_journey: timeBetween !== null && timeBetween < 10,
    sections_visited_between: sectionsViewed.length,
  });
}

/**
 * Track click coordinates for heatmap analysis
 */
export function trackHeatmapClick(
  x: number,
  y: number,
  elementType: string,
  elementId?: string
) {
  // Normalize coordinates to viewport percentage
  const viewportX = Math.round((x / window.innerWidth) * 100);
  const viewportY = Math.round((y / window.innerHeight) * 100);

  // Calculate position relative to document
  const documentX = Math.round(((x + window.scrollX) / document.body.scrollWidth) * 100);
  const documentY = Math.round(((y + window.scrollY) / document.body.scrollHeight) * 100);

  trackEvent('heatmap_click', {
    event_category: 'Heatmap',
    event_label: elementType,
    viewport_x: viewportX,
    viewport_y: viewportY,
    document_x: documentX,
    document_y: documentY,
    element_type: elementType,
    element_id: elementId ?? null,
    current_section: currentSection,
    scroll_depth: maxScrollDepth,
    device_type: getDeviceType(),
  });
}

/**
 * Track reading pattern (fast scroll vs deep read)
 */
let readingStartTime: number | null = null;
let readingScrollEvents: number = 0;

export function startReadingTracking() {
  readingStartTime = Date.now();
  readingScrollEvents = 0;
}

export function incrementReadingScroll() {
  readingScrollEvents++;
}

export function trackReadingPattern(sectionId: string, sectionName: string) {
  if (!readingStartTime) return;

  const readingDuration = Math.round((Date.now() - readingStartTime) / 1000);
  const scrollsPerSecond = readingDuration > 0 ? readingScrollEvents / readingDuration : 0;

  // Determine reading pattern
  let readingPattern: 'deep_read' | 'skimming' | 'scanning' | 'bouncing';
  if (readingDuration > 60 && scrollsPerSecond < 0.5) {
    readingPattern = 'deep_read';
  } else if (readingDuration > 30 && scrollsPerSecond < 1) {
    readingPattern = 'skimming';
  } else if (readingDuration > 10) {
    readingPattern = 'scanning';
  } else {
    readingPattern = 'bouncing';
  }

  trackEvent('reading_pattern', {
    event_category: 'Behavior',
    event_label: readingPattern,
    section_id: sectionId,
    section_name: sectionName,
    reading_duration: readingDuration,
    scroll_events: readingScrollEvents,
    scrolls_per_second: Math.round(scrollsPerSecond * 100) / 100,
    reading_pattern: readingPattern,
    is_deep_read: readingPattern === 'deep_read',
  });

  readingStartTime = null;
  readingScrollEvents = 0;

  return readingPattern;
}

/**
 * Track return visit behavior differences
 */
export function trackReturnVisitBehavior() {
  const visitCount = parseInt(localStorage.getItem('portfolio_visit_count') || '0', 10);
  const lastVisit = localStorage.getItem('portfolio_last_visit');
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (visitCount === 0) return; // Only track for returning visitors

  // Get previous session data if stored
  const previousSectionsViewed = localStorage.getItem('portfolio_last_sections_viewed');
  const previousProjectsClicked = localStorage.getItem('portfolio_last_projects_clicked');

  trackEvent('return_visit_behavior', {
    event_category: 'Behavior',
    event_label: `Visit #${visitCount + 1}`,
    visit_count: visitCount + 1,
    days_since_last_visit: daysSinceLastVisit,
    current_sections_viewed: sectionsViewed,
    current_projects_clicked: projectsClicked,
    previous_sections_viewed: previousSectionsViewed ? JSON.parse(previousSectionsViewed) : [],
    previous_projects_clicked: previousProjectsClicked ? JSON.parse(previousProjectsClicked) : [],
    is_exploring_new_sections: sectionsViewed.some(
      s => !previousSectionsViewed?.includes(s)
    ),
    is_revisiting_projects: projectsClicked.some(
      p => previousProjectsClicked?.includes(p)
    ),
    time_on_site: Math.round((Date.now() - sessionStartTime) / 1000),
  });

  // Store current session data for next visit
  localStorage.setItem('portfolio_last_sections_viewed', JSON.stringify(sectionsViewed));
  localStorage.setItem('portfolio_last_projects_clicked', JSON.stringify(projectsClicked));
}

/**
 * Track aggregate tech stack interest across projects
 */
const techStackInterests: Map<string, number> = new Map();

export function recordTechInterest(technology: string) {
  const count = (techStackInterests.get(technology) || 0) + 1;
  techStackInterests.set(technology, count);
}

export function trackTechStackInterest() {
  if (techStackInterests.size === 0) return;

  // Convert to sorted array
  const sortedInterests = Array.from(techStackInterests.entries())
    .sort((a, b) => b[1] - a[1]);

  const topTechnologies = sortedInterests.slice(0, 5).map(([tech]) => tech);
  const interestCounts = Object.fromEntries(sortedInterests);

  trackEvent('tech_stack_interest', {
    event_category: 'Interest',
    event_label: topTechnologies.join(', '),
    top_technologies: topTechnologies,
    interest_counts: interestCounts,
    total_tech_interactions: sortedInterests.reduce((sum, [, count]) => sum + count, 0),
    unique_technologies: techStackInterests.size,
    projects_viewed: projectsViewed.length,
    session_duration: Math.round((Date.now() - sessionStartTime) / 1000),
  });
}

// ============================================
// ANALYTICS DASHBOARD TRACKING
// ============================================

export function trackAnalyticsDashboardClick() {
  const visitCount = parseInt(localStorage.getItem('portfolio_visit_count') || '1', 10);
  const isReturning = localStorage.getItem('portfolio_visited') === 'true';

  trackEvent('analytics_dashboard_click', {
    event_category: 'Conversion',
    event_label: 'Analytics Dashboard',
    // Time context
    time_on_site_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
    // Scroll context
    scroll_depth_at_click: maxScrollDepth,
    // Section engagement
    pipeline_steps_visible: sectionsViewed.includes('data-pipeline') ? 7 : 0,
    // Visitor context
    is_returning_visitor: isReturning,
    visit_count: visitCount,
    // Traffic source
    traffic_source: getUTMParam('utm_source') || 'direct',
    // Device
    device_type: getDeviceType(),
  });
}

// ============================================
// SESSION TRACKING
// ============================================

export function trackSessionStart() {
  // Reset all tracking for new session
  resetPageTracking();
  resetEngagementTracking();

  const now = new Date();

  // Get visit history from localStorage
  const visitCount = parseInt(localStorage.getItem('portfolio_visit_count') || '0', 10);
  const lastVisit = localStorage.getItem('portfolio_last_visit');
  const daysSinceLastVisit = lastVisit
    ? Math.floor((now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const sessionData = {
    // Original tracking
    referrer: document.referrer || 'direct',
    landing_page: window.location.pathname,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    device_type: getDeviceType(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),

    // Browser & OS
    browser: getBrowserName(),
    browser_version: getBrowserVersion(),
    operating_system: getOperatingSystem(),

    // Language & Preferences
    language: navigator.language || 'unknown',
    color_scheme: getColorSchemePreference(),

    // Returning visitor data
    visit_count: visitCount + 1,
    days_since_last_visit: daysSinceLastVisit,
    is_returning: visitCount > 0,

    // Time context
    day_of_week: getDayOfWeek(now),
    hour_of_day: now.getHours(),
    local_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Connection info
    connection_type: getConnectionType(),
    is_online: navigator.onLine,
  };

  trackEvent('session_start', {
    event_category: 'Session',
    event_label: 'Session Started',
    ...sessionData,
  });

  return sessionData;
}

export function trackSessionEnd(sessionDuration: number, pagesViewed: number) {
  // Calculate engagement score (0-100)
  // Based on: time on site, sections viewed, projects clicked, scroll depth, conversions
  const timeScore = Math.min(30, Math.round(sessionDuration / 10)); // Max 30 points for 5+ min
  const sectionScore = Math.min(20, sectionsViewed.length * 2.5); // Max 20 points for 8 sections
  const projectScore = Math.min(20, projectsClicked.length * 5); // Max 20 points for 4+ projects clicked
  const scrollScore = Math.min(15, Math.round(maxScrollDepth / 6.67)); // Max 15 points for 100% scroll
  const conversionScore = Math.min(15, conversionsCount * 5); // Max 15 points for 3+ conversions
  const engagementScore = Math.round(timeScore + sectionScore + projectScore + scrollScore + conversionScore);

  // Determine engagement level
  let engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
  if (engagementScore < 25) engagementLevel = 'low';
  else if (engagementScore < 50) engagementLevel = 'medium';
  else if (engagementScore < 75) engagementLevel = 'high';
  else engagementLevel = 'very_high';

  // Update visit history in localStorage
  const visitCount = parseInt(localStorage.getItem('portfolio_visit_count') || '0', 10);
  localStorage.setItem('portfolio_visit_count', String(visitCount + 1));
  localStorage.setItem('portfolio_last_visit', new Date().toISOString());

  trackEvent('session_end', {
    event_category: 'Session',
    event_label: 'Session Ended',
    session_duration_seconds: Math.round(sessionDuration),
    pages_viewed: pagesViewed,
    value: Math.round(sessionDuration),
    // New fields
    max_scroll_depth: maxScrollDepth,
    sections_viewed_count: sectionsViewed.length,
    sections_viewed_list: sectionsViewed,
    projects_viewed_count: projectsViewed.length,
    projects_clicked_count: projectsClicked.length,
    conversions_count: conversionsCount,
    engagement_score: engagementScore,
    engagement_level: engagementLevel,
    // Breakdown scores
    time_score: timeScore,
    section_score: sectionScore,
    project_score: projectScore,
    scroll_score: scrollScore,
    conversion_score: conversionScore,
    // User journey summary
    last_section: currentSection,
    total_visit_count: visitCount + 1,
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

function getBrowserName(): string {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Edg')) return 'Edge (Chromium)';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';

  return 'Unknown';
}

function getBrowserVersion(): string {
  const ua = navigator.userAgent;
  let match: RegExpMatchArray | null;

  if (ua.includes('Firefox')) {
    match = ua.match(/Firefox\/(\d+(\.\d+)?)/);
  } else if (ua.includes('SamsungBrowser')) {
    match = ua.match(/SamsungBrowser\/(\d+(\.\d+)?)/);
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    match = ua.match(/(Opera|OPR)\/(\d+(\.\d+)?)/);
    return match ? match[2] : 'Unknown';
  } else if (ua.includes('Edg')) {
    match = ua.match(/Edg\/(\d+(\.\d+)?)/);
  } else if (ua.includes('Edge')) {
    match = ua.match(/Edge\/(\d+(\.\d+)?)/);
  } else if (ua.includes('Chrome')) {
    match = ua.match(/Chrome\/(\d+(\.\d+)?)/);
  } else if (ua.includes('Safari')) {
    match = ua.match(/Version\/(\d+(\.\d+)?)/);
  } else if (ua.includes('MSIE')) {
    match = ua.match(/MSIE (\d+(\.\d+)?)/);
  } else if (ua.includes('Trident')) {
    match = ua.match(/rv:(\d+(\.\d+)?)/);
  } else {
    return 'Unknown';
  }

  return match ? match[1] : 'Unknown';
}

function getOperatingSystem(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('CrOS')) return 'Chrome OS';

  return platform || 'Unknown';
}

function getColorSchemePreference(): string {
  if (typeof window === 'undefined') return 'unknown';

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return 'no-preference';
}

function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown';

  // Navigator.connection is experimental and not available in all browsers
  const connection = (navigator as any).connection ||
                     (navigator as any).mozConnection ||
                     (navigator as any).webkitConnection;

  if (!connection) return 'unknown';

  // effectiveType can be: 'slow-2g', '2g', '3g', '4g'
  return connection.effectiveType || connection.type || 'unknown';
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

      // Track return visit behavior before session ends
      trackReturnVisitBehavior();

      // Track tech stack interest before session ends
      trackTechStackInterest();

      trackSessionEnd(sessionDuration, pagesViewed.current);

      // Send remaining section engagements
      sectionEngagements.current.forEach((engagement, sectionId) => {
        if (engagement.totalTime > 0) {
          trackSectionExit(
            sectionId,
            engagement.sectionName,
            engagement.totalTime,
            engagement.maxScrollDepth,
            0 // Default position for cleanup
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
  const trackSectionEnter = useCallback((sectionId: string, sectionName: string, sectionPosition: number = 0) => {
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
      trackSectionView(sectionId, sectionName, sectionPosition);
    }
  }, []);

  const trackSectionLeave = useCallback((sectionId: string, scrollDepth: number = 0, sectionPosition: number = 0) => {
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
        engagement.maxScrollDepth,
        sectionPosition
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
    trackContactFormFieldComplete,
    trackResumeDownload,
    trackSocialClick,
    trackCertificationClick,
    trackPublicationClick,

    // Skill tracking
    trackSkillClick,
    trackSkillCategoryView,
    trackTechnologyInterest,

    // Advanced tracking
    trackProjectHoverStart,
    trackProjectHoverEnd,
    trackEngagementScore,
    trackProjectComparison,
    trackSkillToProjectJourney,
    trackHeatmapClick,
    startReadingTracking,
    incrementReadingScroll,
    trackReadingPattern,
    trackReturnVisitBehavior,
    recordTechInterest,
    trackTechStackInterest,

    // CTA tracking
    trackCTAView,
    trackExitIntent,
    updateLastActivity,

    // Content tracking
    trackContentCopy,
    trackTimeThreshold,

    // Analytics dashboard
    trackAnalyticsDashboardClick,
  };
}

export default useAnalytics;
