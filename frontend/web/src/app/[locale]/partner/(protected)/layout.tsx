import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getWebRuntime } from '../../../../server/runtime';
import { sessionToken } from '../../../../server/session';
export default async function ProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const identity = await getWebRuntime().currentSession(await sessionToken(), 'storefront');
  if (identity.status === 'authentication-required') redirect(`/${locale}/partner/sign-in`);
  return children;
}
