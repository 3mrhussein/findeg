import { CheckoutClient } from './CheckoutClient';
import { getCheckoutPrefill } from '@/data/order/queries';

/**
 *
 */
export default async function CheckoutPage() {
  const prefill = await getCheckoutPrefill();
  return <CheckoutClient initialPrefill={prefill} />;
}
