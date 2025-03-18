"use client";

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  neon?: boolean;
  lift?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | false;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    neon = false,
    lift = false,
    haptic = 'medium',
    onClick,
    children, 
    ...props 
  }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <button
        className={cn(
          "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50",
          
          variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === 'accent' && "bg-accent text-accent-foreground hover:bg-accent/90",
          variant === 'outline' && "border border-input bg-transparent hover:bg-secondary/50",
          variant === 'default' && "bg-secondary hover:bg-secondary/80",
          
          size === 'sm' && "text-xs px-2 py-1",
          size === 'md' && "text-sm px-3 py-2",
          size === 'lg' && "text-base px-4 py-2.5",
          
          neon && "btn-neon",
          lift && "hover-lift",
          
          className
        )}
        ref={ref}
        onClick={handleClick}
        data-haptic={haptic || undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 