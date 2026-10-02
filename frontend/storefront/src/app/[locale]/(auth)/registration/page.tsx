import { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { RegistrationContent } from './_components/RegistrationContent';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ email?: string; locked?: string; returnTo?: string }>;
};

/**
 * Registration Page
 */
export default async function RegistrationPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  return (
    <RegistrationContent
      initialEmail={query.email}
      emailLocked={query.locked === '1'}
      returnTo={query.returnTo}
    />
  );
}
