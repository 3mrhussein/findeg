import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '@findeg/db/schema';
import {
  attributes,
  businessPartners,
  categories,
  inventoryBalances,
  partnerSchoolProfiles,
  products,
  productVariants,
  schoolSupplyListItems,
  schoolSupplyLists,
  variantAttributes,
  warehouses,
} from '@findeg/db/schema';
import {
  connectToTestDatabase,
  runConcurrently,
  waitUntilBlocked,
  type TestDatabase,
} from '../../../testing/postgres';
import {
  createSchoolSupplyListService,
  type ISchoolSupplyListService,
  type SupplyListResult,
  type SupplyListStaffActor,
  type UpdateSupplyListDraftInput,
} from '../index';

const staff: SupplyListStaffActor = { kind: 'staff', userId: 1, activeRoleIds: ['system_admin'] };
const writer: SupplyListStaffActor = {
  kind: 'staff',
  userId: 2,
  permissionCodes: ['admin.schoollists.write'],
};
const reader: SupplyListStaffActor = {
  kind: 'staff',
  userId: 3,
  permissionCodes: ['admin.schoollists.read'],
};

function data<T>(result: SupplyListResult<T>): T {
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

describe('Staff School Supply List lifecycle on real Postgres', () => {
  let testDb: TestDatabase;
  let service: ISchoolSupplyListService;
  let sequence = 0;
  const now = new Date('2026-10-02T12:00:00Z');

  beforeAll(() => {
    testDb = connectToTestDatabase();
    service = createSchoolSupplyListService({ db: testDb.db, clock: () => now });
  });
  afterAll(async () => testDb.close());

  async function partnerSchool() {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({
        code: `lifecycle-school-${sequence}`,
        nameEn: 'Partner School',
        nameAr: 'مدرسة',
      })
      .returning();
    await testDb.db.insert(partnerSchoolProfiles).values({
      businessPartnerId: partner.id,
      governorate: 'Cairo',
      area: 'Maadi',
      schoolType: 'private',
      academicSystem: 'national',
      logoUrl: '/school.png',
    });
    return partner.id;
  }

  async function variant(
    options: {
      productActive?: boolean;
      variantActive?: boolean;
      stock?: number;
      reserved?: number;
      warehouseActive?: boolean;
    } = {},
  ) {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `lifecycle-category-${sequence}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `lifecycle-product-${sequence}`,
        localizedName: { en: 'Blue pen', ar: 'قلم أزرق' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: category.id,
        isActive: options.productActive ?? true,
      })
      .returning();
    const [row] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `LIFECYCLE-${sequence}`,
        basePrice: '12.50',
        isActive: options.variantActive ?? true,
      })
      .returning();
    if (options.stock !== undefined) {
      const [warehouse] = await testDb.db
        .insert(warehouses)
        .values({
          code: `lifecycle-warehouse-${sequence}`,
          name: 'Main',
          isActive: options.warehouseActive ?? true,
        })
        .returning();
      await testDb.db.insert(inventoryBalances).values({
        variantId: row.id,
        warehouseId: warehouse.id,
        onHand: options.stock,
        reserved: options.reserved ?? 0,
      });
    }
    return { ...row, productId: product.id, categoryId: category.id };
  }

  async function draft(businessPartnerId?: number, grade = 'Grade 1', academicYear = '2026/2027') {
    return data(
      await service.createDraft(staff, {
        businessPartnerId: businessPartnerId ?? (await partnerSchool()),
        grade,
        academicYear,
        localizedTitle: { en: grade, ar: 'قائمة' },
        localizedDescription: { en: 'Supplies' },
        heroImageUrl: '/supplies.png',
      }),
    );
  }

  async function readyDraft(businessPartnerId?: number, grade?: string, academicYear?: string) {
    const list = await draft(businessPartnerId, grade, academicYear);
    const defaultVariant = await variant({ stock: 3 });
    const item = data(
      await service.addItem(staff, list.id, {
        variantId: defaultVariant.id,
        exactItem: true,
        quantity: 2,
        localizedLabel: { en: 'Pen', ar: 'قلم' },
      }),
    );
    return { list, item, defaultVariant };
  }

  it('creates the new tables alongside legacy tables, with a school profile and draft defaults', async () => {
    const list = await draft();
    expect(list).toMatchObject({
      status: 'draft',
      publicCode: null,
      publishedAt: null,
      archivedAt: null,
      items: [],
    });
    const [profile] = await testDb.db
      .select()
      .from(partnerSchoolProfiles)
      .where(eq(partnerSchoolProfiles.businessPartnerId, list.businessPartnerId));
    expect(profile).toMatchObject({
      governorate: 'Cairo',
      schoolType: 'private',
      academicSystem: 'national',
    });
    const [legacy] =
      await testDb.sql`select to_regclass('school_engine.school_lists') as lists, to_regclass('school_engine.school_list_items') as items`;
    expect(legacy.lists).not.toBeNull();
    expect(legacy.items).not.toBeNull();
  });

  it('requires Staff write authorization on every mutation, and read authorization on reads', async () => {
    const { list, item } = await readyDraft();
    const forbidden: SupplyListStaffActor = { kind: 'staff', userId: 1 };
    const failures = await Promise.all([
      service.createDraft(forbidden, {
        businessPartnerId: list.businessPartnerId,
        grade: '2',
        academicYear: '2026',
        localizedTitle: { en: 'List' },
      }),
      service.cloneToDraft(forbidden, list.id),
      service.updateDraft(forbidden, list.id, {}),
      service.addItem(forbidden, list.id, { localizedLabel: { en: 'X' } }),
      service.updateItem(forbidden, list.id, item.id, {}),
      service.removeItem(forbidden, list.id, item.id),
      service.reorderItems(forbidden, list.id, [item.id]),
      service.publish(forbidden, list.id),
      service.archive(forbidden, list.id),
      service.getById(forbidden, list.id),
      service.publish(reader, list.id),
      service.publish(
        {
          kind: 'partner',
          userId: 1,
          activeRoleIds: ['system_admin'],
        } as unknown as SupplyListStaffActor,
        list.id,
      ),
    ]);
    for (const failure of failures) expect(failure).toEqual({ success: false, error: 'forbidden' });
    expect(data(await service.getById(reader, list.id)).id).toBe(list.id);
    expect(data(await service.publish(writer, list.id)).list.status).toBe('published');
  });

  it('validates IDs and content, and only drafts for a Partner School', async () => {
    const schoolId = await partnerSchool();
    expect(
      await service.createDraft(staff, {
        businessPartnerId: schoolId,
        grade: ' ',
        academicYear: '2026',
        localizedTitle: {},
      }),
    ).toEqual({ success: false, error: 'invalid-input' });
    expect(await service.getById(staff, -1)).toEqual({ success: false, error: 'invalid-input' });
    expect(await service.getById(staff, 2_000_000_000)).toEqual({
      success: false,
      error: 'not-found',
    });
    const [nonSchool] = await testDb.db
      .insert(businessPartners)
      .values({ code: 'lifecycle-non-school', nameEn: 'Business', nameAr: 'شركة' })
      .returning();
    expect(
      await service.createDraft(staff, {
        businessPartnerId: nonSchool.id,
        grade: '1',
        academicYear: '2026',
        localizedTitle: { en: 'List' },
      }),
    ).toEqual({ success: false, error: 'partner-school-not-found' });
    const list = await draft(schoolId);
    expect(
      await service.addItem(staff, list.id, { quantity: 0, localizedLabel: { en: 'X' } }),
    ).toEqual({ success: false, error: 'invalid-input' });
    expect(
      await service.addItem(staff, list.id, { quantity: 1000, localizedLabel: { en: 'X' } }),
    ).toEqual({ success: false, error: 'invalid-input' });
    expect(await service.updateDraft(staff, list.id, { status: 'published' } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('edits, reorders and removes draft items without accepting foreign or duplicate IDs', async () => {
    const { list, item } = await readyDraft();
    const second = data(
      await service.addItem(staff, list.id, {
        localizedLabel: { en: 'Notebook' },
        required: false,
      }),
    );
    const other = await readyDraft();
    expect(
      data(
        await service.updateDraft(staff, list.id, {
          grade: 'Grade 2',
          localizedTitle: { en: 'New title' },
        }),
      ).grade,
    ).toBe('Grade 2');
    expect(
      data(
        await service.updateItem(staff, list.id, second.id, {
          quantity: 5,
          localizedNote: { ar: 'ملاحظة' },
        }),
      ).quantity,
    ).toBe(5);
    expect(await service.updateItem(staff, list.id, other.item.id, { quantity: 5 })).toEqual({
      success: false,
      error: 'item-not-found',
    });
    expect(await service.removeItem(staff, list.id, other.item.id)).toEqual({
      success: false,
      error: 'item-not-found',
    });
    expect(await service.reorderItems(staff, list.id, [item.id, item.id])).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service.reorderItems(staff, list.id, [item.id, other.item.id])).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(await service.reorderItems(staff, list.id, [item.id])).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(
      data(await service.reorderItems(staff, list.id, [second.id, item.id])).items.map(
        (row) => row.id,
      ),
    ).toEqual([second.id, item.id]);
    data(await service.removeItem(staff, list.id, second.id));
    expect(data(await service.getById(staff, list.id)).items.map((row) => row.id)).toEqual([
      item.id,
    ]);
  });

  it('publishes with unique unguessable codes, bilingual name and SKU snapshots, without a price snapshot', async () => {
    const { list, defaultVariant } = await readyDraft();
    const published = data(await service.publish(staff, list.id));
    expect(published.warnings).toEqual([]);
    expect(published.list).toMatchObject({ status: 'published', publishedAt: now });
    expect(published.list.publicCode).toMatch(/^[0-9a-f]{32}$/);
    expect(published.list.items[0]).toMatchObject({
      productNameEnSnapshot: 'Blue pen',
      productNameArSnapshot: 'قلم أزرق',
      skuSnapshot: defaultVariant.sku,
    });
    const another = await readyDraft(list.businessPartnerId, 'Grade 3');
    const anotherPublished = data(await service.publish(staff, another.list.id));
    expect(anotherPublished.list.publicCode).not.toBe(published.list.publicCode);
    await testDb.db
      .update(products)
      .set({ localizedName: { en: 'Renamed', ar: 'جديد' } })
      .where(eq(products.id, defaultVariant.productId));
    await testDb.db
      .update(productVariants)
      .set({ sku: `${defaultVariant.sku}-NEW`, basePrice: '99.99' })
      .where(eq(productVariants.id, defaultVariant.id));
    expect(data(await service.getById(staff, list.id)).items[0]).toMatchObject({
      productNameEnSnapshot: 'Blue pen',
      productNameArSnapshot: 'قلم أزرق',
      skuSnapshot: defaultVariant.sku,
    });
    const priceColumns =
      await testDb.sql`select column_name from information_schema.columns where table_schema = 'school_engine' and table_name = 'school_supply_list_items' and column_name like '%price%'`;
    expect(priceColumns).toEqual([]);
    await expect(
      testDb.sql`update school_engine.school_supply_lists set public_code = ${published.list.publicCode} where id = ${another.list.id}`,
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('Exact mode clears substitution specifications while incomplete drafts remain editable', async () => {
    const { list, item, defaultVariant } = await readyDraft();
    const specification = { categoryId: defaultVariant.categoryId, attributes: {} };
    const exact = data(
      await service.addItem(staff, list.id, {
        variantId: defaultVariant.id,
        exactItem: true,
        specification,
        localizedLabel: { en: 'Exact pen' },
      }),
    );
    expect(exact.specification).toBeNull();
    data(await service.updateItem(staff, list.id, item.id, { exactItem: false, specification }));
    expect(
      data(await service.updateItem(staff, list.id, item.id, { exactItem: true })).specification,
    ).toBeNull();
    expect(
      data(await service.updateItem(staff, list.id, item.id, { specification })).specification,
    ).toBeNull();
    const incomplete = data(await service.updateItem(staff, list.id, item.id, { variantId: null }));
    expect(incomplete.variantId).toBeNull();
    expect(await service.publish(staff, list.id)).toEqual({
      success: false,
      error: 'default-unavailable',
    });
  });

  it('direct SQL cannot skip publication by archiving a draft', async () => {
    const list = await draft();
    await expect(
      testDb.sql`update school_engine.school_supply_lists set status = 'archived', public_code = 'cccccccccccccccccccccccccccccccc', published_at = now(), archived_at = now() where id = ${list.id}`,
    ).rejects.toMatchObject({ code: '23514' });
    expect(data(await service.getById(staff, list.id))).toMatchObject({
      status: 'draft',
      publicCode: null,
      archivedAt: null,
    });
  });

  it('refuses publication of an empty list or a missing default without changing the draft', async () => {
    const list = await draft();
    expect(await service.publish(staff, list.id)).toEqual({ success: false, error: 'empty-list' });
    data(await service.addItem(staff, list.id, { localizedLabel: { en: 'Unselected' } }));
    expect(await service.publish(staff, list.id)).toEqual({
      success: false,
      error: 'default-unavailable',
    });
    expect(data(await service.getById(staff, list.id))).toMatchObject({
      status: 'draft',
      publicCode: null,
    });
  });

  it.each([{ variantActive: false }, { productActive: false }])(
    'refuses inactive catalog defaults: %j',
    async (options) => {
      const list = await draft();
      const inactive = await variant(options);
      data(
        await service.addItem(staff, list.id, {
          variantId: inactive.id,
          exactItem: true,
          localizedLabel: { en: 'Inactive' },
        }),
      );
      expect(await service.publish(staff, list.id)).toEqual({
        success: false,
        error: 'default-unavailable',
      });
    },
  );

  it('refuses a default that fails category or attribute specifications; accepts an exact matching default', async () => {
    const { list, item, defaultVariant } = await readyDraft();
    const [attribute] = await testDb.db
      .insert(attributes)
      .values({
        key: `lifecycle-color-${++sequence}`,
        dataType: 'text',
        localizedLabel: { en: 'Color' },
      })
      .returning();
    await testDb.db
      .insert(variantAttributes)
      .values({ variantId: defaultVariant.id, attributeId: attribute.id, valueText: 'blue' });
    const [otherCategory] = await testDb.db
      .insert(categories)
      .values({ slug: `lifecycle-mismatch-${sequence}` })
      .returning();
    for (const specification of [
      { categoryId: otherCategory.id, attributes: {} },
      { categoryId: defaultVariant.categoryId, attributes: { [attribute.key]: 'red' } },
      { categoryId: defaultVariant.categoryId, attributes: { missing: 'x' } },
    ]) {
      data(await service.updateItem(staff, list.id, item.id, { exactItem: false, specification }));
      expect(await service.publish(staff, list.id)).toEqual({
        success: false,
        error: 'default-ineligible',
      });
      expect(data(await service.getById(staff, list.id)).items[0].skuSnapshot).toBeNull();
    }
    data(
      await service.updateItem(staff, list.id, item.id, {
        specification: {
          categoryId: defaultVariant.categoryId,
          attributes: { [attribute.key]: 'blue' },
        },
      }),
    );
    expect(data(await service.publish(staff, list.id)).list.status).toBe('published');
  });

  it.each([{}, { stock: 0 }, { stock: 5, reserved: 5 }, { stock: 5, warehouseActive: false }])(
    'warns on an out-of-stock default but still publishes: %j',
    async (options) => {
      const list = await draft();
      const defaultVariant = await variant(options);
      const item = data(
        await service.addItem(staff, list.id, {
          variantId: defaultVariant.id,
          localizedLabel: { en: 'Pen' },
        }),
      );
      const published = data(await service.publish(staff, list.id));
      expect(published.list.status).toBe('published');
      expect(published.warnings).toEqual([
        { code: 'default-out-of-stock', listItemId: item.id, variantId: defaultVariant.id },
      ]);
    },
  );

  it('sums available stock across active warehouses', async () => {
    const { list, defaultVariant } = await readyDraft();
    await testDb.db
      .update(inventoryBalances)
      .set({ onHand: 0 })
      .where(eq(inventoryBalances.variantId, defaultVariant.id));
    const [warehouse] = await testDb.db
      .insert(warehouses)
      .values({ code: `lifecycle-stock-${++sequence}`, name: 'Other' })
      .returning();
    await testDb.db
      .insert(inventoryBalances)
      .values({ variantId: defaultVariant.id, warehouseId: warehouse.id, onHand: 2, reserved: 1 });
    expect(data(await service.publish(staff, list.id)).warnings).toEqual([]);
  });

  it('enforces one published list per school/year/grade, allowing other slots and freeing archived slots', async () => {
    const first = await readyDraft();
    data(await service.publish(staff, first.list.id));
    const same = await readyDraft(first.list.businessPartnerId);
    expect(await service.publish(staff, same.list.id)).toEqual({
      success: false,
      error: 'slot-taken',
    });
    const nextYear = await readyDraft(first.list.businessPartnerId, 'Grade 1', '2027/2028');
    const otherGrade = await readyDraft(first.list.businessPartnerId, 'Grade 2');
    data(await service.publish(staff, nextYear.list.id));
    data(await service.publish(staff, otherGrade.list.id));
    data(await service.archive(staff, first.list.id));
    data(await service.publish(staff, same.list.id));
  });

  it('clones to a fresh draft and publishes a replacement with both sides of the chain committed', async () => {
    const { list } = await readyDraft();
    const original = data(await service.publish(staff, list.id)).list;
    const clone = data(await service.cloneToDraft(staff, list.id));
    expect(clone).toMatchObject({
      sourceListId: original.id,
      status: 'draft',
      publicCode: null,
      replacesListId: null,
    });
    expect(clone.items[0]).toMatchObject({
      quantity: 2,
      variantId: original.items[0].variantId,
      skuSnapshot: null,
    });
    expect(clone.items[0].id).not.toBe(original.items[0].id);
    const replacement = data(await service.publish(staff, clone.id)).list;
    expect(replacement.replacesListId).toBe(original.id);
    expect(replacement.publicCode).not.toBe(original.publicCode);
    expect(data(await service.getById(staff, original.id))).toMatchObject({
      status: 'archived',
      replacedById: clone.id,
      archivedAt: now,
      publicCode: original.publicCode,
    });
    expect(await service.publish(staff, clone.id)).toEqual({ success: false, error: 'not-draft' });
  });

  it.each<UpdateSupplyListDraftInput>([{ grade: 'Grade 2' }, { academicYear: '2027/2028' }])(
    'a clone edited into another slot preserves its source: %j',
    async (target) => {
      const { list } = await readyDraft();
      data(await service.publish(staff, list.id));
      const clone = data(await service.cloneToDraft(staff, list.id));
      data(await service.updateDraft(staff, clone.id, target));
      const published = data(await service.publish(staff, clone.id)).list;
      expect(published).toMatchObject({ sourceListId: list.id, replacesListId: null, ...target });
      expect(data(await service.getById(staff, list.id)).status).toBe('published');
    },
  );

  it('archives without a replacement, never un-archives, and can clone an archived version with a new code', async () => {
    const { list } = await readyDraft();
    expect(await service.archive(staff, list.id)).toEqual({
      success: false,
      error: 'invalid-transition',
    });
    expect(await service.cloneToDraft(staff, list.id)).toEqual({
      success: false,
      error: 'invalid-transition',
    });
    const original = data(await service.publish(staff, list.id)).list;
    expect(data(await service.archive(staff, list.id))).toMatchObject({
      status: 'archived',
      replacedById: null,
      archivedAt: now,
    });
    expect(await service.archive(staff, list.id)).toEqual({
      success: false,
      error: 'invalid-transition',
    });
    const clone = data(await service.cloneToDraft(staff, list.id));
    const revived = data(await service.publish(staff, clone.id)).list;
    expect(revived.publicCode).not.toBe(original.publicCode);
    expect(revived.replacesListId).toBeNull();
    expect(data(await service.getById(staff, list.id)).status).toBe('archived');
  });

  it.each(['published', 'archived'] as const)(
    'rejects list and item edits in the service and direct SQL when %s',
    async (status) => {
      const { list, item } = await readyDraft();
      data(await service.publish(staff, list.id));
      if (status === 'archived') data(await service.archive(staff, list.id));
      for (const result of await Promise.all([
        service.updateDraft(staff, list.id, { grade: 'Other' }),
        service.addItem(staff, list.id, { localizedLabel: { en: 'Another' } }),
        service.updateItem(staff, list.id, item.id, { quantity: 3 }),
        service.removeItem(staff, list.id, item.id),
        service.reorderItems(staff, list.id, [item.id]),
      ]))
        expect(result).toEqual({ success: false, error: 'not-draft' });
      const queries = [
        () =>
          testDb.sql`update school_engine.school_supply_lists set localized_title = '{"en":"tampered"}' where id = ${list.id}`,
        () => testDb.sql`delete from school_engine.school_supply_lists where id = ${list.id}`,
        () =>
          testDb.sql`update school_engine.school_supply_list_items set quantity = 3 where id = ${item.id}`,
        () =>
          testDb.sql`update school_engine.school_supply_list_items set specification = '{"categoryId":1,"attributes":{}}' where id = ${item.id}`,
        () => testDb.sql`delete from school_engine.school_supply_list_items where id = ${item.id}`,
        () =>
          testDb.sql`insert into school_engine.school_supply_list_items (list_id, localized_label) values (${list.id}, '{"en":"injected"}')`,
        () =>
          testDb.sql`update school_engine.school_supply_lists set status = 'draft', public_code = null, published_at = null, archived_at = null where id = ${list.id}`,
      ];
      for (const query of queries) await expect(query()).rejects.toMatchObject({ code: '23514' });
      await testDb.sql`update school_engine.school_supply_lists set updated_at = now() where id = ${list.id}`;
      expect(data(await service.getById(staff, list.id)).items).toHaveLength(1);
    },
  );

  it('allows direct archival columns but refuses un-archiving or moving items across frozen lists', async () => {
    const first = await readyDraft();
    const second = await readyDraft();
    data(await service.publish(staff, first.list.id));
    await expect(
      testDb.sql`update school_engine.school_supply_list_items set list_id = ${first.list.id} where id = ${second.item.id}`,
    ).rejects.toMatchObject({ code: '23514' });
    await expect(
      testDb.sql`update school_engine.school_supply_list_items set list_id = ${second.list.id} where id = ${first.item.id}`,
    ).rejects.toMatchObject({ code: '23514' });
    await testDb.sql`update school_engine.school_supply_lists set status = 'archived', archived_at = now(), updated_at = now() where id = ${first.list.id}`;
    await expect(
      testDb.sql`update school_engine.school_supply_lists set status = 'published', archived_at = null where id = ${first.list.id}`,
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('backstops the published slot and public code uniqueness in direct SQL', async () => {
    const first = await readyDraft();
    const original = data(await service.publish(staff, first.list.id)).list;
    const same = await readyDraft(first.list.businessPartnerId);
    await expect(
      testDb.sql`update school_engine.school_supply_lists set status = 'published', public_code = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', published_at = now() where id = ${same.list.id}`,
    ).rejects.toMatchObject({ code: '23505', constraint_name: 'uq_supply_list_published_slot' });
    const other = await draft(first.list.businessPartnerId, 'Grade 10');
    await expect(
      testDb.sql`update school_engine.school_supply_lists set status = 'published', public_code = ${original.publicCode}, published_at = now() where id = ${other.id}`,
    ).rejects.toMatchObject({
      code: '23505',
      constraint_name: 'school_supply_lists_public_code_unique',
    });
  });

  it('rolls back snapshots and replacement archival if publication fails technically', async () => {
    const { list } = await readyDraft();
    data(await service.publish(staff, list.id));
    const clone = data(await service.cloneToDraft(staff, list.id));
    // Force a failure only after snapshots and source archival have been written.
    await testDb.sql.unsafe(
      `create function school_engine.fail_lifecycle_test_publish() returns trigger language plpgsql as $$ begin if NEW.id = ${clone.id} and NEW.status = 'published' then raise exception 'forced publication failure'; end if; return NEW; end $$`,
    );
    await testDb.sql`create trigger fail_lifecycle_test_publish before update on school_engine.school_supply_lists for each row execute function school_engine.fail_lifecycle_test_publish()`;
    try {
      await expect(service.publish(staff, clone.id)).rejects.toMatchObject({
        cause: { message: 'forced publication failure' },
      });
    } finally {
      await testDb.sql`drop trigger fail_lifecycle_test_publish on school_engine.school_supply_lists`;
      await testDb.sql`drop function school_engine.fail_lifecycle_test_publish()`;
    }
    expect(data(await service.getById(staff, list.id))).toMatchObject({
      status: 'published',
      replacedById: null,
      archivedAt: null,
    });
    const unchanged = data(await service.getById(staff, clone.id));
    expect(unchanged).toMatchObject({ status: 'draft', publicCode: null, replacesListId: null });
    expect(unchanged.items[0].skuSnapshot).toBeNull();
  });

  it('two concurrent publishes into one slot leave exactly one published list', async () => {
    const first = await readyDraft();
    const second = await readyDraft(first.list.businessPartnerId);
    const [a, b] = await runConcurrently(
      async (sql) =>
        createSchoolSupplyListService({ db: drizzle(sql, { schema }) }).publish(
          staff,
          first.list.id,
        ),
      async (sql) =>
        createSchoolSupplyListService({ db: drizzle(sql, { schema }) }).publish(
          staff,
          second.list.id,
        ),
    );
    expect([a, b].filter((result) => result.success)).toHaveLength(1);
    expect([a, b].filter((result) => !result.success)).toEqual([
      { success: false, error: 'slot-taken' },
    ]);
    const rows = await testDb.db
      .select()
      .from(schoolSupplyLists)
      .where(eq(schoolSupplyLists.businessPartnerId, first.list.businessPartnerId));
    expect(rows.filter((row) => row.status === 'published')).toHaveLength(1);
    const loser = rows.find((row) => row.status === 'draft')!;
    expect(loser.publicCode).toBeNull();
    expect(
      (
        await testDb.db
          .select()
          .from(schoolSupplyListItems)
          .where(eq(schoolSupplyListItems.listId, loser.id))
      )[0].skuSnapshot,
    ).toBeNull();
  });

  it('concurrent clones cannot both replace the same source', async () => {
    const { list } = await readyDraft();
    data(await service.publish(staff, list.id));
    const first = data(await service.cloneToDraft(staff, list.id));
    const second = data(await service.cloneToDraft(staff, list.id));
    const [a, b] = await runConcurrently(
      async (sql) =>
        createSchoolSupplyListService({ db: drizzle(sql, { schema }) }).publish(staff, first.id),
      async (sql) =>
        createSchoolSupplyListService({ db: drizzle(sql, { schema }) }).publish(staff, second.id),
    );
    expect([a, b].filter((result) => result.success)).toHaveLength(1);
    expect([a, b].filter((result) => !result.success)).toEqual([
      { success: false, error: 'slot-taken' },
    ]);
    const source = data(await service.getById(staff, list.id));
    expect(source.status).toBe('archived');
    const winner = data(a.success ? a : b).list;
    expect(source.replacedById).toBe(winner.id);
    expect(winner.replacesListId).toBe(source.id);
  });

  it('a direct item edit queued behind publication rechecks the frozen parent', async () => {
    const { list, item } = await readyDraft();
    let releaseEdit!: () => void;
    const parentLocked = new Promise<void>((resolve) => {
      releaseEdit = resolve;
    });
    await runConcurrently(
      async (sql, peer) =>
        sql.begin(async (tx) => {
          await tx`select id from school_engine.school_supply_lists where id = ${list.id} for update`;
          releaseEdit();
          await waitUntilBlocked(testDb.sql, peer.pid);
          await tx`update school_engine.school_supply_lists set status = 'published', public_code = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', published_at = now() where id = ${list.id}`;
        }),
      async (sql) => {
        await parentLocked;
        await expect(
          sql`update school_engine.school_supply_list_items set quantity = 99 where id = ${item.id}`,
        ).rejects.toMatchObject({ code: '23514' });
      },
    );
    expect(data(await service.getById(staff, list.id)).items[0].quantity).toBe(2);
  });
});
