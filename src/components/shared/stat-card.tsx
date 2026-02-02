import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
  href?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'var(--gray-600)',
  iconBgColor = 'var(--gray-100)',
  trend,
  href
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'group rounded-xl bg-white border border-[var(--gray-200)]',
        'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]',
        href && 'cursor-pointer hover:-translate-y-1 transition-all duration-200'
      )}
      style={{ padding: '20px' }}  /* 20px semua sisi - SEIMBANG */
    >
      {/* Container dengan height tetap */}
      <div className="h-[120px] flex flex-col">

        {/* ROW 1: Label + Icon (icon at TOP-RIGHT) */}
        <div className="flex justify-between items-start gap-4">
          <p className="text-xs font-medium text-[var(--gray-500)] uppercase tracking-wide">{title}</p>
          {Icon && (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: iconBgColor }}
            >
              <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </div>
          )}
        </div>

        {/* ROW 2: Value */}
        <p className="text-2xl font-bold text-[var(--charcoal)] tracking-tight truncate mt-2" title={String(value)}>
          {value}
        </p>

        {/* ROW 3: Subtitle/Description */}
        {description && (
          <p className="text-xs text-[var(--gray-500)] mt-1">{description}</p>
        )}

        {/* ROW 4: Growth indicator - pushed to bottom */}
        <div className="mt-auto">
          {trend ? (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold',
                  trend.isPositive
                    ? 'text-[var(--success)]'
                    : 'text-[var(--error)]'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-[10px] text-[var(--gray-500)] uppercase">vs last month</span>
            </div>
          ) : (
            /* Empty spacer for consistent height */
            <div className="h-4" />
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
