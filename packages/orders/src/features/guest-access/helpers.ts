import { GUEST_ORDER_TOKEN_SECONDS } from '../guest-access-token/constants';
import { matchesAnyHash } from '../guest-access-codes';
import {
  GuestAccessRequestSchema as guestAccessRequestSchema,
  GuestAccessVerifySchema as guestAccessVerifySchema,
} from '../guest-access-input/helpers';
import { GUEST_ACCESS_KIND, guestAccessId } from './constants';
import type {
  GuestAccessServiceOptions,
  GuestOrderView,
  RequestAccessResult,
  VerifyResult,
} from './types';

const normalizeReference = (reference: string) => reference.trim().toUpperCase();

/** Sales queries load lazily so this package's root stays free of database configuration. */
const loadQueries = () => import('@findeg/db/queries');

export class GuestAccessService {
  constructor(private readonly options: GuestAccessServiceOptions) {}

  /**
   * Always answers `{ success: true }` for well-formed input, whether or not the reference and
   * email match an Order (or the hourly limit was hit), so nobody can probe which Orders exist.
   */
  async requestAccess(input: unknown): Promise<RequestAccessResult> {
    const parsed = guestAccessRequestSchema.safeParse(input);
    if (!parsed.success) return { success: false, reason: 'invalid-input' };

    const reference = normalizeReference(parsed.data.reference);
    const email = parsed.data.email.toLowerCase();

    const { guestAccessQueries, withTransaction } = await loadQueries();
    await withTransaction(undefined, async (tx) => {
      const order = await guestAccessQueries.findGuestOrder(reference, email, tx);
      if (!order) return;
      const request = await guestAccessQueries.createRequest(order.id, tx);
      if (!request) return;
      await this.options.enqueue(tx, guestAccessId(request.id), GUEST_ACCESS_KIND, {
        accessRequestId: request.id,
      });
    });
    return { success: true };
  }

  /** A correct code consumes its whole request and yields a token that unlocks only that Order. */
  async verify(input: unknown): Promise<VerifyResult> {
    const parsed = guestAccessVerifySchema.safeParse(input);
    if (!parsed.success) return { success: false, reason: 'invalid-input' };

    const orderReference = normalizeReference(parsed.data.reference);
    const { guestAccessQueries } = await loadQueries();
    const orderId = await guestAccessQueries.findOrderIdByReference(orderReference);
    if (orderId === null) return { success: false, reason: 'invalid-code' };

    const ok = await guestAccessQueries.attemptVerification(orderId, (requestId, stored) =>
      matchesAnyHash(requestId, parsed.data.code, stored, this.options.secret()),
    );
    if (!ok) return { success: false, reason: 'invalid-code' };

    return {
      success: true,
      orderReference,
      token: await this.options.tokens.sign(orderReference),
      maxAgeSeconds: GUEST_ORDER_TOKEN_SECONDS,
    };
  }

  /** The Order named by `reference`, only if `token` was issued for that very Order. */
  async getOrder(token: string | undefined, reference: string): Promise<GuestOrderView | null> {
    const wanted = normalizeReference(reference);
    if ((await this.options.tokens.verify(token)) !== wanted) return null;

    const { guestAccessQueries, orderQueries } = await loadQueries();
    const orderId = await guestAccessQueries.findOrderIdByReference(wanted);
    const found = orderId === null ? null : await orderQueries.getById(orderId);
    if (!found) return null;

    const { order, items } = found;
    return {
      orderReference: order.orderReference,
      status: order.status,
      paymentStatus: order.paymentStatus,
      currency: order.currency,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: items.map((item) => ({
        name: item.productNameSnapshot ?? '',
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
    };
  }
}

export function createGuestAccessService(options: GuestAccessServiceOptions): GuestAccessService {
  return new GuestAccessService(options);
}
