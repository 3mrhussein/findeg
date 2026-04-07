import { CheckoutClient } from "./CheckoutClient";
import { getCheckoutPrefill } from "@features/order/application/queries/checkout-prefill";

/**
 *
 */
export default async function CheckoutPage() {
  const prefill = await getCheckoutPrefill();
  return <CheckoutClient initialPrefill={prefill} />;
}
