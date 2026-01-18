'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider } from './I18nProvider';
import { CartProvider } from '@/presentation/features/cart/providers/CartProvider';
import { UserProvider } from '@/presentation/features/user/providers/UserProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <UserProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </UserProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
