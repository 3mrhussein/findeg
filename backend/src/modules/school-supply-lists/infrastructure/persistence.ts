import { and, asc, eq } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import { schoolSupplyListItems, schoolSupplyLists } from '@findeg/db/modules/school-supply-lists';
import type {
  SchoolSupplyList,
  SchoolSupplyListInput,
  SchoolSupplyListItemInput,
  Snapshot,
} from '../contracts.js';
import type { SchoolSupplyListStore } from '../public.js';

function mapList(
  row: typeof schoolSupplyLists.$inferSelect,
  items: readonly (typeof schoolSupplyListItems.$inferSelect)[],
): SchoolSupplyList {
  return {
    id: row.id,
    businessPartnerId: row.businessPartnerId,
    status: row.status as SchoolSupplyList['status'],
    academicYear: row.academicYear,
    schoolName: row.schoolName,
    grade: row.grade,
    title: { en: row.titleEn, ar: row.titleAr },
    publicCode: row.publicCode ?? undefined,
    sourceListId: row.sourceListId ?? undefined,
    replacesListId: row.replacesListId ?? undefined,
    replacedById: row.replacedById ?? undefined,
    items: items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      exactItem: item.exactItem === 1,
      productName: { en: item.productNameEn, ar: item.productNameAr },
      sku: item.sku,
      label: { en: item.labelEn, ar: item.labelAr },
      unitPrice: item.unitPrice,
    })),
  };
}

export function bindSchoolSupplyListStore(database: TransactionDatabase): SchoolSupplyListStore {
  async function load(id: number, partnerId?: number) {
    const [row] = await database
      .select()
      .from(schoolSupplyLists)
      .where(
        partnerId === undefined
          ? eq(schoolSupplyLists.id, id)
          : and(eq(schoolSupplyLists.id, id), eq(schoolSupplyLists.businessPartnerId, partnerId)),
      )
      .for('update');
    if (!row) return undefined;
    const items = await database
      .select()
      .from(schoolSupplyListItems)
      .where(eq(schoolSupplyListItems.listId, id))
      .orderBy(asc(schoolSupplyListItems.id));
    return mapList(row, items);
  }

  return {
    async createDraft(partnerId, actorId, input) {
      const [row] = await database
        .insert(schoolSupplyLists)
        .values({
          businessPartnerId: partnerId,
          createdBy: actorId,
          academicYear: input.academicYear.trim(),
          schoolName: input.schoolName.trim(),
          grade: input.grade.trim(),
          titleEn: input.title.en.trim(),
          titleAr: input.title.ar.trim(),
        })
        .returning();
      return mapList(row!, []);
    },
    get: load,
    async replaceItems(listId, items) {
      await database.delete(schoolSupplyListItems).where(eq(schoolSupplyListItems.listId, listId));
      await database.insert(schoolSupplyListItems).values(
        items.map((item) => ({
          listId,
          variantId: item.variantId,
          quantity: item.quantity,
          exactItem: item.exactItem ? 1 : 0,
          labelEn: item.label.en.trim(),
          labelAr: item.label.ar.trim(),
        })),
      );
      await database
        .update(schoolSupplyLists)
        .set({ updatedAt: new Date() })
        .where(eq(schoolSupplyLists.id, listId));
    },
    async publish(listId, snapshots, replacesListId) {
      const draft = await load(listId);
      if (!draft || draft.status !== 'draft') return undefined;
      if (replacesListId !== undefined) {
        await database
          .update(schoolSupplyLists)
          .set({
            status: 'archived',
            archivedAt: new Date(),
            replacedById: listId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(schoolSupplyLists.id, replacesListId),
              eq(schoolSupplyLists.businessPartnerId, draft.businessPartnerId),
              eq(schoolSupplyLists.status, 'published'),
            ),
          );
      }
      for (const [index, snapshot] of snapshots.entries()) {
        const item = draft.items[index];
        if (!item) continue;
        await database
          .update(schoolSupplyListItems)
          .set({
            productNameEn: snapshot.productName.en,
            productNameAr: snapshot.productName.ar,
            sku: snapshot.sku,
            unitPrice: snapshot.basePrice,
            updatedAt: new Date(),
          })
          .where(
            and(eq(schoolSupplyListItems.listId, listId), eq(schoolSupplyListItems.id, item.id)),
          );
      }
      const [row] = await database
        .update(schoolSupplyLists)
        .set({
          status: 'published',
          publicCode: crypto.randomUUID().replaceAll('-', ''),
          replacesListId,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(schoolSupplyLists.id, listId), eq(schoolSupplyLists.status, 'draft')))
        .returning();
      if (!row) return undefined;
      return load(row.id, row.businessPartnerId);
    },
    async clone(listId, actorId) {
      const source = await load(listId);
      if (!source || source.status !== 'published') return undefined;
      const [row] = await database
        .insert(schoolSupplyLists)
        .values({
          businessPartnerId: source.businessPartnerId,
          createdBy: actorId,
          sourceListId: source.id,
          academicYear: source.academicYear,
          schoolName: source.schoolName,
          grade: source.grade,
          titleEn: source.title.en,
          titleAr: source.title.ar,
        })
        .returning();
      await database.insert(schoolSupplyListItems).values(
        source.items.map((item) => ({
          listId: row!.id,
          variantId: item.variantId,
          quantity: item.quantity,
          exactItem: item.exactItem ? 1 : 0,
          productNameEn: item.productName.en,
          productNameAr: item.productName.ar,
          sku: item.sku,
          labelEn: item.label.en,
          labelAr: item.label.ar,
          unitPrice: item.unitPrice,
        })),
      );
      return (await load(row!.id, source.businessPartnerId))!;
    },
    async byPublicCode(code) {
      const [row] = await database
        .select()
        .from(schoolSupplyLists)
        .where(
          and(eq(schoolSupplyLists.publicCode, code), eq(schoolSupplyLists.status, 'published')),
        );
      if (!row) return undefined;
      const items = await database
        .select()
        .from(schoolSupplyListItems)
        .where(eq(schoolSupplyListItems.listId, row.id))
        .orderBy(asc(schoolSupplyListItems.id));
      return mapList(row, items);
    },
  };
}
