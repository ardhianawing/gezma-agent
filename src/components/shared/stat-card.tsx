'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

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
  const { isMobile } = useResponsive();

  const content = (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        padding: isMobile ? '14px' : '20px',
        border: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '6px' : '8px',
        minHeight: isMobile ? '100px' : '130px',
        position: 'relative',
        cursor: href ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Icon - posisi absolute di kanan atas, smaller on mobile */}
      {Icon && (
        <div
          style={{
            position: 'absolute',
            right: isMobile ? '12px' : '16px',
            top: isMobile ? '12px' : '16px',
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            backgroundColor: iconBgColor || c.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: isMobile ? 0.7 : 1,
          }}
        >
          <Icon style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', color: iconColor || c.primary }} />
        </div>
      )}

      {/* Content */}
      <div style={{ paddingRight: isMobile ? '40px' : '50px', minWidth: 0 }}>
        <p
          style={{
            fontSize: isMobile ? '11px' : '12px',
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
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: c.textPrimary,
            margin: isMobile ? '4px 0' : '8px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </p>
        {description && (
          <p style={{ fontSize: isMobile ? '13px' : '14px', color: c.textMuted, margin: 0 }}>
            {description}
          </p>
        )}
      </div>

      {/* Growth indicator - di bagian bawah, DALAM card */}
      <div style={{ marginTop: 'auto' }}>
        {trend ? (
          <span
            style={{
              fontSize: isMobile ? '12px' : '14px',
              color: trend.isPositive ? c.success : c.error,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {trend.isPositive ? (
              <TrendingUp style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px' }} />
            ) : (
              <TrendingDown style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px' }} />
            )}
            {trend.isPositive ? '+' : ''}{trend.value}% {trendLabel}
          </span>
        ) : (
          <div style={{ height: isMobile ? '12px' : '20px' }} />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
}
