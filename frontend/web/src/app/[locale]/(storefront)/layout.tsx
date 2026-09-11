import type { ReactNode } from 'react';
import { getWebRuntime } from '../../../server/runtime';
export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  await getWebRuntime().enterPortal('storefront');
  return <main data-portal="storefront">{children}</main>;
}
