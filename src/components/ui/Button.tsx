"use client";

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  neon?: boolean;
  lift?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | false;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    neon = false,
    lift = false,
    haptic = 'medium',
    isLoading = false,
    disabled,
    onClick,
    children, 
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }
    };
    
    const isDisabled = disabled || isLoading;
    
    return (
      <button
        className={cn(
          "relative font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 touch-manipulation",
          "active:scale-[0.98] transition-transform duration-100",
          
          variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg",
          variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 rounded-lg",
          variant === 'accent' && "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80 rounded-lg",
          variant === 'outline' && "border border-input bg-transparent hover:bg-muted/50 active:bg-muted/70 rounded-lg",
          variant === 'default' && "bg-muted hover:bg-muted/80 text-foreground rounded-lg",
          variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg",
          
          size === 'sm' && "text-xs px-3 py-1.5 rounded-md",
          size === 'md' && "text-sm px-4 py-2",
          size === 'lg' && "text-base px-5 py-2.5",
          
          neon && "shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]",
          lift && !isDisabled && "hover:-translate-y-0.5 hover:shadow-md",
          
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          
          className
        )}
        ref={ref}
        onClick={handleClick}
        data-haptic={haptic || undefined}
        disabled={isDisabled}
        {...props}
      >
        <div className="flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground/80 rounded-full animate-spin"></div>
            </div>
          )}
          <div className={cn("flex items-center justify-center", isLoading && "opacity-0")}>
            {children}
          </div>
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 