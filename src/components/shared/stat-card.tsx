'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendLabel?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  trendLabel = 'vs last month',
  href
}: StatCardProps) {
  const { c } = useTheme();

  const content = (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        padding: '24px',
        border: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '140px',
        position: 'relative',
        cursor: href ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Icon - posisi absolute di kanan atas */}
      {Icon && (
        <div
          style={{
            position: 'absolute',
            right: '24px',
            top: '24px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: iconBgColor || c.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: '24px', height: '24px', color: iconColor || c.primary }} />
        </div>
      )}

      {/* Content */}
      <div style={{ paddingRight: '60px' }}>
        <p
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: c.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: c.textPrimary,
            margin: '8px 0',
          }}
        >
          {value}
        </p>
        {description && (
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            {description}
          </p>
        )}
      </div>

      {/* Growth indicator - di bagian bawah, DALAM card */}
      <div style={{ marginTop: 'auto' }}>
        {trend ? (
          <span
            style={{
              fontSize: '14px',
              color: trend.isPositive ? c.success : c.error,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {trend.isPositive ? (
              <TrendingUp style={{ width: '16px', height: '16px' }} />
            ) : (
              <TrendingDown style={{ width: '16px', height: '16px' }} />
            )}
            {trend.isPositive ? '+' : ''}{trend.value}% {trendLabel}
          </span>
        ) : (
          <div style={{ height: '20px' }} />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
}
