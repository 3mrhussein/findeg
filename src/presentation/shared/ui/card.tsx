import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

export const CardFooter: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>
    {children}
  </div>
);
