import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[12px] font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[var(--gezma-red)] text-white hover:bg-[var(--gezma-red-hover)] active:bg-[var(--gezma-red-pressed)]':
              variant === 'default',
            'bg-[var(--error)] text-white hover:bg-[var(--error)]/90': variant === 'destructive',
            'border border-[var(--gray-border)] bg-white hover:bg-[var(--gray-100)] text-[var(--charcoal)]':
              variant === 'outline',
            'hover:bg-[var(--gray-100)] text-[var(--charcoal)]': variant === 'ghost',
            'text-[var(--gezma-red)] underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-9 px-3 text-xs': size === 'sm',
            'h-11 px-8 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
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
