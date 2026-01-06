import { useEffect, useRef, useCallback } from 'react';

interface Section {
  id: string;
  element: HTMLElement;
  top: number;
  bottom: number;
  height: number;
  fitsInViewport: boolean;
}

export function useSmartScroll() {
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSnapTime = useRef(0);
  const sections = useRef<Section[]>([]);
  const pendingSnap = useRef(false);

  // Touch tracking
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isTouching = useRef(false);

  const updateSections = useCallback(() => {
    const sectionElements = document.querySelectorAll('section[id]');
    const viewportHeight = window.innerHeight;

    sections.current = Array.from(sectionElements).map((el) => {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY;
      return {
        id: el.id,
        element: el as HTMLElement,
        top: rect.top + scrollTop,
        bottom: rect.bottom + scrollTop,
        height: rect.height,
        fitsInViewport: rect.height <= viewportHeight * 0.95, // Section must fit with 5% margin
      };
    });
  }, []);

  const getCurrentSection = useCallback((): { section: Section | null; index: number } => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportCenter = scrollTop + viewportHeight / 2;

    for (let i = 0; i < sections.current.length; i++) {
      const section = sections.current[i];
      if (viewportCenter >= section.top && viewportCenter < section.bottom) {
        return { section, index: i };
      }
    }
    return { section: null, index: -1 };
  }, []);

  const isSectionFullyVisible = useCallback((section: Section): boolean => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + viewportHeight;

    // Check if entire section is visible within viewport
    return section.top >= viewportTop - 20 && section.bottom <= viewportBottom + 20;
  }, []);

  const isAtSectionEnd = useCallback((section: Section): boolean => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportBottom = scrollTop + viewportHeight;

    // Only return true when the ENTIRE section bottom is visible (with small buffer)
    // This ensures user can see ALL content before snapping
    return viewportBottom >= section.bottom - 20;
  }, []);

  const isAtSectionStart = useCallback((section: Section): boolean => {
    const scrollTop = window.scrollY;
    const navbarHeight = 80;

    // Check if we're at the very top of the section
    return scrollTop <= section.top - navbarHeight + 20;
  }, []);

  const scrollToSection = useCallback((section: Section) => {
    // Prevent multiple snaps
    if (pendingSnap.current || isScrolling.current) return;

    const now = Date.now();
    // Minimum 1 second between snaps to prevent multiple jumps
    if (now - lastSnapTime.current < 1000) return;

    pendingSnap.current = true;
    isScrolling.current = true;
    lastSnapTime.current = now;

    const navbarHeight = 80;
    const targetScroll = section.top - navbarHeight;

    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth',
    });

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Reset flags after animation completes
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      pendingSnap.current = false;
    }, 1000);
  }, []);

  const handleScrollDirection = useCallback((direction: 'up' | 'down') => {
    // Don't process if already scrolling or snap is pending
    if (isScrolling.current || pendingSnap.current) return false;

    // Check minimum time between snaps
    const now = Date.now();
    if (now - lastSnapTime.current < 1000) return false;

    updateSections();
    const { section: currentSection, index: currentIndex } = getCurrentSection();

    if (!currentSection || currentIndex === -1) return false;

    const scrollingDown = direction === 'down';
    const scrollingUp = direction === 'up';

    // Case 1: Section fits entirely in viewport - snap scroll
    if (currentSection.fitsInViewport && isSectionFullyVisible(currentSection)) {
      if (scrollingDown && currentIndex < sections.current.length - 1) {
        scrollToSection(sections.current[currentIndex + 1]);
        return true;
      } else if (scrollingUp && currentIndex > 0) {
        scrollToSection(sections.current[currentIndex - 1]);
        return true;
      }
    }

    // Case 2: Section doesn't fit - only snap at actual boundaries
    if (!currentSection.fitsInViewport) {
      if (scrollingDown && isAtSectionEnd(currentSection)) {
        if (currentIndex < sections.current.length - 1) {
          scrollToSection(sections.current[currentIndex + 1]);
          return true;
        }
      } else if (scrollingUp && isAtSectionStart(currentSection)) {
        if (currentIndex > 0) {
          scrollToSection(sections.current[currentIndex - 1]);
          return true;
        }
      }
    }

    return false;
  }, [updateSections, getCurrentSection, isSectionFullyVisible, isAtSectionEnd, isAtSectionStart, scrollToSection]);

  // Desktop wheel handler
  const handleWheel = useCallback((e: WheelEvent) => {
    // Don't interfere if currently animating
    if (isScrolling.current || pendingSnap.current) {
      e.preventDefault();
      return;
    }

    // Only trigger on significant scroll (not tiny trackpad movements)
    if (Math.abs(e.deltaY) < 30) return;

    const direction = e.deltaY > 0 ? 'down' : 'up';
    const didSnap = handleScrollDirection(direction);

    if (didSnap) {
      e.preventDefault();
    }
  }, [handleScrollDirection]);

  // Mobile touch handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isTouching.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isTouching.current) return;
    isTouching.current = false;

    // Don't process if already scrolling
    if (isScrolling.current || pendingSnap.current) return;

    const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const touchEndTime = Date.now();

    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = touchEndTime - touchStartTime.current;

    // Calculate velocity
    const velocity = Math.abs(deltaY) / deltaTime;

    // Only trigger on deliberate swipes - higher threshold
    // Must be fast (velocity > 0.8) AND significant distance (> 100px)
    const isDeliberateSwipe = velocity > 0.8 && Math.abs(deltaY) > 100;

    if (!isDeliberateSwipe) return;

    const direction = deltaY > 0 ? 'down' : 'up';

    // Delay to let momentum scroll settle
    setTimeout(() => {
      handleScrollDirection(direction);
    }, 100);
  }, [handleScrollDirection]);

  useEffect(() => {
    updateSections();

    const handleResize = () => {
      updateSections();
    };

    // Desktop: wheel events
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Mobile: touch events
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd, updateSections]);

  return null;
}
