import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    const baseStyles = "w-full p-3 rounded-md bg-background border border-border focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200";
    
    return (
      <input
        type={type}
        className={`${baseStyles} ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
