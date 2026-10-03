import { guestAccessQueries, orderQueries, withTransaction } from '@findeg/db/queries';
import { enqueue } from '../../outbox/application/enqueue';
import { GUEST_ACCESS_KIND, guestAccessId } from '../../outbox/domain/types';
import { matchesAnyHash } from '../domain/codes';
import {
  GUEST_ORDER_TOKEN_SECONDS,
  signGuestOrderToken,
  verifyGuestOrderToken,
} from '../domain/token';
import { GuestAccessRequestSchema, GuestAccessVerifySchema, type GuestOrderView } from '../schemas';

const normalizeReference = (reference: string) => reference.trim().toUpperCase();

export type RequestAccessResult = { success: true } | { success: false; reason: 'invalid-input' };
export type VerifyResult =
  | { success: true; orderReference: string; token: string; maxAgeSeconds: number }
  | { success: false; reason: 'invalid-input' | 'invalid-code' };

export class GuestAccessService {
  /**
   * Always answers `{ success: true }` for well-formed input, whether or not the reference and
   * email match an Order (or the hourly limit was hit), so nobody can probe which Orders exist.
   */
  async requestAccess(input: unknown): Promise<RequestAccessResult> {
    const parsed = GuestAccessRequestSchema.safeParse(input);
    if (!parsed.success) return { success: false, reason: 'invalid-input' };

    const reference = normalizeReference(parsed.data.reference);
    const email = parsed.data.email.toLowerCase();

    await withTransaction(undefined, async (tx) => {
      const order = await guestAccessQueries.findGuestOrder(reference, email, tx);
      if (!order) return;
      const request = await guestAccessQueries.createRequest(order.id, tx);
      if (!request) return;
      await enqueue(tx, guestAccessId(request.id), GUEST_ACCESS_KIND, {
        accessRequestId: request.id,
      });
    });
    return { success: true };
  }

  /** A correct code consumes its whole request and yields a token that unlocks only that Order. */
  async verify(input: unknown): Promise<VerifyResult> {
    const parsed = GuestAccessVerifySchema.safeParse(input);
    if (!parsed.success) return { success: false, reason: 'invalid-input' };

    const orderReference = normalizeReference(parsed.data.reference);
    const orderId = await guestAccessQueries.findOrderIdByReference(orderReference);
    if (orderId === null) return { success: false, reason: 'invalid-code' };

    const ok = await guestAccessQueries.attemptVerification(orderId, (requestId, stored) =>
      matchesAnyHash(requestId, parsed.data.code, stored),
    );
    if (!ok) return { success: false, reason: 'invalid-code' };

    return {
      success: true,
      orderReference,
      token: await signGuestOrderToken(orderReference),
      maxAgeSeconds: GUEST_ORDER_TOKEN_SECONDS,
    };
  }

  /** The Order named by `reference`, only if `token` was issued for that very Order. */
  async getOrder(token: string | undefined, reference: string): Promise<GuestOrderView | null> {
    const wanted = normalizeReference(reference);
    if ((await verifyGuestOrderToken(token)) !== wanted) return null;

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
