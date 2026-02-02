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

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1200,
    height: 800,
    isPortrait: false,
    isLandscape: true,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let breakpoint: Breakpoint = 'desktop';
      if (width < 640) {
        breakpoint = 'mobile';
      } else if (width < 1024) {
        breakpoint = 'tablet';
      }

      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
        height,
        isPortrait: height > width,
        isLandscape: width >= height,
      });
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
