import { Container } from '@findeg/ui';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from 'next-intl';
import { OrderLookupForm } from './OrderLookupForm';

interface OrderLookupPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function OrderLookupPage({ params }: OrderLookupPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-background py-10 md:py-14">
      <Container className="max-w-md">
        <OrderLookupForm />
      </Container>
    </main>
  );
}
