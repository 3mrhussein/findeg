import React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, tip, side = 'right', className }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-4',
  };
  
  return (
    <div className={cn('relative group', className)}>
      {children}
      <div
        className={cn(
          'absolute bg-foreground text-background text-xs font-semibold rounded-md px-2 py-1',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'whitespace-nowrap pointer-events-none z-50',
          positionClasses[side]
        )}
      >
        {tip}
      </div>
    </div>
  );
};
