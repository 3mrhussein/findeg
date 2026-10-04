import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  attributes,
  brands,
  businessPartners,
  categories,
  inventoryBalances,
  partnerSchoolProfiles,
  products,
  productVariants,
  variantAttributes,
  warehouses,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createSchoolSupplyListReader,
  createSchoolSupplyListService,
  type ISchoolSupplyListReader,
  type ISchoolSupplyListService,
  type SupplyListItemInput,
  type SupplyListStaffActor,
} from '../index';

const staff: SupplyListStaffActor = { kind: 'staff', userId: 1, activeRoleIds: ['system_admin'] };

describe('public School Supply List read on real Postgres', () => {
  let testDb: TestDatabase;
  let service: ISchoolSupplyListService;
  let reader: ISchoolSupplyListReader;
  let sequence = 0;

  beforeAll(() => {
    testDb = connectToTestDatabase();
    service = createSchoolSupplyListService({ db: testDb.db });
    reader = createSchoolSupplyListReader({ db: testDb.db });
  });
  afterAll(async () => testDb.close());

  async function school() {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `read-school-${sequence}`, nameEn: 'Nile School', nameAr: 'مدرسة النيل' })
      .returning();
    await testDb.db.insert(partnerSchoolProfiles).values({
      businessPartnerId: partner.id,
      governorate: 'Cairo',
      logoUrl: '/nile.png',
    });
    return partner.id;
  }

  async function category() {
    sequence += 1;
    const [row] = await testDb.db
      .insert(categories)
      .values({ slug: `read-category-${sequence}` })
      .returning();
    return row.id;
  }

  async function attribute(label: string) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(attributes)
      .values({ key: `read-${label}-${sequence}`, dataType: 'text', localizedLabel: { en: label } })
      .returning();
    return row;
  }

  async function warehouse(isActive = true) {
    sequence += 1;
    const [row] = await testDb.db
      .insert(warehouses)
      .values({ code: `read-wh-${sequence}`, name: 'WH', isActive })
      .returning();
    return row.id;
  }

  async function variant(
    categoryId: number,
    options: {
      price?: string;
      brand?: string;
      attrs?: { attribute: { id: number }; value: string }[];
      active?: boolean;
    } = {},
  ) {
    sequence += 1;
    let brandId: number | undefined;
    if (options.brand) {
      const [brand] = await testDb.db
        .insert(brands)
        .values({ slug: `read-brand-${sequence}`, localizedName: { en: options.brand } })
        .returning();
      brandId = brand.id;
    }
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `read-product-${sequence}`,
        localizedName: { en: `Pen ${sequence}`, ar: `قلم ${sequence}` },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId,
        brandId,
      })
      .returning();
    const [row] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `READ-${sequence}`,
        basePrice: options.price ?? '10.00',
        isActive: options.active ?? true,
      })
      .returning();
    if (options.attrs?.length) {
      await testDb.db.insert(variantAttributes).values(
        options.attrs.map((a) => ({
          variantId: row.id,
          attributeId: a.attribute.id,
          valueText: a.value,
        })),
      );
    }
    return row;
  }

  async function stock(variantId: number, warehouseId: number, onHand: number, reserved = 0) {
    await testDb.db.insert(inventoryBalances).values({ variantId, warehouseId, onHand, reserved });
  }

  async function publishedList(items: SupplyListItemInput[], partnerId?: number) {
    const created = await service.createDraft(staff, {
      businessPartnerId: partnerId ?? (await school()),
      grade: 'Grade 1',
      academicYear: '2026/2027',
      localizedTitle: { en: 'Grade 1 supplies', ar: 'أدوات' },
    });
    if (!created.success) throw new Error(created.error);
    for (const item of items) {
      const result = await service.addItem(staff, created.data.id, item);
      if (!result.success) throw new Error(result.error);
    }
    const published = await service.publish(staff, created.data.id);
    if (!published.success) throw new Error(published.error);
    return published.data.list;
  }

  async function read(code: string | null) {
    const result = await reader.getByPublicCode(code!);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  it('returns the list, school, status and items with defaults and eligible variants', async () => {
    const cat = await category();
    const color = await attribute('color');
    const size = await attribute('size');
    const wh = await warehouse();
    const def = await variant(cat, {
      price: '10.00',
      brand: 'Acme',
      attrs: [
        { attribute: color, value: 'blue' },
        { attribute: size, value: 'M' },
      ],
    });
    const alt = await variant(cat, {
      price: '12.50',
      brand: 'Zed',
      attrs: [
        { attribute: color, value: 'red' },
        { attribute: size, value: 'M' },
      ],
    });
    const exact = await variant(await category(), { price: '5.00' });
    await stock(def.id, wh, 4);
    await stock(alt.id, wh, 2);
    const list = await publishedList([
      {
        variantId: def.id,
        exactItem: false,
        specification: { categoryId: cat, attributes: { [size.key]: 'M' } },
        quantity: 3,
        required: true,
        localizedLabel: { en: 'Pen', ar: 'قلم' },
        sortOrder: 0,
      },
      {
        variantId: exact.id,
        exactItem: true,
        quantity: 1,
        required: false,
        localizedLabel: { en: 'Ruler' },
        sortOrder: 1,
      },
    ]);

    const result = await read(list.publicCode);
    expect(result).toMatchObject({
      publicCode: list.publicCode,
      status: 'published',
      grade: 'Grade 1',
      academicYear: '2026/2027',
      replacementPublicCode: null,
      offer: null,
      school: { id: list.businessPartnerId, nameEn: 'Nile School', nameAr: 'مدرسة النيل' },
    });
    expect(result.items).toHaveLength(2);
    const [pen, ruler] = result.items;
    expect(pen).toMatchObject({
      required: true,
      quantity: 3,
      exactItem: false,
      specification: { categoryId: cat, attributes: { [size.key]: 'M' } },
      defaultVariant: { variantId: def.id, price: '10.00', inStock: true },
    });
    expect(pen.eligibleVariants.map((v) => v.variantId).sort()).toEqual([def.id, alt.id].sort());
    expect(pen.eligibleVariants.find((v) => v.variantId === alt.id)).toMatchObject({
      price: '12.50',
      brand: { en: 'Zed' },
      inStock: true,
      differingAttributes: { [color.key]: 'red' },
    });
    expect(pen.eligibleVariants.find((v) => v.variantId === def.id)!.differingAttributes).toEqual(
      {},
    );
    expect(ruler).toMatchObject({ exactItem: true, required: false, specification: null });
    expect(ruler.eligibleVariants.map((v) => v.variantId)).toEqual([exact.id]);
  });

  it('excludes inactive variants from eligible variants', async () => {
    const cat = await category();
    const def = await variant(cat);
    const inactive = await variant(cat, { active: false });
    const list = await publishedList([
      {
        variantId: def.id,
        exactItem: false,
        specification: { categoryId: cat, attributes: {} },
        localizedLabel: { en: 'Pen' },
      },
    ]);
    const ids = (await read(list.publicCode)).items[0].eligibleVariants.map((v) => v.variantId);
    expect(ids).toContain(def.id);
    expect(ids).not.toContain(inactive.id);
  });

  it('counts only available stock in active warehouses', async () => {
    const cat = await category();
    const [wh, closed] = [await warehouse(), await warehouse(false)];
    const inStock = await variant(cat);
    const fullyReserved = await variant(cat);
    const closedOnly = await variant(cat);
    const untracked = await variant(cat);
    await stock(inStock.id, wh, 1);
    await stock(inStock.id, closed, 5);
    await stock(fullyReserved.id, wh, 3, 3);
    await stock(closedOnly.id, closed, 9);
    const list = await publishedList([
      {
        variantId: inStock.id,
        exactItem: false,
        specification: { categoryId: cat, attributes: {} },
        localizedLabel: { en: 'Pen' },
      },
    ]);
    const byId = new Map(
      (await read(list.publicCode)).items[0].eligibleVariants.map((v) => [v.variantId, v]),
    );
    expect(byId.get(inStock.id)!.inStock).toBe(true);
    expect(byId.get(fullyReserved.id)!.inStock).toBe(false);
    expect(byId.get(closedOnly.id)!.inStock).toBe(false);
    expect(byId.get(untracked.id)!.inStock).toBe(false);
  });

  it('sums availability across warehouses to reach one unit', async () => {
    const cat = await category();
    const [wh1, wh2] = [await warehouse(), await warehouse()];
    const v = await variant(cat);
    await stock(v.id, wh1, 2, 2);
    await stock(v.id, wh2, 3, 2);
    const list = await publishedList([
      { variantId: v.id, exactItem: true, localizedLabel: { en: 'Pen' } },
    ]);
    expect((await read(list.publicCode)).items[0].defaultVariant.inStock).toBe(true);
  });

  it('reads an archived list with its replacement code, and without one', async () => {
    const cat = await category();
    const v = await variant(cat);
    const item: SupplyListItemInput = {
      variantId: v.id,
      exactItem: true,
      localizedLabel: { en: 'Pen' },
    };
    const original = await publishedList([item]);
    const clone = await service.cloneToDraft(staff, original.id);
    if (!clone.success) throw new Error(clone.error);
    const replaced = await service.publish(staff, clone.data.id);
    if (!replaced.success) throw new Error(replaced.error);

    const archived = await read(original.publicCode);
    expect(archived.status).toBe('archived');
    expect(archived.replacementPublicCode).toBe(replaced.data.list.publicCode);

    const solo = await publishedList([item]);
    await service.archive(staff, solo.id);
    expect(await read(solo.publicCode)).toMatchObject({
      status: 'archived',
      replacementPublicCode: null,
    });
  });

  it('returns not found for draft, unknown and malformed codes', async () => {
    const draft = await service.createDraft(staff, {
      businessPartnerId: await school(),
      grade: 'G',
      academicYear: '2026',
      localizedTitle: { en: 'Draft' },
    });
    if (!draft.success) throw new Error(draft.error);
    for (const code of ['a'.repeat(32), 'not-a-code', '', 'A'.repeat(32), '1'.repeat(33)]) {
      expect(await reader.getByPublicCode(code)).toEqual({ success: false, error: 'not-found' });
    }
  });

  it.each(['suspended', 'closed'] as const)(
    "reads a %s Business Partner's published list like any other (ADR-0012)",
    async (status) => {
      const v = await variant(await category());
      const list = await publishedList([
        { variantId: v.id, exactItem: true, localizedLabel: { en: 'Pen' } },
      ]);
      await testDb.db
        .update(businessPartners)
        .set({ status })
        .where(eq(businessPartners.id, list.businessPartnerId));

      expect(await read(list.publicCode)).toMatchObject({
        status: 'published',
        items: [
          expect.objectContaining({ defaultVariant: expect.objectContaining({ variantId: v.id }) }),
        ],
      });
    },
  );
});
