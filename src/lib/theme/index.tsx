'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { colors, ThemeColors } from './colors';
import { lighten, darken, hexToRgba } from './color-utils';

export type Theme = 'light' | 'dark';

interface BrandingOverride {
  primaryColor?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  c: ThemeColors; // current colors
  setBrandingOverride: (override: BrandingOverride | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [brandingOverride, setBrandingOverride] = useState<BrandingOverride | null>(null);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('gezma-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('gezma-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const c = useMemo(() => {
    const base = colors[theme];
    if (!brandingOverride?.primaryColor) return base;

    const primary = brandingOverride.primaryColor;
    const isLight = theme === 'light';
    return {
      ...base,
      primary,
      primaryLight: isLight ? lighten(primary, 0.92) : darken(primary, 0.6),
      primaryHover: isLight ? darken(primary, 0.15) : lighten(primary, 0.1),
      sidebarActiveItem: isLight ? hexToRgba(primary, 0.08) : darken(primary, 0.6),
    };
  }, [theme, brandingOverride]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', setTheme, toggleTheme, c: colors.light, setBrandingOverride }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, c, setBrandingOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { colors };
export type { ThemeColors };
