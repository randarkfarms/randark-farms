import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500',
          variant === 'secondary' && 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-brand-500',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
          variant === 'ghost' && 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-5 py-2.5 text-base',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        {!loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;