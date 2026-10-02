import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  businessPartners,
  categories,
  partnerSchoolProfiles,
  products,
  productVariants,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createSchoolDirectory,
  createSchoolSupplyListService,
  type ISchoolDirectory,
  type ISchoolSupplyListService,
  type SupplyListResult,
  type SupplyListStaffActor,
} from '../index';

const staff: SupplyListStaffActor = { kind: 'staff', userId: 1, activeRoleIds: ['system_admin'] };

function data<T>(result: SupplyListResult<T>): T {
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

describe('Partner School directory on real Postgres', () => {
  let testDb: TestDatabase;
  let directory: ISchoolDirectory;
  let lists: ISchoolSupplyListService;
  let sequence = 0;
  // Unique per run so assertions do not depend on other files' rows.
  const tag = `dir${Date.now().toString(36)}`;

  beforeAll(() => {
    testDb = connectToTestDatabase();
    directory = createSchoolDirectory({ db: testDb.db });
    lists = createSchoolSupplyListService({ db: testDb.db });
  });
  afterAll(async () => testDb.close());

  async function school(
    options: {
      nameEn?: string;
      status?: 'onboarding' | 'active' | 'suspended' | 'closed';
      profile?: Partial<typeof partnerSchoolProfiles.$inferInsert> | null;
    } = {},
  ) {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({
        code: `${tag}-school-${sequence}`,
        nameEn: options.nameEn ?? `${tag} School ${sequence}`,
        nameAr: `مدرسة ${sequence}`,
        status: options.status ?? 'active',
      })
      .returning();
    if (options.profile !== null) {
      await testDb.db.insert(partnerSchoolProfiles).values({
        businessPartnerId: partner.id,
        governorate: 'Cairo',
        area: 'Maadi',
        schoolType: 'private',
        academicSystem: 'national',
        ...options.profile,
      });
    }
    return partner;
  }

  async function publishedList(businessPartnerId: number, grade: string, year = '2026/2027') {
    sequence += 1;
    const draft = data(
      await lists.createDraft(staff, {
        businessPartnerId,
        grade,
        academicYear: year,
        localizedTitle: { en: `${grade} list`, ar: 'قائمة' },
      }),
    );
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `${tag}-cat-${sequence}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `${tag}-product-${sequence}`,
        localizedName: { en: 'Pen', ar: 'قلم' },
        localizedDescription: { en: '' },
        localizedLongDescription: { en: '' },
        categoryId: category.id,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `${tag}-sku-${sequence}`,
        basePrice: '5.00',
      })
      .returning();
    data(
      await lists.addItem(staff, draft.id, {
        variantId: variant.id,
        exactItem: true,
        localizedLabel: { en: 'Pen', ar: 'قلم' },
      }),
    );
    return data(await lists.publish(staff, draft.id)).list;
  }

  it('searches Partner Schools by name, with their profile and published list count', async () => {
    const maadi = await school({ nameEn: `${tag} Maadi Language School` });
    await school({ nameEn: `${tag} Zamalek Academy`, profile: { area: 'Zamalek' } });
    await publishedList(maadi.id, 'Grade 1');
    await publishedList(maadi.id, 'Grade 2');

    const { items, totalCount } = await directory.searchSchools({
      query: `${tag} maadi`,
      page: 1,
      pageSize: 10,
    });

    expect(totalCount).toBe(1);
    expect(items).toEqual([
      expect.objectContaining({
        code: maadi.code,
        nameEn: `${tag} Maadi Language School`,
        nameAr: expect.any(String),
        governorate: 'Cairo',
        area: 'Maadi',
        schoolType: 'private',
        academicSystem: 'national',
        publishedListCount: 2,
      }),
    ]);
  });

  it('lists schools without published lists, sorted by name, and paginates', async () => {
    const a = await school({ nameEn: `${tag}-page A` });
    const b = await school({ nameEn: `${tag}-page B` });
    const c = await school({ nameEn: `${tag}-page C` });

    const first = await directory.searchSchools({ query: `${tag}-page`, page: 1, pageSize: 2 });
    const second = await directory.searchSchools({ query: `${tag}-page`, page: 2, pageSize: 2 });

    expect(first.totalCount).toBe(3);
    expect(first.items.map((s) => s.code)).toEqual([a.code, b.code]);
    expect(second.items.map((s) => s.code)).toEqual([c.code]);
    expect(first.items[0].publishedListCount).toBe(0);
  });

  it('filters by governorate, school type and academic system', async () => {
    const alex = await school({
      nameEn: `${tag}-filter alex`,
      profile: { governorate: 'Alexandria', schoolType: 'international', academicSystem: 'igcse' },
    });
    await school({ nameEn: `${tag}-filter cairo` });

    const byGovernorate = await directory.searchSchools({
      query: `${tag}-filter`,
      governorate: 'Alexandria',
      page: 1,
      pageSize: 10,
    });
    const byType = await directory.searchSchools({
      query: `${tag}-filter`,
      schoolType: 'international',
      page: 1,
      pageSize: 10,
    });
    const bySystem = await directory.searchSchools({
      query: `${tag}-filter`,
      academicSystem: 'igcse',
      page: 1,
      pageSize: 10,
    });

    for (const result of [byGovernorate, byType, bySystem]) {
      expect(result.items.map((s) => s.code)).toEqual([alex.code]);
    }
  });

  it('only lists schools that have a published list when asked', async () => {
    const withList = await school({ nameEn: `${tag}-only with` });
    await school({ nameEn: `${tag}-only without` });
    await publishedList(withList.id, 'Grade 3');

    const { items } = await directory.searchSchools({
      query: `${tag}-only`,
      withPublishedLists: true,
      page: 1,
      pageSize: 10,
    });

    expect(items.map((s) => s.code)).toEqual([withList.code]);
  });

  it('hides Business Partners that are not active Partner Schools', async () => {
    await school({ nameEn: `${tag}-hidden onboarding`, status: 'onboarding' });
    await school({ nameEn: `${tag}-hidden suspended`, status: 'suspended' });
    await school({ nameEn: `${tag}-hidden closed`, status: 'closed' });
    await school({ nameEn: `${tag}-hidden other partner`, profile: null });

    const { items, totalCount } = await directory.searchSchools({
      query: `${tag}-hidden`,
      page: 1,
      pageSize: 10,
    });

    expect(totalCount).toBe(0);
    expect(items).toEqual([]);
  });

  it('offers filter options from active Partner School profiles only', async () => {
    await school({
      nameEn: `${tag}-options`,
      profile: { governorate: `${tag}-gov`, schoolType: `${tag}-type`, academicSystem: null },
    });
    await school({
      nameEn: `${tag}-options closed`,
      status: 'closed',
      profile: { governorate: `${tag}-closed-gov` },
    });

    const options = await directory.getFilterOptions();

    expect(options.governorates).toContain(`${tag}-gov`);
    expect(options.governorates).not.toContain(`${tag}-closed-gov`);
    expect(options.schoolTypes).toContain(`${tag}-type`);
    expect([...options.governorates].sort()).toEqual(options.governorates);
  });

  it('shows a school profile with its published lists by public code, newest slot order, never archived or draft', async () => {
    const partner = await school({ nameEn: `${tag} Profile School` });
    const grade2 = await publishedList(partner.id, 'Grade 2');
    const grade1 = await publishedList(partner.id, 'Grade 1');
    const archived = await publishedList(partner.id, 'Grade 5');
    data(await lists.archive(staff, archived.id));
    data(
      await lists.createDraft(staff, {
        businessPartnerId: partner.id,
        grade: 'Grade 6',
        academicYear: '2026/2027',
        localizedTitle: { en: 'Draft list' },
      }),
    );

    const profile = await directory.getByCode(partner.code);

    expect(profile).toMatchObject({
      code: partner.code,
      nameEn: `${tag} Profile School`,
      governorate: 'Cairo',
      area: 'Maadi',
    });
    expect(profile?.lists.map((l) => l.publicCode)).toEqual([grade1.publicCode, grade2.publicCode]);
    expect(profile?.lists[0]).toMatchObject({
      grade: 'Grade 1',
      academicYear: '2026/2027',
      localizedTitle: { en: 'Grade 1 list', ar: 'قائمة' },
    });
    expect(JSON.stringify(profile)).not.toContain(archived.publicCode!);
  });

  it('gives a school with no published list an empty list collection', async () => {
    const partner = await school();

    expect((await directory.getByCode(partner.code))?.lists).toEqual([]);
  });

  it('returns null for an unknown code, a hidden partner or a non-school partner', async () => {
    const closed = await school({ status: 'closed' });
    const notSchool = await school({ profile: null });

    expect(await directory.getByCode('no-such-school')).toBeNull();
    expect(await directory.getByCode(closed.code)).toBeNull();
    expect(await directory.getByCode(notSchool.code)).toBeNull();
  });
});
