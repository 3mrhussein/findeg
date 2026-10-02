import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import {
  businessPartners,
  inventoryBalances,
  partnerSchoolProfiles,
  products,
  productVariants,
  schoolSupplyListItems,
  schoolSupplyLists,
  warehouses,
  type SchoolSupplyListItemRow,
  type SchoolSupplyListRow,
} from '../../schema';
import type { SchoolSupplyListExecutor, SchoolSupplyListTransaction } from './index';
import type {
  CreateSupplyListDraftInput,
  UpdateSupplyListDraftInput,
  SupplyListItemInput,
} from '../../types/school-supply-lists';

export type SupplyListDraftInput = CreateSupplyListDraftInput;
export type SupplyListDraftPatch = UpdateSupplyListDraftInput;
export type { SupplyListItemInput } from '../../types/school-supply-lists';

/** Serialize one school's lifecycle, always before taking list locks. */
export async function lockSupplyListPartner(tx: SchoolSupplyListTransaction, id: number) {
  const [partner] = await tx
    .select()
    .from(businessPartners)
    .where(eq(businessPartners.id, id))
    .for('update');
  if (!partner) return undefined;
  const [profile] = await tx
    .select()
    .from(partnerSchoolProfiles)
    .where(eq(partnerSchoolProfiles.businessPartnerId, id));
  return profile ? partner : undefined;
}

export async function getSupplyList(executor: SchoolSupplyListExecutor, id: number) {
  const [row] = await executor.select().from(schoolSupplyLists).where(eq(schoolSupplyLists.id, id));
  return row;
}

export async function lockSupplyList(tx: SchoolSupplyListTransaction, id: number) {
  const [row] = await tx
    .select()
    .from(schoolSupplyLists)
    .where(eq(schoolSupplyLists.id, id))
    .for('update');
  return row;
}

export async function getSupplyListItems(executor: SchoolSupplyListExecutor, listId: number) {
  return executor
    .select()
    .from(schoolSupplyListItems)
    .where(eq(schoolSupplyListItems.listId, listId))
    .orderBy(asc(schoolSupplyListItems.sortOrder), asc(schoolSupplyListItems.id));
}

export async function getPublishedSupplyListInSlot(
  tx: SchoolSupplyListTransaction,
  list: Pick<SchoolSupplyListRow, 'businessPartnerId' | 'academicYear' | 'grade'>,
) {
  const [row] = await tx
    .select()
    .from(schoolSupplyLists)
    .where(
      and(
        eq(schoolSupplyLists.businessPartnerId, list.businessPartnerId),
        eq(schoolSupplyLists.academicYear, list.academicYear),
        eq(schoolSupplyLists.grade, list.grade),
        eq(schoolSupplyLists.status, 'published'),
      ),
    );
  return row;
}

export async function insertSupplyListDraft(
  tx: SchoolSupplyListTransaction,
  input: SupplyListDraftInput,
  sourceListId: number | null = null,
) {
  const [row] = await tx
    .insert(schoolSupplyLists)
    .values({ ...input, sourceListId })
    .returning();
  return row;
}

export async function updateSupplyListDraft(
  tx: SchoolSupplyListTransaction,
  id: number,
  patch: SupplyListDraftPatch,
) {
  const [row] = await tx
    .update(schoolSupplyLists)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(schoolSupplyLists.id, id), eq(schoolSupplyLists.status, 'draft')))
    .returning();
  return row;
}

export async function insertSupplyListItem(
  tx: SchoolSupplyListTransaction,
  listId: number,
  input: SupplyListItemInput,
) {
  const [row] = await tx
    .insert(schoolSupplyListItems)
    .values({ ...input, listId })
    .returning();
  return row;
}

export async function updateSupplyListItem(
  tx: SchoolSupplyListTransaction,
  listId: number,
  id: number,
  patch: Partial<SupplyListItemInput>,
) {
  const [row] = await tx
    .update(schoolSupplyListItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(schoolSupplyListItems.id, id), eq(schoolSupplyListItems.listId, listId)))
    .returning();
  return row;
}

export async function deleteSupplyListItem(
  tx: SchoolSupplyListTransaction,
  listId: number,
  id: number,
) {
  const [row] = await tx
    .delete(schoolSupplyListItems)
    .where(and(eq(schoolSupplyListItems.id, id), eq(schoolSupplyListItems.listId, listId)))
    .returning();
  return row;
}

/** Lock catalog display/active facts until publication has committed. */
export async function getSupplyListDefaults(tx: SchoolSupplyListTransaction, variantIds: number[]) {
  if (variantIds.length === 0) return [];
  return tx
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      localizedName: products.localizedName,
      variantActive: productVariants.isActive,
      productActive: products.isActive,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(inArray(productVariants.id, variantIds))
    .orderBy(asc(productVariants.id))
    .for('share');
}

/** Available units across operational warehouses; missing balances mean zero stock. */
export async function getSupplyListDefaultStock(
  tx: SchoolSupplyListTransaction,
  variantIds: number[],
) {
  if (variantIds.length === 0) return [];
  return tx
    .select({
      variantId: inventoryBalances.variantId,
      available:
        sql<number>`coalesce(sum(${inventoryBalances.onHand} - ${inventoryBalances.reserved}), 0)`.mapWith(
          Number,
        ),
    })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId))
    .where(and(inArray(inventoryBalances.variantId, variantIds), eq(warehouses.isActive, true)))
    .groupBy(inventoryBalances.variantId);
}

export async function snapshotSupplyListItem(
  tx: SchoolSupplyListTransaction,
  id: number,
  snapshot: Pick<
    SchoolSupplyListItemRow,
    'productNameEnSnapshot' | 'productNameArSnapshot' | 'skuSnapshot'
  >,
) {
  await tx
    .update(schoolSupplyListItems)
    .set({ ...snapshot, updatedAt: new Date() })
    .where(eq(schoolSupplyListItems.id, id));
}

export async function publishSupplyList(
  tx: SchoolSupplyListTransaction,
  id: number,
  publicCode: string,
  publishedAt: Date,
  replacesListId: number | null,
) {
  const [row] = await tx
    .update(schoolSupplyLists)
    .set({
      status: 'published',
      publicCode,
      publishedAt,
      replacesListId,
      updatedAt: publishedAt,
    })
    .where(eq(schoolSupplyLists.id, id))
    .returning();
  return row;
}

export async function archiveSupplyList(
  tx: SchoolSupplyListTransaction,
  id: number,
  archivedAt: Date,
  replacedById: number | null = null,
) {
  const [row] = await tx
    .update(schoolSupplyLists)
    .set({
      status: 'archived',
      archivedAt,
      replacedById,
      updatedAt: archivedAt,
    })
    .where(eq(schoolSupplyLists.id, id))
    .returning();
  return row;
}

/** A concurrent/direct writer may win the unique slot race; expose a business rejection. */
export function isSupplyListSlotTakenError(error: unknown): boolean {
  let current = error;
  while (current && typeof current === 'object') {
    const { code, constraint_name, cause } = current as {
      code?: string;
      constraint_name?: string;
      cause?: unknown;
    };
    if (code === '23505' && constraint_name === 'uq_supply_list_published_slot') return true;
    current = cause;
  }
  return false;
}
