import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  href?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, href }: StatCardProps) {
  const content = (
    <Card className={cn(href && 'cursor-pointer transition-shadow hover:shadow-[var(--shadow-md)]')}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--gray-600)]">{title}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--charcoal)]">{value}</p>
            {description && <p className="mt-1 text-sm text-[var(--gray-600)]">{description}</p>}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-sm text-[var(--gray-600)]">from last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--gray-100)]">
              <Icon className="h-6 w-6 text-[var(--gray-600)]" />
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
