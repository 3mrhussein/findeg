import { StorefrontShopping } from '../../StorefrontShopping';
export default async function ListShopping({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  return (
    <>
      <h1>{locale === 'ar' ? 'قائمة المستلزمات المدرسية' : 'School Supply List'}</h1>
      <StorefrontShopping key={code} locale={locale === 'ar' ? 'ar' : 'en'} listCode={code} />
    </>
  );
}
