import { randomBytes } from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { domainId, mapStockBalance } from '@findeg/db';
import { products, productVariants, type CheckoutIdempotency } from '@findeg/db/schema';
import type { Db } from '@findeg/db/connection';
import type { DbTransaction } from '@findeg/db/queries';
import {
  acceptOrder,
  acceptedPaymentMethod,
  cart,
  egyptianMobile,
  generateOrderReference,
  guestBuyer,
  moneyFromDecimal,
  moneyToDecimal,
  priceQuote,
  shippingAddress,
  sku,
  sumMoney,
  type Quote,
  type VariantId,
} from '@findeg/domain';
import { computeConfirmation, toCheckoutQuote } from '../checkout-quote/helpers';
import {
  buildIdempotencyScope,
  computeOrderFingerprint,
  MAX_IDEMPOTENCY_SCOPE_LENGTH,
} from '../checkout-idempotency';
import {
  ListUnavailableError,
  mapDomainError,
  SelectionInvalidError,
  UnavailableVariantError,
} from '../checkout-errors/helpers';
import { calculateListQuote } from '../list-checkout-quote/helpers';
import type { ListAttribution } from '../list-checkout-quote/types';
import { CheckoutOrderSchema, CheckoutValidateSchema } from '../checkout-input/helpers';
import type {
  CheckoutLine,
  CheckoutOrderContext,
  CheckoutOrderInput,
  CheckoutReceipt,
  CheckoutShippingAddress,
  CheckoutValidateInput,
  ListCheckoutLine,
} from '../checkout-input/types';
import { ORDER_ACCEPTED_KIND, ORDER_SUCCESS_MESSAGES, orderAcceptedId } from './constants';
import type {
  CheckoutAcceptFailure,
  CheckoutAcceptResult,
  CheckoutServiceOptions,
  CheckoutValidateResult,
  ICheckoutService,
  OutboxEnqueue,
} from './types';

type Executor = Db | DbTransaction;

/** Validated, normalized accept request with its derived idempotency scope and fingerprint. */
type AcceptRequest = (
  | { source: 'cart'; lines: CheckoutLine[]; publicCode?: never }
  | { source: 'list'; publicCode: string; lines: ListCheckoutLine[] }
) & {
  confirmation: string;
  paymentMethod: string;
  address: CheckoutShippingAddress;
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

/** Loads the default connection and the Sales queries only when a database operation runs. */
const loadDatabase = () => import('@findeg/db/connection').then(({ db }) => db);
const loadQueries = () => import('@findeg/db/queries');

export class CheckoutService implements ICheckoutService {
  private readonly clock: () => Date;
  private readonly enqueue: OutboxEnqueue;

  constructor(options: CheckoutServiceOptions) {
    this.clock = options.clock ?? (() => new Date());
    this.enqueue = options.enqueue;
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
          ? await calculateListQuote(parsed.data, undefined, this.clock())
          : await this.calculateQuote(parsed.data.lines);
      return { success: true, data: toCheckoutQuote(quote) };
    } catch (err: unknown) {
      const mapped = mapDomainError(err);
      if (mapped) return mapped;
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
    const queries = await loadQueries();
    const replay = this.replayOutcome(
      await queries.checkoutIdempotencyQueries.findByScopeAndKey(
        request.scope,
        request.idempotencyKey,
      ),
      request.fingerprint,
    );
    if (replay) return replay;

    try {
      const db = await loadDatabase();
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
    try {
      acceptedPaymentMethod(input.paymentMethod);
    } catch (err) {
      const failure = mapDomainError(err);
      if (failure) return { ok: false, failure };
      throw err;
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

    try {
      egyptianMobile(parsed.data.address.phone);
      shippingAddress({
        ...parsed.data.address,
        governorate: parsed.data.address.governorate ?? parsed.data.address.city,
      });
      if (!userId) guestBuyer(guestEmail!);
      if (parsed.data.source === 'cart')
        cart(
          parsed.data.lines.map((line) => ({ ...line, variantId: line.variantId as VariantId })),
        );
    } catch (err) {
      const failure = mapDomainError(err);
      if (failure) return { ok: false, failure };
      throw err;
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
      paymentMethod: parsed.data.paymentMethod,
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
    const queries = await loadQueries();
    const {
      source,
      publicCode,
      lines,
      confirmation,
      paymentMethod,
      address,
      userId,
      guestEmail,
      idempotencyKey,
      scope,
      fingerprint,
    } = request;

    // 1. Insert idempotency row first inside acceptance transaction so concurrent retries serialize
    const claim = await queries.checkoutIdempotencyQueries.claimKey(
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
        tx,
        this.clock(),
      );
      calculation = listCalculation;
      attribution = listCalculation.attribution;
    } else {
      calculation = await this.calculateQuote(lines as CheckoutLine[], tx);
    }
    const { quote: freshQuote, variantMap } = calculation;

    // Domain confirms canonical terms and allocates against balances held FOR UPDATE.
    const balances = await queries.lockOrderStock(
      freshQuote.lines.map((line) => line.variantId),
      tx,
    );
    const acceptance = acceptOrder({
      reference: generateOrderReference(randomBytes),
      buyer: userId
        ? { kind: 'customer', customerId: domainId<'Customer'>(userId) }
        : guestBuyer(guestEmail!),
      contactPhone: egyptianMobile(address.phone),
      shippingAddress: shippingAddress({
        ...address,
        governorate: address.governorate ?? address.city,
      }),
      paymentMethod,
      quote: freshQuote,
      confirmation,
      digestTerms: computeConfirmation,
      stock: {
        balances: balances.map(mapStockBalance),
        // lockOrderStock reads only balances at active warehouses.
        warehouses: [...new Set(balances.map((balance) => balance.warehouseId))].map((id) => ({
          id: domainId<'Warehouse'>(id),
          name: '',
          status: 'active',
        })),
      },
    });
    const accepted = acceptance.order;

    // 4. Create the Order and Order Items (reuses variantMap without redundant second query)
    const create = (reference: string) =>
      queries.orderQueries.create(
        {
          orderReference: reference,
          userId,
          guestEmail,
          status: accepted.status,
          paymentStatus: accepted.paymentStatus,
          subtotal: moneyToDecimal(accepted.totals.netSubtotal),
          shippingCost: moneyToDecimal(accepted.totals.shipping),
          totalAmount: moneyToDecimal(accepted.totals.total),
          listOfferBasisPoints: attribution?.listOfferBasisPoints ?? undefined,
          discountTotal: moneyToDecimal(accepted.totals.discount),
          currency: accepted.currency,
          paymentMethod: accepted.paymentMethod,
          schoolSupplyListId: attribution?.schoolSupplyListId,
          schoolSupplyListPublicCode: attribution?.schoolSupplyListPublicCode,
          schoolSupplyListPublishedAt: attribution?.schoolSupplyListPublishedAt,
          businessPartnerId: attribution?.businessPartnerId,
          shippingAddressSnapshot: { ...accepted.shippingAddress, phone: accepted.contactPhone },
          items: accepted.lines.map((line) => {
            const meta = variantMap.get(line.variantId);
            if (!meta || !meta.productId || !meta.sku) {
              throw new Error(
                `Catalog metadata missing or incomplete for variant ${line.variantId}`,
              );
            }
            return {
              productId: meta.productId,
              variantId: line.variantId,
              quantity: line.quantity,
              unitPriceSnapshot: moneyToDecimal(line.unitPrice),
              totalPrice: moneyToDecimal(line.lineTotal),
              unitPrice: moneyToDecimal(line.unitPrice),
              discountAmount: moneyToDecimal(
                sumMoney(line.discounts.map((discount) => discount.amount)),
              ),
              lineTotal: moneyToDecimal(line.lineTotal),
              productNameSnapshot: line.productName,
              productSkuSnapshot: line.sku,
              variantSkuSnapshot: line.sku,
              variantSnapshot: (meta.localizedLabel as Record<string, unknown>) ?? {},
              schoolSupplyListItemId: line.supplyListItemId ?? undefined,
              isSubstitute: line.isSubstitute ?? undefined,
            };
          }),
        },
        tx,
      );

    // Keep reference collision retries within savepoints, as before.
    let stored;
    let reference = accepted.reference;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        stored = await create(reference);
        break;
      } catch (err) {
        if (!queries.orderQueries.isOrderReferenceConflict(err) || attempt === 4) throw err;
        reference = generateOrderReference(randomBytes);
      }
    }
    if (!stored) throw new Error('Failed to create order');
    const { order } = stored;

    await queries.persistOrderStock(order.id, acceptance.stock, tx);

    // 6. Confirmation email goes to the outbox in this transaction; delivery happens afterwards
    await this.enqueue(tx, orderAcceptedId(order.orderReference), ORDER_ACCEPTED_KIND, {
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
      message: ORDER_SUCCESS_MESSAGES.ORDER_CREATED,
    };

    // 7. Persist outcome on the idempotency row before commit
    await queries.checkoutIdempotencyQueries.recordSuccess(
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
    const queries = await loadQueries();
    if (queries.checkoutIdempotencyQueries.isScopeKeyConflict(err)) {
      // A concurrent attempt holds this key; wait briefly for its outcome and replay it.
      for (let attempt = 0; attempt < 10; attempt++) {
        const replay = this.replayOutcome(
          await queries.checkoutIdempotencyQueries.findByScopeAndKey(
            request.scope,
            request.idempotencyKey,
          ),
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

    const mapped = mapDomainError(err);
    if (mapped) return mapped;
    if (err instanceof ListUnavailableError) {
      return rejected(409, 'list-unavailable', err.message);
    }
    if (err instanceof SelectionInvalidError) {
      return rejected(422, 'selection-invalid', err.message, {
        listItemIds: err.listItemIds,
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
    tx?: DbTransaction,
  ): Promise<{
    quote: Quote;
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
    // Domain merges and validates the lines before any database module loads.
    const merged = cart(lines.map((line) => ({ ...line, variantId: line.variantId as VariantId })));
    const variantIds = merged.lines.map((line) => line.variantId);
    const executor: Executor = tx ?? (await loadDatabase());

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

    const variantMap = new Map(availableVariants.map((v) => [v.id, v]));
    const quote = priceQuote(
      { kind: 'cart' },
      merged.lines.map((line) => {
        const variant = variantMap.get(line.variantId)!;
        const name = variant.productName as Record<string, string>;
        return {
          ...line,
          unitPrice: moneyFromDecimal(variant.basePrice),
          sku: sku(variant.sku),
          productName: name.en || name.ar || '',
        };
      }),
      this.clock(),
    );
    return { quote, variantMap };
  }
}

export function createCheckoutService(options: CheckoutServiceOptions): ICheckoutService {
  return new CheckoutService(options);
}
