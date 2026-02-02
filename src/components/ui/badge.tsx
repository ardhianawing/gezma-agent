import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
        'transition-colors duration-150',
        {
          'bg-[var(--gezma-red-light)] text-[var(--gezma-red)] border-[var(--gezma-red-light)]':
            variant === 'default',
          'bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)]':
            variant === 'secondary',
          'bg-[var(--success-light)] text-[var(--success)] border-[#A7F3D0]':
            variant === 'success',
          'bg-[var(--warning-light)] text-[var(--warning)] border-[#FDE68A]':
            variant === 'warning',
          'bg-[var(--error-light)] text-[var(--error)] border-[#FECACA]':
            variant === 'error',
          'border-[var(--gray-300)] bg-white text-[var(--charcoal)]':
            variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
