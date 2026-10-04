import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@findeg/db/connection';
import { products, productVariants, type CheckoutIdempotency } from '@findeg/db/schema';
import {
  type DbTransaction,
  orderQueries,
  reserveOrderStock,
  InsufficientStockError,
  checkoutIdempotencyQueries,
} from '@findeg/db/queries';
import { computeConfirmation } from '../../domain/confirmation';
import {
  lineDiscount,
  piastersToDecimal,
  priceLine,
  shippingFeeToPiasters,
  sumQuote,
  toCheckoutQuote,
  toPiasters,
  type PiasterQuote,
  type PiasterQuoteLine,
} from '../../domain/piasters';
import { computeOrderFingerprint } from '../../domain/fingerprint';
import {
  buildIdempotencyScope,
  MAX_IDEMPOTENCY_SCOPE_LENGTH,
} from '../../domain/idempotency-scope';
import { enqueue, orderAcceptedId, ORDER_ACCEPTED_KIND } from '../../../outbox';
import { recordAcceptedRewards } from '@findeg/backend/features/partner-rewards';
import {
  ListUnavailableError,
  ReconfirmationRequiredError,
  SelectionInvalidError,
  UnavailableVariantError,
} from '../../domain/errors';
import { calculateListQuote, type ListAttribution } from './listCheckout';
import {
  CheckoutOrderSchema,
  CheckoutValidateSchema,
  type CheckoutLine,
  type ListCheckoutLine,
  type CheckoutOrderInput,
  type CheckoutOrderContext,
  type ShippingAddress,
  type CheckoutValidateInput,
  type CheckoutReceipt,
} from '../../schemas';
import type {
  CheckoutAcceptFailure,
  CheckoutAcceptResult,
  CheckoutValidateResult,
  ICheckoutService,
} from '../interfaces/ICheckoutService';

export interface CheckoutServiceOptions {
  shippingFee?: number;
  /** Source of the acceptance time that decides whether a List Offer is active. */
  clock?: () => Date;
}

export const DEFAULT_FLAT_SHIPPING_FEE = 50;

/** Validated, normalized accept request with its derived idempotency scope and fingerprint. */
type AcceptRequest = (
  | { source: 'cart'; lines: CheckoutLine[]; publicCode?: never }
  | { source: 'list'; publicCode: string; lines: ListCheckoutLine[] }
) & {
  confirmation: string;
  address: ShippingAddress;
  userId?: number;
  guestEmail?: string;
  idempotencyKey: string;
  scope: string;
  fingerprint: string;
};

function rejected(
  status: CheckoutAcceptFailure['status'],
  code: CheckoutAcceptFailure['error']['code'],
  message: string,
  extra?: Record<string, unknown>,
): CheckoutAcceptFailure {
  return { success: false, status, error: { code, message, ...extra } };
}

export class CheckoutService implements ICheckoutService {
  private readonly shippingFee: bigint;
  private readonly clock: () => Date;

  constructor(options?: CheckoutServiceOptions) {
    this.clock = options?.clock ?? (() => new Date());
    this.shippingFee = shippingFeeToPiasters(
      options?.shippingFee ?? (process.env.CHECKOUT_FLAT_SHIPPING_FEE || DEFAULT_FLAT_SHIPPING_FEE),
    );
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
      const { quote } =
        parsed.data.source === 'list'
          ? await calculateListQuote(parsed.data, this.shippingFee, undefined, this.clock())
          : await this.calculateQuote(parsed.data.lines);
      return { success: true, data: toCheckoutQuote(quote) };
    } catch (err: unknown) {
      if (err instanceof ListUnavailableError) {
        return {
          success: false,
          status: 409,
          error: { code: 'list-unavailable', message: err.message },
        };
      }
      if (err instanceof SelectionInvalidError) {
        return {
          success: false,
          status: 422,
          error: {
            code: 'selection-invalid',
            message: err.message,
            listItemIds: err.listItemIds,
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

  async accept(
    input: CheckoutOrderInput,
    context?: CheckoutOrderContext,
  ): Promise<CheckoutAcceptResult> {
    const prepared = this.prepareAccept(input, context);
    if (!prepared.ok) return prepared.failure;
    const request = prepared.request;

    // Check saved outcome before any re-quote (ADR-0005)
    const replay = this.replayOutcome(
      await checkoutIdempotencyQueries.findByScopeAndKey(request.scope, request.idempotencyKey),
      request.fingerprint,
    );
    if (replay) return replay;

    try {
      return await db.transaction((tx) => this.placeOrder(tx, request));
    } catch (err: unknown) {
      return this.recoverAcceptFailure(err, request);
    }
  }

  /** Validates the request and derives the idempotency scope and fingerprint. */
  private prepareAccept(
    input: CheckoutOrderInput,
    context?: CheckoutOrderContext,
  ): { ok: true; request: AcceptRequest } | { ok: false; failure: CheckoutAcceptFailure } {
    const reject = (code: CheckoutAcceptFailure['error']['code'], message: string) => ({
      ok: false as const,
      failure: rejected(400, code, message),
    });

    if (!input || typeof input !== 'object') {
      return reject('validation-error', 'Invalid checkout order input');
    }

    // Check payment method before parsing to return specific error if not COD
    if (input.paymentMethod !== 'cod') {
      return reject('unsupported-payment-method', 'Only Cash on Delivery (cod) is accepted');
    }

    // Signed-in orders ignore guestEmail entirely, so drop it before it can fail validation
    const parsed = CheckoutOrderSchema.safeParse(
      context?.userId ? { ...input, guestEmail: undefined } : input,
    );
    if (!parsed.success) {
      return reject(
        'validation-error',
        parsed.error.issues[0]?.message || 'Invalid checkout order input',
      );
    }

    const userId = context?.userId;
    const guestEmail = parsed.data.guestEmail?.trim()?.toLowerCase();

    if (!userId && !guestEmail) {
      return reject(
        'validation-error',
        'Either a signed-in session or guestEmail must be provided',
      );
    }

    // Header-only (ADR-0005): the key is never read from the request body.
    const idempotencyKey = context?.idempotencyKey?.trim();

    if (!idempotencyKey) {
      return reject('missing-idempotency-key', 'Idempotency-Key is required');
    }

    if (idempotencyKey.length > 255) {
      return reject('invalid-idempotency-key', 'Idempotency-Key must not exceed 255 characters');
    }

    const guestId = context?.guestId?.trim();
    if (guestId && guestId.length > 200) {
      return reject('invalid-guest-id', 'Guest ID must not exceed 200 characters');
    }

    const identityScope = buildIdempotencyScope({ userId, guestId, guestEmail });
    const scope =
      parsed.data.source === 'list'
        ? `${identityScope}:list:${parsed.data.publicCode}`
        : identityScope;

    if (scope.length > MAX_IDEMPOTENCY_SCOPE_LENGTH) {
      return reject('invalid-guest-id', 'Guest identifier is too long');
    }

    const { lines, confirmation, address } = parsed.data;
    const effectiveGuestEmail = userId ? undefined : guestEmail;

    const fingerprint = computeOrderFingerprint({
      source: parsed.data.source,
      publicCode: parsed.data.source === 'list' ? parsed.data.publicCode : undefined,
      lines,
      address,
      paymentMethod: parsed.data.paymentMethod,
      deliveryMethod: parsed.data.deliveryMethod,
      confirmation,
      guestEmail: effectiveGuestEmail,
    });

    const common = {
      confirmation,
      address,
      userId,
      guestEmail: effectiveGuestEmail,
      idempotencyKey,
      scope,
      fingerprint,
    };
    return {
      ok: true,
      request:
        parsed.data.source === 'list'
          ? {
              ...common,
              source: 'list',
              publicCode: parsed.data.publicCode,
              lines: parsed.data.lines,
            }
          : { ...common, source: 'cart', lines: parsed.data.lines },
    };
  }

  /** Maps a saved idempotency row to the outcome to return, or null when none is available yet. */
  private replayOutcome(
    saved: CheckoutIdempotency | null,
    fingerprint: string,
  ): CheckoutAcceptResult | null {
    if (!saved) return null;
    if (saved.fingerprint !== fingerprint) {
      return rejected(
        409,
        'idempotency-conflict',
        'Idempotency conflict: payload does not match original request',
      );
    }
    if (saved.response) {
      return { success: true, status: 201, data: saved.response };
    }
    return null;
  }

  /**
   * The acceptance transaction: claim the idempotency key, re-quote, create the order, reserve
   * stock and persist the outcome atomically.
   */
  private async placeOrder(
    tx: DbTransaction,
    request: AcceptRequest,
  ): Promise<CheckoutAcceptResult> {
    const {
      source,
      publicCode,
      lines,
      confirmation,
      address,
      userId,
      guestEmail,
      idempotencyKey,
      scope,
      fingerprint,
    } = request;

    // 1. Insert idempotency row first inside acceptance transaction so concurrent retries serialize
    const claim = await checkoutIdempotencyQueries.claimKey(
      {
        scope,
        key: idempotencyKey,
        fingerprint,
      },
      tx,
    );

    // 2. Re-quote authoritatively under FOR SHARE locks (ordered by variant ID to prevent deadlocks)
    let attribution: ListAttribution | undefined;
    let calculation;
    if (source === 'list') {
      const listCalculation = await calculateListQuote(
        { publicCode, lines: lines as ListCheckoutLine[] },
        this.shippingFee,
        tx,
        this.clock(),
      );
      calculation = listCalculation;
      attribution = listCalculation.attribution;
    } else {
      calculation = await this.calculateQuote(lines as CheckoutLine[], tx);
    }
    const { quote: freshQuote, variantMap } = calculation;

    // 3. Price confirmation check
    if (freshQuote.confirmation !== confirmation) {
      throw new ReconfirmationRequiredError(toCheckoutQuote(freshQuote));
    }

    // 4. Create the Order and Order Items (reuses variantMap without redundant second query)
    const { order, items } = await orderQueries.create(
      {
        userId,
        guestEmail,
        status: 'pending',
        paymentStatus: 'unpaid',
        subtotal: piastersToDecimal(freshQuote.subtotal),
        shippingCost: piastersToDecimal(freshQuote.shipping),
        totalAmount: piastersToDecimal(freshQuote.total),
        listOfferBasisPoints: attribution?.listOfferBasisPoints ?? undefined,
        discountTotal: piastersToDecimal(
          freshQuote.lines.reduce((sum, line) => sum + lineDiscount(line), 0n),
        ),
        currency: freshQuote.currency,
        paymentMethod: 'cod',
        schoolSupplyListId: attribution?.schoolSupplyListId,
        schoolSupplyListPublicCode: attribution?.schoolSupplyListPublicCode,
        schoolSupplyListPublishedAt: attribution?.schoolSupplyListPublishedAt,
        businessPartnerId: attribution?.businessPartnerId,
        shippingAddressSnapshot: address,
        items: freshQuote.lines.map((line) => {
          const meta = variantMap.get(line.variantId);
          if (!meta || !meta.productId || !meta.sku) {
            throw new Error(`Catalog metadata missing or incomplete for variant ${line.variantId}`);
          }
          const productName =
            (meta.productName as Record<string, string>)?.en ||
            (meta.productName as Record<string, string>)?.ar ||
            '';
          return {
            productId: meta.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            unitPriceSnapshot: piastersToDecimal(line.unitPrice),
            totalPrice: piastersToDecimal(line.lineTotal),
            unitPrice: piastersToDecimal(line.unitPrice),
            discountAmount: piastersToDecimal(lineDiscount(line)),
            lineTotal: piastersToDecimal(line.lineTotal),
            productNameSnapshot: productName,
            productSkuSnapshot: meta.sku,
            variantSkuSnapshot: meta.sku,
            variantSnapshot: (meta.localizedLabel as Record<string, unknown>) ?? {},
            schoolSupplyListItemId: line.listItemId,
            isSubstitute:
              line.listItemId === undefined
                ? undefined
                : attribution?.items.get(line.listItemId)?.defaultVariantId !== line.variantId,
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

    // 6. Partner Points: entitlements and `accepted` events, or nothing for Cart orders and
    // partners without a rate. A failure here rolls the whole acceptance back.
    const chargedByItemId = new Map(freshQuote.lines.map((line) => [line.listItemId, line]));
    await recordAcceptedRewards(tx, {
      businessPartnerId: attribution?.businessPartnerId,
      rate: attribution?.rewardRate,
      lines: items.flatMap((item) => {
        const charged =
          item.schoolSupplyListItemId == null
            ? undefined
            : chargedByItemId.get(item.schoolSupplyListItemId);
        return charged
          ? [{ orderItemId: item.id, chargedLineTotalPiasters: charged.lineTotal }]
          : [];
      }),
    });

    // 7. Confirmation email goes to the outbox in this transaction; delivery happens afterwards
    await enqueue(tx, orderAcceptedId(order.orderReference), ORDER_ACCEPTED_KIND, {
      orderId: order.id,
    });

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

    // 8. Persist outcome on the idempotency row before commit
    await checkoutIdempotencyQueries.recordSuccess(
      claim.id,
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
  }

  /** Translates a failed acceptance transaction into a client-facing result, or rethrows. */
  private async recoverAcceptFailure(
    err: unknown,
    request: AcceptRequest,
  ): Promise<CheckoutAcceptResult> {
    if (checkoutIdempotencyQueries.isScopeKeyConflict(err)) {
      // A concurrent attempt holds this key; wait briefly for its outcome and replay it.
      for (let attempt = 0; attempt < 10; attempt++) {
        const replay = this.replayOutcome(
          await checkoutIdempotencyQueries.findByScopeAndKey(request.scope, request.idempotencyKey),
          request.fingerprint,
        );
        if (replay) return replay;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      // The winning attempt hasn't recorded an outcome yet; tell the client to retry the same
      // key rather than surfacing a 500.
      return rejected(
        409,
        'idempotency-in-progress',
        'A request with this Idempotency-Key is still being processed; retry shortly',
      );
    }

    if (err instanceof ReconfirmationRequiredError) {
      return rejected(
        409,
        'reconfirmation-required',
        'Quote terms have changed; reconfirmation required',
        { quote: err.quote },
      );
    }
    if (err instanceof ListUnavailableError) {
      return rejected(409, 'list-unavailable', err.message);
    }
    if (err instanceof SelectionInvalidError) {
      return rejected(422, 'selection-invalid', err.message, {
        listItemIds: err.listItemIds,
      });
    }
    if (err instanceof InsufficientStockError) {
      return rejected(409, 'insufficient-stock', 'Insufficient stock for requested items', {
        shortfalls: err.shortfalls,
      });
    }
    if (err instanceof UnavailableVariantError) {
      return rejected(400, 'unavailable-variant', err.message);
    }
    throw err;
  }

  /**
   * Re-quotes lines authoritatively from the catalog, optionally locking variants FOR SHARE.
   * Orders variants by variant ID for deterministic lock acquisition.
   */
  private async calculateQuote(
    lines: Array<{ variantId: number; quantity: number }>,
    tx?: Parameters<Parameters<typeof db.transaction>[0]>[0],
  ): Promise<{
    quote: PiasterQuote;
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

    const priceMap = new Map(availableVariants.map((v) => [v.id, toPiasters(v.basePrice)]));
    const variantMap = new Map(availableVariants.map((v) => [v.id, v]));

    const quoteLines: PiasterQuoteLine[] = variantIds.map((variantId) => {
      const quantity = quantitiesByVariant.get(variantId)!;
      const unitPrice = priceMap.get(variantId)!;
      const priced = priceLine(unitPrice, quantity, null);
      return {
        variantId,
        quantity,
        unitPrice,
        discounts: [],
        lineTotal: priced.lineTotal,
      };
    });

    const { subtotal, shipping, total } = sumQuote(quoteLines, this.shippingFee);
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
