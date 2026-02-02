import { PilgrimStatus, TripStatus, PILGRIM_STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PilgrimStatus | TripStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

// Enhanced colors for better visibility
const PILGRIM_STATUS_ENHANCED: Record<PilgrimStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  lead: { label: 'Lead', color: '#4B5563', bgColor: '#F3F4F6', borderColor: '#E5E7EB' },
  dp: { label: 'DP', color: '#1D4ED8', bgColor: '#DBEAFE', borderColor: '#BFDBFE' },
  lunas: { label: 'Lunas', color: '#047857', bgColor: '#D1FAE5', borderColor: '#A7F3D0' },
  dokumen: { label: 'Dokumen', color: '#0F766E', bgColor: '#CCFBF1', borderColor: '#99F6E4' },
  visa: { label: 'Visa Process', color: '#B45309', bgColor: '#FEF3C7', borderColor: '#FDE68A' },
  ready: { label: 'Ready', color: '#6D28D9', bgColor: '#EDE9FE', borderColor: '#DDD6FE' },
  departed: { label: 'Departed', color: '#C2410C', bgColor: '#FFEDD5', borderColor: '#FED7AA' },
  completed: { label: 'Completed', color: '#15803D', bgColor: '#DCFCE7', borderColor: '#BBF7D0' },
};

const TRIP_STATUS_ENHANCED: Record<TripStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  open: { label: 'Open', color: '#1D4ED8', bgColor: '#DBEAFE', borderColor: '#BFDBFE' },
  preparing: { label: 'Preparing', color: '#B45309', bgColor: '#FEF3C7', borderColor: '#FDE68A' },
  ready: { label: 'Ready', color: '#6D28D9', bgColor: '#EDE9FE', borderColor: '#DDD6FE' },
  departed: { label: 'Departed', color: '#C2410C', bgColor: '#FFEDD5', borderColor: '#FED7AA' },
  completed: { label: 'Completed', color: '#15803D', bgColor: '#DCFCE7', borderColor: '#BBF7D0' },
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
          'px-2 py-0.5 text-[11px]': size === 'sm',
          'px-2.5 py-1 text-xs': size === 'md',
          'px-3 py-1.5 text-sm': size === 'lg',
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
