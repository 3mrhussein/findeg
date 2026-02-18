"use client";

import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "@/providers/CartProvider";
import { UserProvider } from "@/providers/UserProvider";
import { AnimationProvider } from "./animation-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

/**
 *
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AnimationProvider>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>
        </AnimationProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
