import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@findeg/db/connection';
import { products, productVariants } from '@findeg/db/schema';
import {
  orderQueries,
  reserveOrderStock,
  InsufficientStockError,
  checkoutIdempotencyQueries,
} from '@findeg/db/queries';
import { computeConfirmation } from '../../domain/confirmation';
import { computeOrderFingerprint } from '../../domain/fingerprint';
import { onOrderAcceptedRewardsHook } from '../../domain/rewards-hook';
import { UnavailableVariantError, ReconfirmationRequiredError } from '../../domain/errors';
import {
  CheckoutOrderSchema,
  CheckoutValidateSchema,
  type CheckoutOrderInput,
  type CheckoutOrderContext,
  type CheckoutQuote,
  type CheckoutQuoteLine,
  type CheckoutValidateInput,
  type CheckoutReceipt,
} from '../../schemas';
import type {
  CheckoutAcceptResult,
  CheckoutValidateResult,
  ICheckoutService,
} from '../interfaces/ICheckoutService';

export interface CheckoutServiceOptions {
  shippingFee?: number;
}

export const DEFAULT_FLAT_SHIPPING_FEE = 50;

export class CheckoutService implements ICheckoutService {
  private readonly shippingFee: number;

  constructor(options?: CheckoutServiceOptions) {
    this.shippingFee =
      options?.shippingFee ??
      (process.env.CHECKOUT_FLAT_SHIPPING_FEE
        ? Number(process.env.CHECKOUT_FLAT_SHIPPING_FEE)
        : DEFAULT_FLAT_SHIPPING_FEE);
  }

  async validate(input: CheckoutValidateInput): Promise<CheckoutValidateResult> {
    const parsed = CheckoutValidateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'validation-error',
          message: parsed.error.issues[0]?.message || 'Invalid checkout validation input',
        },
      };
    }

    try {
      const { quote } = await this.calculateQuote(parsed.data.lines);
      return { success: true, data: quote };
    } catch (err: unknown) {
      if (err instanceof UnavailableVariantError) {
        return {
          success: false,
          status: 400,
          error: {
            code: 'unavailable-variant',
            message: err.message,
          },
        };
      }
      throw err;
    }
  }

  async accept(
    input: CheckoutOrderInput,
    context?: CheckoutOrderContext,
  ): Promise<CheckoutAcceptResult> {
    if (!input || typeof input !== 'object') {
      return {
        success: false,
        status: 400,
        error: {
          code: 'validation-error',
          message: 'Invalid checkout order input',
        },
      };
    }

    // Check payment method before parsing to return specific error if not COD
    if (input.paymentMethod !== 'cod') {
      return {
        success: false,
        status: 400,
        error: {
          code: 'unsupported-payment-method',
          message: 'Only Cash on Delivery (cod) is accepted',
        },
      };
    }

    // Signed-in orders ignore guestEmail entirely, so drop it before it can fail validation
    const parsed = CheckoutOrderSchema.safeParse(
      context?.userId ? { ...input, guestEmail: undefined } : input,
    );
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'validation-error',
          message: parsed.error.issues[0]?.message || 'Invalid checkout order input',
        },
      };
    }

    const effectiveUserId = context?.userId;
    const guestEmail = parsed.data.guestEmail?.trim()?.toLowerCase();

    if (!effectiveUserId && !guestEmail) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'validation-error',
          message: 'Either a signed-in session or guestEmail must be provided',
        },
      };
    }

    // Header-only (ADR-0005): the key is never read from the request body.
    const idempotencyKey = context?.idempotencyKey?.trim();

    if (!idempotencyKey) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'missing-idempotency-key',
          message: 'Idempotency-Key is required',
        },
      };
    }

    if (idempotencyKey.length > 255) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'invalid-idempotency-key',
          message: 'Idempotency-Key must not exceed 255 characters',
        },
      };
    }

    const guestId = context?.guestId?.trim();
    if (guestId && guestId.length > 200) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'invalid-guest-id',
          message: 'Guest ID must not exceed 200 characters',
        },
      };
    }

    // Scope hierarchy per ADR-0005:
    // - Authenticated customer: `user:<userId>`
    // - Guest customer with client session token (e.g. storefront X-Guest-Id): `guest:<guestId>`
    // - Guest fallback when token omitted (e.g. direct API callers / automated tests): `guest:<guestEmail>`
    const guestScopeId = guestId || guestEmail;
    const scope = effectiveUserId ? `user:${effectiveUserId}` : `guest:${guestScopeId}`;

    if (scope.length > 255) {
      return {
        success: false,
        status: 400,
        error: {
          code: 'invalid-guest-id',
          message: 'Guest identifier is too long',
        },
      };
    }

    const { lines, confirmation, address } = parsed.data;

    const fingerprint = computeOrderFingerprint({
      lines,
      address,
      paymentMethod: parsed.data.paymentMethod,
      deliveryMethod: parsed.data.deliveryMethod,
      confirmation,
      guestEmail: effectiveUserId ? undefined : guestEmail,
    });

    // Check saved outcome before any re-quote (ADR-0005)
    const existing = await checkoutIdempotencyQueries.findByScopeAndKey(scope, idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return {
          success: false,
          status: 409,
          error: {
            code: 'idempotency-conflict',
            message: 'Idempotency conflict: payload does not match original request',
          },
        };
      }
      if (existing.response) {
        return {
          success: true,
          status: 201,
          data: existing.response,
        };
      }
    }

    try {
      return await db.transaction(async (tx) => {
        // 1. Insert idempotency row first inside acceptance transaction so concurrent retries serialize
        const idempotencyRow = await checkoutIdempotencyQueries.createInitial(
          {
            scope,
            key: idempotencyKey,
            fingerprint,
          },
          tx,
        );

        // 2. Re-quote authoritatively under FOR SHARE locks (ordered by variant ID to prevent deadlocks)
        const { quote: freshQuote, variantMap } = await this.calculateQuote(lines, tx);

        // 3. Price confirmation check
        if (freshQuote.confirmation !== confirmation) {
          throw new ReconfirmationRequiredError(freshQuote);
        }

        // 4. Create the Order and Order Items (reuses variantMap without redundant second query)
        const { order, items } = await orderQueries.create(
          {
            userId: effectiveUserId,
            guestEmail: effectiveUserId ? undefined : guestEmail,
            status: 'pending',
            paymentStatus: 'unpaid',
            subtotal: freshQuote.subtotal.toFixed(2),
            shippingCost: freshQuote.shipping.toFixed(2),
            totalAmount: freshQuote.total.toFixed(2),
            currency: freshQuote.currency,
            paymentMethod: 'cod',
            shippingAddressSnapshot: address,
            items: freshQuote.lines.map((line) => {
              const meta = variantMap.get(line.variantId);
              if (!meta || !meta.productId || !meta.sku) {
                throw new Error(
                  `Catalog metadata missing or incomplete for variant ${line.variantId}`,
                );
              }
              const productName =
                (meta.productName as Record<string, string>)?.en ||
                (meta.productName as Record<string, string>)?.ar ||
                '';
              return {
                productId: meta.productId,
                variantId: line.variantId,
                quantity: line.quantity,
                unitPriceSnapshot: line.unitPrice.toFixed(2),
                totalPrice: line.lineTotal.toFixed(2),
                productNameSnapshot: productName,
                productSkuSnapshot: meta.sku,
                variantSkuSnapshot: meta.sku,
                variantSnapshot: (meta.localizedLabel as Record<string, unknown>) ?? {},
              };
            }),
          },
          tx,
        );

        // 5. Reserve stock inside the same transaction (throws InsufficientStockError on shortfall)
        await reserveOrderStock(
          order.id,
          lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          tx,
        );

        // 6. Named no-op rewards hook inside acceptance transaction
        await onOrderAcceptedRewardsHook(
          tx,
          {
            id: order.id,
            orderReference: order.orderReference,
            totalAmount: order.totalAmount,
            currency: order.currency,
            userId: order.userId,
            guestEmail: order.guestEmail,
          },
          items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            lineTotal: item.totalPrice,
          })),
        );

        const receipt: CheckoutReceipt = {
          order: {
            id: order.id,
            orderReference: order.orderReference,
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            currency: order.currency,
          },
          message: 'Order created successfully',
        };

        // 7. Persist outcome on the idempotency row before commit
        await checkoutIdempotencyQueries.recordSuccess(
          idempotencyRow.id,
          {
            orderId: order.id,
            orderReference: order.orderReference,
            response: receipt,
          },
          tx,
        );

        return {
          success: true,
          status: 201,
          data: receipt,
        };
      });
    } catch (err: unknown) {
      const isIdempotencyConflict = checkoutIdempotencyQueries.isScopeKeyConflict(err);

      if (isIdempotencyConflict) {
        for (let attempt = 0; attempt < 10; attempt++) {
          const saved = await checkoutIdempotencyQueries.findByScopeAndKey(scope, idempotencyKey);
          if (saved) {
            if (saved.fingerprint !== fingerprint) {
              return {
                success: false,
                status: 409,
                error: {
                  code: 'idempotency-conflict',
                  message: 'Idempotency conflict: payload does not match original request',
                },
              };
            }
            if (saved.response) {
              return {
                success: true,
                status: 201,
                data: saved.response,
              };
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        // The winning attempt hasn't recorded an outcome yet; tell the client to retry the same
        // key rather than surfacing a 500.
        return {
          success: false,
          status: 409,
          error: {
            code: 'idempotency-in-progress',
            message: 'A request with this Idempotency-Key is still being processed; retry shortly',
          },
        };
      }

      if (err instanceof ReconfirmationRequiredError) {
        return {
          success: false,
          status: 409,
          error: {
            code: 'reconfirmation-required',
            message: 'Quote terms have changed; reconfirmation required',
            quote: err.quote,
          },
        };
      }
      if (err instanceof InsufficientStockError) {
        return {
          success: false,
          status: 409,
          error: {
            code: 'insufficient-stock',
            message: 'Insufficient stock for requested items',
            shortfalls: err.shortfalls,
          },
        };
      }
      if (err instanceof UnavailableVariantError) {
        return {
          success: false,
          status: 400,
          error: {
            code: 'unavailable-variant',
            message: err.message,
          },
        };
      }
      throw err;
    }
  }

  /**
   * Re-quotes lines authoritatively from the catalog, optionally locking variants FOR SHARE.
   * Orders variants by variant ID for deterministic lock acquisition.
   */
  private async calculateQuote(
    lines: Array<{ variantId: number; quantity: number }>,
    tx?: Parameters<Parameters<typeof db.transaction>[0]>[0],
  ): Promise<{
    quote: CheckoutQuote;
    variantMap: Map<
      number,
      {
        id: number;
        productId: number;
        sku: string;
        localizedLabel: unknown;
        productName: unknown;
      }
    >;
  }> {
    const executor = tx ?? db;

    // Aggregate duplicate variant lines
    const quantitiesByVariant = new Map<number, number>();
    for (const line of lines) {
      quantitiesByVariant.set(
        line.variantId,
        (quantitiesByVariant.get(line.variantId) ?? 0) + line.quantity,
      );
    }

    const variantIds = [...quantitiesByVariant.keys()];

    const query = executor
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        sku: productVariants.sku,
        localizedLabel: productVariants.localizedLabel,
        productName: products.localizedName,
        basePrice: productVariants.basePrice,
        isActive: productVariants.isActive,
        productIsActive: products.isActive,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        and(
          inArray(productVariants.id, variantIds),
          eq(productVariants.isActive, true),
          eq(products.isActive, true),
        ),
      )
      .orderBy(productVariants.id);

    const availableVariants = tx ? await query.for('share') : await query;
    if (availableVariants.length !== variantIds.length) {
      throw new UnavailableVariantError();
    }

    const priceMap = new Map(availableVariants.map((v) => [v.id, Number(v.basePrice)]));
    const variantMap = new Map(availableVariants.map((v) => [v.id, v]));

    const quoteLines: CheckoutQuoteLine[] = variantIds.map((variantId) => {
      const quantity = quantitiesByVariant.get(variantId)!;
      const unitPrice = priceMap.get(variantId)!;
      const discounts: Array<{ source: string; amount: number }> = [];
      const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
      const lineTotal = Number((quantity * unitPrice - discountTotal).toFixed(2));
      return {
        variantId,
        quantity,
        unitPrice,
        discounts,
        lineTotal,
      };
    });

    const subtotal = Number(quoteLines.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2));
    const shipping = Number(this.shippingFee.toFixed(2));
    const total = Number((subtotal + shipping).toFixed(2));
    const currency = 'EGP' as const;

    const confirmation = computeConfirmation({
      currency,
      shipping,
      subtotal,
      total,
      lines: quoteLines,
    });

    return {
      quote: {
        lines: quoteLines,
        shipping,
        subtotal,
        total,
        currency,
        confirmation,
      },
      variantMap,
    };
  }
}
