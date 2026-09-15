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
    <main data-portal="partner">
      <h1>{locale === 'ar' ? 'مساحة الشركاء' : 'Partner Workspace'}</h1>
      {children}
    </main>
  );
}
