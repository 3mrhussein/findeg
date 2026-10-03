import { Container } from '@findeg/ui';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from 'next-intl';
import { OrderCodeForm } from './OrderCodeForm';

interface OrderCodePageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ reference?: string }>;
}

export default async function OrderCodePage({ params, searchParams }: OrderCodePageProps) {
  const { locale } = await params;
  const { reference } = await searchParams;
  setRequestLocale(locale);

  return (
    <main className="bg-background py-10 md:py-14">
      <Container className="max-w-md">
        <OrderCodeForm initialReference={reference ?? ''} />
      </Container>
    </main>
  );
}
