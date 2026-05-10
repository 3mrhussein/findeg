import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { OrdersContent } from './_components/OrdersContent';
import { routing } from '@i18n/routing';

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Admin Orders List Page
 */
export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as any);
  const query = await searchParams;

  const filters = {
    page: Number(query.page) > 0 ? Number(query.page) : 1,
    limit: Number(query.limit) > 0 ? Number(query.limit) : 20,
    search: query.search?.trim() || '',
    status: query.status,
    paymentStatus: query.paymentStatus,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
  };

  return (
    <div className="flex-1 space-y-6">
      <Suspense fallback={<div className="animate-pulse bg-gray-50 h-96 rounded-lg" />}>
        <OrdersContent locale={locale} filters={filters as any} />
      </Suspense>
    </div>
  );
}
