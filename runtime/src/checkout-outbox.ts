import { checkoutOutbox } from '@findeg/db/modules/runtime';
import type { TransactionDatabase } from '@findeg/db/transactions';
import type { CheckoutStores } from '@findeg/backend/checkout';

export function bindCheckoutOutbox(database: TransactionDatabase): CheckoutStores['outbox'] {
  return {
    async enqueue(id, kind, payload) {
      await database.insert(checkoutOutbox).values({ id, kind, payload });
    },
  };
}
