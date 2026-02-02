'use client';

import { PilgrimStatus, TripStatus } from '@/types';

interface StatusBadgeProps {
  status: PilgrimStatus | TripStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

// Soft Chip Colors - Platinum Design System
const PILGRIM_STATUS_ENHANCED: Record<PilgrimStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  lead: { label: 'Lead', color: '#475569', bgColor: '#F1F5F9', borderColor: '#E2E8F0' },
  dp: { label: 'DP', color: '#854D0E', bgColor: '#FEF9C3', borderColor: '#FEF08A' },
  lunas: { label: 'Lunas', color: '#166534', bgColor: '#DCFCE7', borderColor: '#BBF7D0' },
  dokumen: { label: 'Dokumen', color: '#115E59', bgColor: '#CCFBF1', borderColor: '#99F6E4' },
  visa: { label: 'Visa Process', color: '#854D0E', bgColor: '#FEF9C3', borderColor: '#FEF08A' },
  ready: { label: 'Ready', color: '#5B21B6', bgColor: '#EDE9FE', borderColor: '#DDD6FE' },
  departed: { label: 'Departed', color: '#9A3412', bgColor: '#FFEDD5', borderColor: '#FED7AA' },
  completed: { label: 'Completed', color: '#166534', bgColor: '#DCFCE7', borderColor: '#BBF7D0' },
};

const TRIP_STATUS_ENHANCED: Record<TripStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  open: { label: 'Open', color: '#1E40AF', bgColor: '#DBEAFE', borderColor: '#BFDBFE' },
  preparing: { label: 'Preparing', color: '#854D0E', bgColor: '#FEF9C3', borderColor: '#FEF08A' },
  ready: { label: 'Ready', color: '#5B21B6', bgColor: '#EDE9FE', borderColor: '#DDD6FE' },
  departed: { label: 'Departed', color: '#9A3412', bgColor: '#FFEDD5', borderColor: '#FED7AA' },
  completed: { label: 'Completed', color: '#166534', bgColor: '#DCFCE7', borderColor: '#BBF7D0' },
  cancelled: { label: 'Cancelled', color: '#B91C1C', bgColor: '#FEE2E2', borderColor: '#FECACA' },
};

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const config = PILGRIM_STATUS_ENHANCED[status as PilgrimStatus] || TRIP_STATUS_ENHANCED[status as TripStatus];

  if (!config) return null;

  const sizeStyles = {
    sm: { fontSize: '11px', padding: '4px 0', minWidth: '95px', dotSize: '6px' },
    md: { fontSize: '12px', padding: '6px 0', minWidth: '105px', dotSize: '8px' },
    lg: { fontSize: '14px', padding: '8px 0', minWidth: '115px', dotSize: '10px' },
  };

  const currentSize = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        minWidth: currentSize.minWidth,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: '600',
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '9999px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
      }}
    >
      {showDot && (
        <span
          style={{
            width: currentSize.dotSize,
            height: currentSize.dotSize,
            borderRadius: '50%',
            backgroundColor: config.color,
            flexShrink: 0,
          }}
        />
      )}
      {config.label}
    </span>
  );
}
