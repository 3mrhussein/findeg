import Link from 'next/link';
import { StorefrontShopping } from './StorefrontShopping';

export default async function Storefront({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <h1>{locale === 'ar' ? 'متجر العملاء' : 'Customer Storefront'}</h1>
      <p>{locale === 'ar' ? 'مرحبًا بك في فايند إيجي.' : 'Welcome to FindEg.'}</p>
      <Link href={`/${locale}/lists`}>
        {locale === 'ar' ? 'افتح قائمة المدرسة' : 'Open a school list'}
      </Link>
      <StorefrontShopping locale={locale === 'ar' ? 'ar' : 'en'} />
    </>
  );
}
