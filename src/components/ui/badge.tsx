import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[8px] px-2.5 py-0.5 text-xs font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        {
          'bg-[var(--gezma-red-light)] text-[var(--gezma-red)]': variant === 'default',
          'bg-[var(--gray-100)] text-[var(--gray-600)]': variant === 'secondary',
          'bg-[var(--success-light)] text-[var(--success)]': variant === 'success',
          'bg-[var(--warning-light)] text-[var(--warning)]': variant === 'warning',
          'bg-[var(--error-light)] text-[var(--error)]': variant === 'error',
          'border border-[var(--gray-border)] text-[var(--charcoal)]': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
