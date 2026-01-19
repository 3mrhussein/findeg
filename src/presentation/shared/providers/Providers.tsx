'use client';

import { ThemeProvider } from './ThemeProvider';
import { CartProvider } from '@/presentation/features/cart/providers/CartProvider';
import { UserProvider } from '@/presentation/features/user/providers/UserProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
