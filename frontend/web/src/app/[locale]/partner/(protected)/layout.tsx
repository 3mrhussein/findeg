import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getWebRuntime } from '../../../../server/runtime';
export default async function ProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (getWebRuntime().enterPortal('partner') !== 'allowed') redirect(`/${locale}/partner/sign-in`);
  return children;
}
