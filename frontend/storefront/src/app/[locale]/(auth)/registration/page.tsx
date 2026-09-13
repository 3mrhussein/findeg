import { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { RegistrationContent } from './_components/RegistrationContent';

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * Registration Page
 */
export default async function RegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegistrationContent />;
}
