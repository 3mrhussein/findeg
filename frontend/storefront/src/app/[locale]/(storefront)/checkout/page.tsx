import { CheckoutClient } from './CheckoutClient';
import { getCheckoutPrefill } from '@/data/order/queries';
import { notFound } from 'next/navigation';
import { createSchoolSupplyListReader } from '@findeg/backend/features/school';

/**
 *
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; publicCode?: string }>;
}) {
  const query = await searchParams;
  if (query.source === 'list' && !query.publicCode) notFound();
  const [prefill, checkoutSource] = await Promise.all([
    getCheckoutPrefill(),
    query.source === 'list' && query.publicCode
      ? createSchoolSupplyListReader()
          .getByPublicCode(query.publicCode)
          .then((result) => {
            if (!result.success || result.data.status !== 'published') notFound();
            return { source: 'list' as const, publicCode: query.publicCode!, list: result.data };
          })
      : Promise.resolve({ source: 'cart' as const }),
  ]);
  return <CheckoutClient initialPrefill={prefill} checkoutSource={checkoutSource} />;
}
