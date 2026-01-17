import React from 'react';
import { cn } from '../../lib/utils';

// Simplified CVA (Class Variance Authority)
const buttonVariants = ({ variant, size, className }: { variant?: string, size?: string, className?: string }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<string, string> = {
    default: "bg-primary text-white shadow hover:bg-primary/90",
    destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
    outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-white shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes: Record<string, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return cn(base, variants[variant || 'default'], sizes[size || 'default'], className);
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
