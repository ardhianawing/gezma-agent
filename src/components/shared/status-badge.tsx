import { PilgrimStatus, TripStatus, PILGRIM_STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PilgrimStatus | TripStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
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

export function StatusBadge({ status, size = 'md', showDot = true, className }: StatusBadgeProps) {
  const config = PILGRIM_STATUS_ENHANCED[status as PilgrimStatus] || TRIP_STATUS_ENHANCED[status as TripStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        'transition-all duration-150',
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
          'px-3 py-1.5 text-base': size === 'lg',
        },
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.borderColor,
      }}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            {
              'h-1.5 w-1.5': size === 'sm',
              'h-2 w-2': size === 'md',
              'h-2.5 w-2.5': size === 'lg',
            }
          )}
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}
