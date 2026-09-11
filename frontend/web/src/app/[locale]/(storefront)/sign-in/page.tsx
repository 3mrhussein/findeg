import { SignInForm } from '../../../../server/sign-in';
export default async function SignIn({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  const { locale } = await params;
  return (
    <SignInForm locale={locale} portal="storefront" failed={(await searchParams).failed === '1'} />
  );
}
