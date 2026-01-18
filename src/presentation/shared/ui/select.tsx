import React from "react";

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, value, onValueChange }) => (
  <div className="relative">
    {React.Children.map(children, (child) =>
      React.isValidElement(child) 
        ? React.cloneElement(child as React.ReactElement<any>, { value, onValueChange })
        : child
    )}
  </div>
);

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = "" }) => (
  <button className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
    {children}
  </button>
);

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => (
  <span className="text-muted-foreground">{placeholder}</span>
);

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => (
  <div className="absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
    {children}
  </div>
);

export const SelectItem: React.FC<SelectItemProps> = ({ children }) => (
  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
    {children}
  </div>
);
