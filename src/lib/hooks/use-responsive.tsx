'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

function getResponsiveState(width: number, height: number): ResponsiveState {
  let breakpoint: Breakpoint = 'desktop';
  if (width < 640) {
    breakpoint = 'mobile';
  } else if (width < 1280) {
    breakpoint = 'tablet';
  }
  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    width,
    height,
    isPortrait: height > width,
    isLandscape: width >= height,
  };
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window !== 'undefined') {
      return getResponsiveState(window.innerWidth, window.innerHeight);
    }
    return getResponsiveState(1200, 800);
  });

  useEffect(() => {
    const updateState = () => {
      setState(getResponsiveState(window.innerWidth, window.innerHeight));
    };

    updateState();
    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
    };
  }, []);

  return state;
}
