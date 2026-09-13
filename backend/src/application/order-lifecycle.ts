import type { TransactionRunner } from './transactions.js';
import {
  createIdentityAccess,
  type SessionStore,
  type SessionSecurity,
} from '@findeg/backend/modules/identity-access/public';
import type { OrderLifecycleStore } from '@findeg/backend/modules/commerce/public';
import type { OrderLifecycleReceipt } from '@findeg/backend/modules/commerce/contracts';
import type { InventoryFulfillment } from '@findeg/backend/modules/inventory/public';
import type { DurablePartnerRewardStore } from '@findeg/backend/modules/partner-rewards/public';

interface LifecycleStores {
  identity: SessionStore;
  orderLifecycle: OrderLifecycleStore;
  fulfillment: InventoryFulfillment;
  rewards: DurablePartnerRewardStore;
}
export function createOrderLifecycle(
  transactions: TransactionRunner<LifecycleStores>,
  security: SessionSecurity,
) {
  async function run<T extends { status: string }>(
    action: (stores: LifecycleStores) => Promise<T>,
  ): Promise<T> {
    const outcome = await transactions.run<T, T>(async (stores) => {
      const value = await action(stores);
      // Authorization refresh survives denied operations; commercial rejections roll back all writes.
      return [
        'found',
        'delivered',
        'paid',
        'authentication-required',
        'authorization-denied',
      ].includes(value.status)
        ? { ok: true, value }
        : { ok: false, error: value };
    });
    return outcome.ok ? outcome.value : outcome.error;
  }
  async function record(
    token: string | undefined,
    reference: string,
    input: unknown,
    operation: 'delivery' | 'payment',
  ) {
    return run(async (stores) => {
      const access = await createIdentityAccess(stores.identity, security).authorize(
        token,
        'back-office',
        operation === 'delivery' ? 'fulfillment.manage' : 'finance.manage',
      );
      if (access.status !== 'authenticated') return access;
      if (
        !/^[a-f0-9]{64}$/.test(reference) ||
        !input ||
        typeof input !== 'object' ||
        !('key' in input) ||
        typeof input.key !== 'string' ||
        !/^[a-zA-Z0-9_-]{1,128}$/.test(input.key)
      )
        return { status: 'invalid-input' } as const;
      if (
        Object.keys(input).some(
          (key) => !['key', ...(operation === 'payment' ? ['amount'] : [])].includes(key),
        )
      )
        return { status: 'invalid-input' } as const;
      const amount = 'amount' in input ? input.amount : undefined;
      if (
        operation === 'payment' &&
        (typeof amount !== 'string' || !/^(0|[1-9]\d{0,15})\.\d{2}$/.test(amount))
      )
        return { status: 'invalid-input' } as const;
      const fingerprint = security.digest(JSON.stringify({ reference, amount }));
      const saved = await stores.orderLifecycle.outcome(
        access.session.userId,
        operation,
        input.key,
      );
      if (saved)
        return saved.fingerprint === fingerprint
          ? saved.result
          : ({ status: 'idempotency-conflict' } as const);
      const order = await stores.orderLifecycle.lockOrder(reference);
      if (!order) return { status: 'not-found' } as const;
      const state = await stores.orderLifecycle.state(order);
      if (operation === 'delivery') {
        if (state.fulfillmentStatus === 'delivered')
          return { status: 'already-delivered' } as const;
        if (!(await stores.fulfillment.deliver(reference, access.session.userId)))
          return { status: 'reservation-unavailable' } as const;
        await stores.orderLifecycle.recordEvent(reference, 'delivered', access.session.userId);
      } else {
        if (state.fulfillmentStatus !== 'delivered')
          return { status: 'delivery-required' } as const;
        if (state.paymentStatus === 'paid') return { status: 'already-paid' } as const;
        if (amount !== order.total) return { status: 'amount-mismatch' } as const;
        await stores.orderLifecycle.recordEvent(
          reference,
          'paid',
          access.session.userId,
          order.total,
        );
        await stores.rewards.earnDeliveredOrder(reference, access.session.userId);
      }
      const result: OrderLifecycleReceipt = {
        status: operation === 'delivery' ? 'delivered' : 'paid',
        state: await stores.orderLifecycle.state(order),
      };
      await stores.orderLifecycle.saveOutcome(
        access.session.userId,
        operation,
        input.key,
        fingerprint,
        result,
      );
      return result;
    });
  }
  return {
    deliver: (token: string | undefined, reference: string, input: unknown) =>
      record(token, reference, input, 'delivery'),
    pay: (token: string | undefined, reference: string, input: unknown) =>
      record(token, reference, input, 'payment'),
    read: (token: string | undefined, reference: string) =>
      run(async (stores) => {
        const access = await createIdentityAccess(stores.identity, security).currentSession(
          token,
          'back-office',
        );
        if (access.status !== 'authenticated') return access;
        if (
          !access.session.permissions.some(
            (permission) => permission === 'fulfillment.manage' || permission === 'finance.manage',
          )
        )
          return { status: 'authorization-denied', session: access.session } as const;
        if (!/^[a-f0-9]{64}$/.test(reference)) return { status: 'invalid-input' } as const;
        const order = await stores.orderLifecycle.lockOrder(reference);
        return order
          ? ({ status: 'found', state: await stores.orderLifecycle.state(order) } as const)
          : ({ status: 'not-found' } as const);
      }),
  };
}
