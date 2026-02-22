'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}

export function ComingSoon({ icon: Icon, title, description, features }: ComingSoonProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '40px 20px' : '80px 40px',
        backgroundColor: c.cardBg,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${c.primaryLight}, ${c.cardBg})`,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <Icon style={{ width: '36px', height: '36px', color: c.primary }} />
      </div>

      <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.textPrimary, margin: '0 0 8px 0' }}>
        {title}
      </h2>

      <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 24px 0', maxWidth: '480px', lineHeight: '1.6' }}>
        {description}
      </p>

      {features && features.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {features.map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: c.textSecondary,
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.primary, flexShrink: 0 }} />
              {feature}
            </div>
          ))}
        </div>
      )}

      <span
        style={{
          display: 'inline-block',
          fontSize: '12px',
          fontWeight: '600',
          color: c.primary,
          backgroundColor: c.primaryLight,
          padding: '6px 16px',
          borderRadius: '20px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        Segera Hadir
      </span>
    </div>
  );
}
