"use client";

import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "@/providers/CartProvider";
import { UserProvider } from "@/providers/UserProvider";

/**
 *
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>{children}</CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
