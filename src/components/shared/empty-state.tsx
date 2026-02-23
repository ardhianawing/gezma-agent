'use client';

import { LucideIcon, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  const { c } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: c.cardBgHover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Icon style={{ width: '28px', height: '28px', color: c.textLight }} />
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '14px',
            color: c.textMuted,
            margin: '0 0 20px 0',
            maxWidth: '320px',
          }}
        >
          {description}
        </p>
      )}

      {action && (
        action.href ? (
          <Link href={action.href} style={{ textDecoration: 'none' }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: c.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: c.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
