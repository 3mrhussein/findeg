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
  if (getWebRuntime().enterPortal('back-office') !== 'allowed')
    redirect(`/${locale}/back-office/sign-in`);
  return children;
}
