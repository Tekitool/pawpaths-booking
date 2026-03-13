// app/(homepage)/hooks/useScrollAnimation.ts

'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * Returns 'up' | 'down' | null based on scroll direction.
 * Uses accumulated delta so even slow scroll-up is detected immediately.
 */
export function useScrollDirection(threshold = 5) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevY = useRef(0);

  useEffect(() => {
    prevY.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;

      // Always show when near the very top
      if (currentY <= 10) {
        setDirection(null);
        prevY.current = currentY;
        return;
      }

      const delta = currentY - prevY.current;

      if (delta > threshold) {
        // Scrolling down — hide
        setDirection('down');
        prevY.current = currentY;
      } else if (delta < -threshold) {
        // Scrolling up — show
        setDirection('up');
        prevY.current = currentY;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
