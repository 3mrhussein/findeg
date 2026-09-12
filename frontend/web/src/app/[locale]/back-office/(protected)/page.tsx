import Link from 'next/link';
export default async function PortalHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Link href={`/${locale}/back-office/partners`}>
      {locale === 'ar' ? 'إدارة الشركاء' : 'Manage partners'}
    </Link>
  );
}
