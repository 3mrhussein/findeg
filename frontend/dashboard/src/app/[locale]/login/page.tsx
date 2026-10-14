import { LOCALES } from '@findeg/domain';
import { setRequestLocale } from 'next-intl/server';
import { LoginForm } from './_components/LoginForm';

/**
 * Generate static params for supported locales
 */
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Admin Login Page — /admin/login
 *
 * Renders inside the passthrough layout without the admin shell,
 * providing a localized credentials form with RTL support and translated errors.
 */
export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm locale={locale} />
    </div>
  );
}
