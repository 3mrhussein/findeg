"use client";

import { CartProvider } from "./CartProvider";
import { UserProvider } from "./UserProvider";
import { AnimationProvider } from "./animation-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@ui";

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
