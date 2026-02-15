import React from "react";

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive grid layout.
 */
export const Grid: React.FC<GridProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 ${className}`}
    >
      {children}
    </div>
  );
};
