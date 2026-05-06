import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center text-xs font-bold uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] disabled:opacity-50 disabled:pointer-events-none rounded-none border-2",
          {
            "bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-white hover:text-[#1A1A1A]": variant === 'default',
            "bg-transparent text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white": variant === 'outline',
            "border-transparent text-[#1A1A1A] hover:bg-black/5": variant === 'ghost',
            "bg-red-600 text-white border-red-600 hover:bg-white hover:text-red-600": variant === 'destructive',
            "h-12 py-3 px-6": size === 'default',
            "h-9 px-4 text-[10px]": size === 'sm',
            "h-14 px-8 text-sm": size === 'lg',
            "h-12 w-12": size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
