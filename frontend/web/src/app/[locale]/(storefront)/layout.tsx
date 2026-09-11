import type { ReactNode } from 'react';
import { getWebRuntime } from '../../../server/runtime';
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  getWebRuntime().enterPortal('storefront');
  return <main data-portal="storefront">{children}</main>;
}
