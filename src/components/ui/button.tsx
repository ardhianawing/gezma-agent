import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gezma-red)] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          {
            // Primary - Gezma Red
            'bg-[var(--gezma-red)] text-white shadow-sm hover:bg-[var(--gezma-red-hover)] hover:shadow-md':
              variant === 'default',
            // Destructive
            'bg-[var(--error)] text-white shadow-sm hover:bg-[var(--error-dark)] hover:shadow-md':
              variant === 'destructive',
            // Outline
            'border border-[var(--gray-200)] bg-white text-[var(--charcoal)] hover:bg-[var(--gray-50)] hover:border-[var(--gray-300)]':
              variant === 'outline',
            // Secondary
            'bg-[var(--gray-100)] text-[var(--charcoal)] hover:bg-[var(--gray-200)]':
              variant === 'secondary',
            // Ghost
            'text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)]':
              variant === 'ghost',
            // Link
            'text-[var(--gezma-red)] underline-offset-4 hover:underline':
              variant === 'link',
          },
          {
            'h-11 px-5 py-2.5 text-sm': size === 'default',
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
