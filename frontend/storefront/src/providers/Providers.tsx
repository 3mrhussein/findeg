'use client';

import { CartProvider } from './CartProvider';
import { UserProvider } from './UserProvider';
import { AnimationProvider } from './animation-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { TooltipProvider } from '@findeg/ui';
import { ThemeProvider } from './ThemeProvider';

/**
 *
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>
        <TooltipProvider>
          <AnimationProvider>
            <UserProvider>
              <CartProvider>{children}</CartProvider>
            </UserProvider>
          </AnimationProvider>
        </TooltipProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
