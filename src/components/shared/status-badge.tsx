import { PilgrimStatus, TripStatus, PILGRIM_STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PilgrimStatus | TripStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const TRIP_STATUS_CONFIG: Record<TripStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: '#3B82F6', bgColor: '#DBEAFE' },
  preparing: { label: 'Preparing', color: '#F59E0B', bgColor: '#FEF3C7' },
  ready: { label: 'Ready', color: '#8B5CF6', bgColor: '#EDE9FE' },
  departed: { label: 'Departed', color: '#F97316', bgColor: '#FFEDD5' },
  completed: { label: 'Completed', color: '#22C55E', bgColor: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: '#FEE2E2' },
};

export function StatusBadge({ status, size = 'md', showDot = false, className }: StatusBadgeProps) {
  const config = PILGRIM_STATUS_CONFIG[status as PilgrimStatus] || TRIP_STATUS_CONFIG[status as TripStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[8px] font-medium',
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
      }}
    >
      {showDot && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      )}
      {config.label}
    </span>
  );
}
