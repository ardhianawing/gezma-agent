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
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gezma-red)] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          {
            // Primary - with gradient for premium feel
            'bg-gradient-to-b from-[var(--gezma-red)] to-[var(--gezma-red-hover)] text-white shadow-[var(--shadow-sm)] hover:from-[var(--gezma-red-hover)] hover:to-[var(--gezma-red-pressed)] hover:shadow-[var(--shadow-md)]':
              variant === 'default',
            // Destructive
            'bg-gradient-to-b from-[var(--error)] to-[var(--error-dark)] text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]':
              variant === 'destructive',
            // Outline
            'border-2 border-[var(--gray-200)] bg-white text-[var(--charcoal)] shadow-[var(--shadow-xs)] hover:bg-[var(--gray-50)] hover:border-[var(--gray-300)]':
              variant === 'outline',
            // Secondary
            'bg-[var(--gray-100)] text-[var(--charcoal)] hover:bg-[var(--gray-200)]':
              variant === 'secondary',
            // Ghost
            'text-[var(--gray-700)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)]':
              variant === 'ghost',
            // Link
            'text-[var(--gezma-red)] underline-offset-4 hover:underline':
              variant === 'link',
          },
          {
            'h-10 px-5 py-2 text-sm': size === 'default',
            'h-8 px-3 text-xs rounded-md': size === 'sm',
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
