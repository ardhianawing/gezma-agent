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
    <Card className={cn(
      'group overflow-hidden',
      href && 'cursor-pointer hover:-translate-y-1 transition-all duration-200'
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--gray-500)]">{title}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--charcoal)] tracking-tight">{value}</p>
            {description && (
              <p className="mt-1 text-sm text-[var(--gray-500)]">{description}</p>
            )}
            {trend && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                    trend.isPositive
                      ? 'bg-[var(--success-light)] text-[var(--success)]'
                      : 'bg-[var(--error-light)] text-[var(--error)]'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-[var(--gray-500)]">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110"
              style={{ backgroundColor: iconBgColor }}
            >
              <Icon className="h-6 w-6" style={{ color: iconColor }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
