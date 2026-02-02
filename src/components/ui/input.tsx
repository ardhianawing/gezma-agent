import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-[var(--gray-300)] bg-white px-3.5 py-2 text-sm',
        'text-[var(--charcoal)]',
        'placeholder:text-[var(--gray-400)]',
        'transition-all duration-150',
        'hover:border-[var(--gray-400)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gezma-red)] focus-visible:ring-offset-1 focus-visible:border-[var(--gezma-red)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--gray-100)]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
