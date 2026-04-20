"use client";

import { CartProvider } from "@providers/CartProvider";
import { UserProvider } from "@providers/UserProvider";
import { AnimationProvider } from "./animation-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@findeg/ui";

/**
 *
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <TooltipProvider>
        <AnimationProvider>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>
        </AnimationProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );
}
