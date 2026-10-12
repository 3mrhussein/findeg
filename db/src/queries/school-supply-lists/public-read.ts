import { sellableUnitsSql } from '../inventory/stock-sql';
import { PUBLIC_SUPPLY_LIST_STATUSES } from '@findeg/domain';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import {
  brands,
  businessPartners,
  inventoryBalances,
  partnerSchoolProfiles,
  products,
  productVariants,
  schoolSupplyListItems,
  schoolSupplyLists,
  warehouses,
} from '../../schema';
import { mapStockBalance, mapWarehouse } from '../../mapping';
import type { SchoolSupplyListExecutor } from './index';

/** A published or archived list by its public code, with its school and replacement code. */
export async function getPublicSupplyListByCode(
  executor: SchoolSupplyListExecutor,
  publicCode: string,
) {
  const replacement = schoolSupplyLists;
  const rows = await executor
    .select({
      list: schoolSupplyLists,
      school: {
        id: businessPartners.id,
        nameEn: businessPartners.nameEn,
        nameAr: businessPartners.nameAr,
        logoUrl: partnerSchoolProfiles.logoUrl,
      },
    })
    .from(schoolSupplyLists)
    .innerJoin(businessPartners, eq(businessPartners.id, schoolSupplyLists.businessPartnerId))
    .leftJoin(
      partnerSchoolProfiles,
      eq(partnerSchoolProfiles.businessPartnerId, schoolSupplyLists.businessPartnerId),
    )
    .where(
      and(
        eq(schoolSupplyLists.publicCode, publicCode),
        inArray(schoolSupplyLists.status, PUBLIC_SUPPLY_LIST_STATUSES),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  let replacementPublicCode: string | null = null;
  if (row.list.replacedById !== null) {
    const [next] = await executor
      .select({ publicCode: replacement.publicCode })
      .from(replacement)
      .where(eq(replacement.id, row.list.replacedById));
    replacementPublicCode = next?.publicCode ?? null;
  }
  const items = await executor
    .select()
    .from(schoolSupplyListItems)
    .where(eq(schoolSupplyListItems.listId, row.list.id))
    .orderBy(asc(schoolSupplyListItems.sortOrder), asc(schoolSupplyListItems.id));
  return { ...row, replacementPublicCode, items };
}

/**
 * Available units (`onHand - reserved`) summed across active warehouses, for
 * many variants in one query. A variant with no balances is absent (zero stock).
 */
export async function getAvailableQuantities(
  executor: SchoolSupplyListExecutor,
  variantIds: number[],
): Promise<Map<number, number>> {
  if (variantIds.length === 0) return new Map();
  const rows = await executor
    .select({
      variantId: inventoryBalances.variantId,
      available:
        sql<number>`coalesce(sum(${sellableUnitsSql(inventoryBalances.onHand, inventoryBalances.reserved, warehouses.isActive)}), 0)`.mapWith(
          Number,
        ),
    })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
    .where(and(inArray(inventoryBalances.variantId, variantIds), eq(warehouses.isActive, true)))
    .groupBy(inventoryBalances.variantId);
  return new Map(rows.map((row) => [row.variantId, row.available]));
}

/** Display facts for variants, whether or not they are still active. */
export async function getVariantDisplayDetails(
  executor: SchoolSupplyListExecutor,
  variantIds: number[],
) {
  if (variantIds.length === 0) return [];
  return executor
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      price: productVariants.basePrice,
      productName: products.localizedName,
      variantLabel: productVariants.localizedLabel,
      brandName: brands.localizedName,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(inArray(productVariants.id, variantIds));
}

/** Raw inventory facts for the domain publication decision, read within the list transaction. */
export async function getSupplyListStockFacts(
  executor: SchoolSupplyListExecutor,
  variantIds: number[],
) {
  if (variantIds.length === 0) return { balances: [], warehouses: [] };
  const rows = await executor
    .select({ balance: inventoryBalances, warehouse: warehouses })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
    .where(inArray(inventoryBalances.variantId, variantIds));
  return {
    balances: rows.map(({ balance }) => mapStockBalance(balance)),
    warehouses: [
      ...new Map(rows.map(({ warehouse }) => [warehouse.id, mapWarehouse(warehouse)])).values(),
    ],
  };
}
