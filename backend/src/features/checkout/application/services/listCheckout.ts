import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@findeg/db/connection';
import {
  attributes,
  products,
  productVariants,
  schoolSupplyListItems,
  schoolSupplyLists,
  variantAttributes,
} from '@findeg/db/schema';
import type { DbTransaction } from '@findeg/db/queries';
import { getListOffer } from '@findeg/db/queries/school-supply-lists';
import { eligibleVariants } from '@findeg/backend/features/school';
import {
  readRewardRateSnapshot,
  type RewardRateSnapshot,
} from '@findeg/backend/features/partner-rewards';
import { computeConfirmation } from '../../domain/confirmation';
import { isOfferActive } from '../../domain/list-offer';
import {
  priceLine,
  sumQuote,
  toPiasters,
  type PiasterQuote,
  type PiasterQuoteLine,
} from '../../domain/piasters';
import { ListUnavailableError, SelectionInvalidError } from '../../domain/errors';
import type { ListCheckoutLine } from '../../schemas';

type Executor = typeof db | DbTransaction;

export interface CatalogVariantMetadata {
  id: number;
  productId: number;
  sku: string;
  localizedLabel: unknown;
  productName: unknown;
}

export interface ListAttribution {
  schoolSupplyListId: number;
  schoolSupplyListPublicCode: string;
  schoolSupplyListPublishedAt: Date;
  businessPartnerId: number;
  items: Map<number, { defaultVariantId: number; exactItem: boolean }>;
  /** Basis points of the List Offer active at acceptance time, or null when none applies. */
  listOfferBasisPoints: number | null;
  /** The Partner's Reward Rate read FOR SHARE with the quote, or null when none is configured. */
  rewardRate: RewardRateSnapshot | null;
}

export interface ListQuoteCalculation {
  quote: PiasterQuote;
  variantMap: Map<number, CatalogVariantMetadata>;
  attribution: ListAttribution;
}

/** Tag on the per-line discount entries a List Offer produces. */
export const LIST_OFFER_SOURCE = 'list-offer';

const invalidIds = (ids: number[]) => [...new Set(ids)].sort((a, b) => a - b);

/**
 * Re-quotes one School Supply List selection. When given an acceptance
 * transaction, every list/item/candidate fact used for eligibility and price
 * is held with FOR SHARE until the Order is committed.
 */
export async function calculateListQuote(
  input: { publicCode: string; lines: ListCheckoutLine[] },
  shippingFee: bigint,
  tx?: DbTransaction,
  now: Date = new Date(),
): Promise<ListQuoteCalculation> {
  const executor: Executor = tx ?? db;
  const listQuery = executor
    .select()
    .from(schoolSupplyLists)
    .where(eq(schoolSupplyLists.publicCode, input.publicCode))
    .limit(1);
  const [list] = tx ? await listQuery.for('share') : await listQuery;
  if (!list || list.status !== 'published' || !list.publicCode || !list.publishedAt) {
    throw new ListUnavailableError();
  }

  const itemQuery = executor
    .select()
    .from(schoolSupplyListItems)
    .where(eq(schoolSupplyListItems.listId, list.id))
    .orderBy(asc(schoolSupplyListItems.id));
  const items = tx ? await itemQuery.for('share') : await itemQuery;
  const itemById = new Map(items.map((item) => [item.id, item]));

  const failures: number[] = [];
  const seen = new Set<number>();
  if (input.lines.length === 0) throw new SelectionInvalidError([]);
  for (const line of input.lines) {
    if (
      !Number.isSafeInteger(line.listItemId) ||
      !Number.isSafeInteger(line.variantId) ||
      line.variantId < 1 ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 999 ||
      seen.has(line.listItemId) ||
      !itemById.has(line.listItemId)
    ) {
      failures.push(line.listItemId);
    }
    seen.add(line.listItemId);
  }
  if (failures.length > 0) throw new SelectionInvalidError(invalidIds(failures));

  const variantIds = [...new Set(input.lines.map((line) => line.variantId))].sort((a, b) => a - b);
  const variantQuery = executor
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      sku: productVariants.sku,
      localizedLabel: productVariants.localizedLabel,
      productName: products.localizedName,
      basePrice: productVariants.basePrice,
      categoryId: products.categoryId,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(
      and(
        inArray(productVariants.id, variantIds),
        eq(productVariants.isActive, true),
        eq(products.isActive, true),
      ),
    )
    .orderBy(asc(productVariants.id));
  const variants = tx ? await variantQuery.for('share') : await variantQuery;
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  const attributeQuery = executor
    .select({
      variantId: variantAttributes.variantId,
      key: attributes.key,
      value: variantAttributes.valueText,
    })
    .from(variantAttributes)
    .innerJoin(attributes, eq(attributes.id, variantAttributes.attributeId))
    .where(inArray(variantAttributes.variantId, variantIds))
    .orderBy(asc(variantAttributes.variantId), asc(attributes.key));
  const attributeRows = tx ? await attributeQuery.for('share') : await attributeQuery;
  const attributesByVariant = new Map<number, Record<string, string>>();
  for (const row of attributeRows) {
    if (row.value === null) continue;
    const values = attributesByVariant.get(row.variantId) ?? {};
    values[row.key] = row.value;
    attributesByVariant.set(row.variantId, values);
  }

  for (const line of input.lines) {
    const item = itemById.get(line.listItemId)!;
    const variant = variantById.get(line.variantId);
    const eligible =
      item.variantId !== null &&
      variant &&
      eligibleVariants(
        {
          variantId: item.variantId,
          exactItem: item.exactItem,
          specification: item.specification,
        },
        [
          {
            variantId: variant.id,
            categoryId: variant.categoryId,
            attributes: attributesByVariant.get(variant.id) ?? {},
          },
        ],
      ).length === 1;
    if (!eligible) failures.push(line.listItemId);
  }
  if (failures.length > 0) throw new SelectionInvalidError(invalidIds(failures));

  // The offer is read after the list row is locked FOR SHARE. Staff offer edits take the list
  // FOR UPDATE first, so an offer created or changed mid-acceptance cannot slip past this read.
  const offer = await getListOffer(executor, list.id, tx ? { lock: 'share' } : {});
  const listOfferBasisPoints = offer && isOfferActive(offer, now) ? offer.basisPoints : null;

  const rewardRate = await readRewardRateSnapshot(executor, list.businessPartnerId);

  const quoteLines: PiasterQuoteLine[] = [...input.lines]
    .sort((a, b) => a.listItemId - b.listItemId)
    .map((line) => {
      const unitPrice = toPiasters(variantById.get(line.variantId)!.basePrice);
      const priced = priceLine(unitPrice, line.quantity, listOfferBasisPoints);
      return {
        listItemId: line.listItemId,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice,
        discounts:
          priced.discount > 0n ? [{ source: LIST_OFFER_SOURCE, amount: priced.discount }] : [],
        lineTotal: priced.lineTotal,
      };
    });
  const { subtotal, shipping, total } = sumQuote(quoteLines, shippingFee);
  const currency = 'EGP' as const;
  const confirmation = computeConfirmation({
    source: 'list',
    publicCode: list.publicCode,
    currency,
    shipping,
    subtotal,
    total,
    listOfferBasisPoints,
    rewardRate,
    lines: quoteLines,
  });

  return {
    quote: { lines: quoteLines, shipping, subtotal, total, currency, confirmation },
    variantMap: new Map(
      variants.map((variant) => [
        variant.id,
        {
          id: variant.id,
          productId: variant.productId,
          sku: variant.sku,
          localizedLabel: variant.localizedLabel,
          productName: variant.productName,
        },
      ]),
    ),
    attribution: {
      schoolSupplyListId: list.id,
      schoolSupplyListPublicCode: list.publicCode,
      schoolSupplyListPublishedAt: list.publishedAt,
      businessPartnerId: list.businessPartnerId,
      items: new Map(
        items.flatMap((item) =>
          item.variantId === null
            ? []
            : [[item.id, { defaultVariantId: item.variantId, exactItem: item.exactItem }] as const],
        ),
      ),
      listOfferBasisPoints,
      rewardRate,
    },
  };
}
