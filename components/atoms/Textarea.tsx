import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const baseStyles = "w-full p-3 rounded-md bg-background border border-border focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200";
    
    return (
      <textarea
        className={`${baseStyles} ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
