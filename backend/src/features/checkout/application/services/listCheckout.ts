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
import { eligibleVariants } from '@findeg/backend/features/school';
import { computeConfirmation } from '../../domain/confirmation';
import { ListUnavailableError, SelectionInvalidError } from '../../domain/errors';
import type { CheckoutQuote, CheckoutQuoteLine, ListCheckoutLine } from '../../schemas';

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
}

export interface ListQuoteCalculation {
  quote: CheckoutQuote;
  variantMap: Map<number, CatalogVariantMetadata>;
  attribution: ListAttribution;
}

const invalidIds = (ids: number[]) => [...new Set(ids)].sort((a, b) => a - b);

/**
 * Re-quotes one School Supply List selection. When given an acceptance
 * transaction, every list/item/candidate fact used for eligibility and price
 * is held with FOR SHARE until the Order is committed.
 */
export async function calculateListQuote(
  input: { publicCode: string; lines: ListCheckoutLine[] },
  shippingFee: number,
  tx?: DbTransaction,
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

  const quoteLines: CheckoutQuoteLine[] = [...input.lines]
    .sort((a, b) => a.listItemId - b.listItemId)
    .map((line) => {
      const unitPrice = Number(variantById.get(line.variantId)!.basePrice);
      return {
        listItemId: line.listItemId,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice,
        discounts: [],
        lineTotal: Number((unitPrice * line.quantity).toFixed(2)),
      };
    });
  const subtotal = Number(quoteLines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2));
  const shipping = Number(shippingFee.toFixed(2));
  const total = Number((subtotal + shipping).toFixed(2));
  const currency = 'EGP' as const;
  const confirmation = computeConfirmation({
    source: 'list',
    publicCode: list.publicCode,
    currency,
    shipping,
    subtotal,
    total,
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
    },
  };
}
