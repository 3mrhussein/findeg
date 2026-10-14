'use client';

import { AnimationProvider } from './animation-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { TooltipProvider } from '@findeg/ui';

/**
 * Global dashboard providers
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <TooltipProvider>
        <AnimationProvider>{children}</AnimationProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );
}
