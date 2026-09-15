import type { ReactNode } from 'react';
export default async function PortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main data-portal="back-office">
      <h1>{locale === 'ar' ? 'إدارة فايند إيجي' : 'FindEg Back Office'}</h1>
      {children}
    </main>
  );
}
