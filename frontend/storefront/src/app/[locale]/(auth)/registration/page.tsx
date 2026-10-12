import type { Locale } from '@findeg/domain';
import { setRequestLocale } from 'next-intl/server';
import { RegistrationContent } from './_components/RegistrationContent';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    email?: string;
    locked?: string;
    returnTo?: string;
    returnUrl?: string;
  }>;
};

/**
 * Registration Page
 */
export default async function RegistrationPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const returnTarget = query.returnUrl || query.returnTo;

  return (
    <RegistrationContent
      initialEmail={query.email}
      emailLocked={query.locked === '1'}
      returnTo={returnTarget}
    />
  );
}
