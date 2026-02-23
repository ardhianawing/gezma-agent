'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export function SectionCard({ title, icon, headerRight, children, noPadding }: SectionCardProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: isMobile ? '16px 20px' : '20px 28px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {icon}
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0, flex: 1 }}>
          {title}
        </h3>
        {headerRight}
      </div>
      <div style={noPadding ? undefined : { padding: isMobile ? '20px' : '28px' }}>
        {children}
      </div>
    </div>
  );
}
