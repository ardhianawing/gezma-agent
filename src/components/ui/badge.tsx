import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border',
        'transition-colors duration-200',
        {
          // Default - Gezma Red soft chip
          'bg-[#FFEBEE] text-[var(--gezma-red)] border-[#FFCDD2]':
            variant === 'default',
          // Secondary - Slate soft chip
          'bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)]':
            variant === 'secondary',
          // Success - Soft Green (Lunas/Paid style)
          'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]':
            variant === 'success',
          // Warning - Soft Yellow (Pending/DP style)
          'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]':
            variant === 'warning',
          // Error - Soft Red
          'bg-[#FEE2E2] text-[var(--error)] border-[#FECACA]':
            variant === 'error',
          // Outline
          'border-[var(--gray-200)] bg-white text-[var(--charcoal)]':
            variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
