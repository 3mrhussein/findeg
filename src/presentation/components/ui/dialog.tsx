import React from "react";

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string; // Added className
}

interface DialogTitleProps {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ children }) => (
  <>{children}</>
);

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => <>{children}</>;

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = "" }) => (
  <div className={`relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg ${className}`}>
    {children}
  </div>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
    {children}
  </div>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <h3 className="text-lg font-semibold leading-none tracking-tight">
    {children}
  </h3>
);

export const DialogDescription: React.FC<DialogTitleProps> = ({ children }) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
);

export const DialogFooter: React.FC<DialogTitleProps> = ({ children }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
    {children}
  </div>
);
