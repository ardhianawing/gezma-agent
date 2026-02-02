'use client';

import { ThemeProvider as Provider } from '@/lib/theme';
import { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
