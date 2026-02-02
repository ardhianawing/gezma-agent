'use client';

import { LanguageProvider as Provider } from '@/lib/i18n';
import { ReactNode } from 'react';

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
