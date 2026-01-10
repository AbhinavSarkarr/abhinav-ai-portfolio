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
  const isLocked = useRef(false);
  const lockTimeout = useRef<NodeJS.Timeout | null>(null);
  const sections = useRef<Section[]>([]);
  const currentSectionIndex = useRef(0);

  // Touch tracking
  const touchStartY = useRef(0);

  const NAVBAR_HEIGHT = 80;
  const LOCK_DURATION = 1500; // 1.5 seconds lock after each snap

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
        fitsInViewport: rect.height <= viewportHeight - NAVBAR_HEIGHT,
      };
    });
  }, []);

  const getCurrentSectionIndex = useCallback((): number => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < sections.current.length; i++) {
      const section = sections.current[i];
      const sectionStart = section.top - NAVBAR_HEIGHT;
      const sectionEnd = section.bottom;

      // Check if we're within this section
      if (scrollTop >= sectionStart - 50 && scrollTop < sectionEnd - viewportHeight + 50) {
        return i;
      }
    }

    // Fallback: find by viewport center
    const viewportCenter = scrollTop + viewportHeight / 2;
    for (let i = 0; i < sections.current.length; i++) {
      if (viewportCenter >= sections.current[i].top && viewportCenter < sections.current[i].bottom) {
        return i;
      }
    }

    return 0;
  }, []);

  const scrollToSectionStart = useCallback((index: number) => {
    if (index < 0 || index >= sections.current.length) return;
    if (isLocked.current) return;

    const section = sections.current[index];

    // Lock immediately
    isLocked.current = true;
    currentSectionIndex.current = index;

    // Scroll to the START of the section (accounting for navbar)
    const targetScroll = section.top - NAVBAR_HEIGHT;

    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth',
    });

    // Clear existing timeout
    if (lockTimeout.current) {
      clearTimeout(lockTimeout.current);
    }

    // Release lock after duration
    lockTimeout.current = setTimeout(() => {
      isLocked.current = false;
    }, LOCK_DURATION);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Block ALL wheel events while locked
    if (isLocked.current) {
      e.preventDefault();
      return;
    }

    // Ignore tiny scroll movements
    if (Math.abs(e.deltaY) < 10) {
      return;
    }

    updateSections();

    const currentIndex = getCurrentSectionIndex();
    const currentSection = sections.current[currentIndex];

    if (!currentSection) return;

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportBottom = scrollTop + viewportHeight;
    const sectionStart = currentSection.top - NAVBAR_HEIGHT;

    const scrollingDown = e.deltaY > 0;
    const scrollingUp = e.deltaY < 0;

    // For sections that FIT in viewport - always snap
    if (currentSection.fitsInViewport) {
      e.preventDefault();

      if (scrollingDown && currentIndex < sections.current.length - 1) {
        scrollToSectionStart(currentIndex + 1);
      } else if (scrollingUp && currentIndex > 0) {
        scrollToSectionStart(currentIndex - 1);
      }
      return;
    }

    // For LARGE sections - only snap at boundaries
    const atSectionTop = scrollTop <= sectionStart + 20;
    const atSectionBottom = viewportBottom >= currentSection.bottom - 20;

    if (scrollingUp && atSectionTop) {
      e.preventDefault();
      if (currentIndex > 0) {
        scrollToSectionStart(currentIndex - 1);
      }
      return;
    }

    if (scrollingDown && atSectionBottom) {
      e.preventDefault();
      if (currentIndex < sections.current.length - 1) {
        scrollToSectionStart(currentIndex + 1);
      }
      return;
    }

    // Allow normal scrolling within large sections
  }, [updateSections, getCurrentSectionIndex, scrollToSectionStart]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (isLocked.current) return;

    const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaY = touchStartY.current - touchEndY;

    // Need significant swipe distance
    if (Math.abs(deltaY) < 50) return;

    updateSections();

    const currentIndex = getCurrentSectionIndex();
    const currentSection = sections.current[currentIndex];

    if (!currentSection) return;

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportBottom = scrollTop + viewportHeight;
    const sectionStart = currentSection.top - NAVBAR_HEIGHT;

    const scrollingDown = deltaY > 0;
    const scrollingUp = deltaY < 0;

    if (currentSection.fitsInViewport) {
      if (scrollingDown && currentIndex < sections.current.length - 1) {
        scrollToSectionStart(currentIndex + 1);
      } else if (scrollingUp && currentIndex > 0) {
        scrollToSectionStart(currentIndex - 1);
      }
      return;
    }

    const atSectionTop = scrollTop <= sectionStart + 30;
    const atSectionBottom = viewportBottom >= currentSection.bottom - 30;

    if (scrollingUp && atSectionTop && currentIndex > 0) {
      scrollToSectionStart(currentIndex - 1);
    } else if (scrollingDown && atSectionBottom && currentIndex < sections.current.length - 1) {
      scrollToSectionStart(currentIndex + 1);
    }
  }, [updateSections, getCurrentSectionIndex, scrollToSectionStart]);

  useEffect(() => {
    updateSections();

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('resize', updateSections);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', updateSections);
      if (lockTimeout.current) clearTimeout(lockTimeout.current);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd, updateSections]);

  return null;
}
