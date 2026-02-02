'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: c.textPrimary,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: '14px',
              color: c.textMuted,
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
