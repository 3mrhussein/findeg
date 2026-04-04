"use client";

import { ThemeProvider } from "./ThemeProvider";
import { AnimationProvider } from "./animation-provider";
import { TooltipProvider } from "@findeg/ui";

/**
 * Base Providers wrapper (backend package)
 * Note: CartProvider, UserProvider, and NuqsAdapter should be added in app-specific provider files
 * in dashboard/storefront packages, not here in the shared backend package.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
