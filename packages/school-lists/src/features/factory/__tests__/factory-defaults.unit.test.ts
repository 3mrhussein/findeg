import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import {
  createAdminSchoolSupplyListService,
  createSchoolDirectory,
  createSchoolSupplyListReader,
  createSchoolSupplyListService,
} from '../index';

const mocks = vi.hoisted(() => ({
  getPartnerSchoolByCode: vi.fn(),
  getPartnerSchoolFilterOptions: vi.fn(),
  searchPartnerSchools: vi.fn(),
  getPublicSupplyListByCode: vi.fn(),
  listSupplyListsForPartner: vi.fn(),
  listSchoolSupplyLists: vi.fn(),
  listSchoolListPartners: vi.fn(),
  listAttributeValuesForCategory: vi.fn(),
  findVariantCandidates: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@findeg/db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/db')>()),
  getPartnerSchoolByCode: mocks.getPartnerSchoolByCode,
  getPartnerSchoolFilterOptions: mocks.getPartnerSchoolFilterOptions,
  searchPartnerSchools: mocks.searchPartnerSchools,
  getPublicSupplyListByCode: mocks.getPublicSupplyListByCode,
  listSupplyListsForPartner: mocks.listSupplyListsForPartner,
  listSchoolSupplyLists: mocks.listSchoolSupplyLists,
  listSchoolListPartners: mocks.listSchoolListPartners,
  listAttributeValuesForCategory: mocks.listAttributeValuesForCategory,
  findVariantCandidates: mocks.findVariantCandidates,
}));

// The factories without an injected database load the shared connection lazily.
vi.mock('@findeg/db/connection', () => ({
  db: { transaction: (run: (tx: unknown) => unknown) => mocks.transaction(run) },
}));

const reader = {
  permissionCodes: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ],
  kind: 'staff' as const,
  userId: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.transaction.mockImplementation((run: (tx: unknown) => unknown) => run({}));
});

describe('school list factories without an injected database', () => {
  it('opens the shared connection lazily for the directory', async () => {
    mocks.getPartnerSchoolByCode.mockResolvedValue({ code: 'SCH-1' });
    expect(await createSchoolDirectory().getByCode('SCH-1')).toEqual({ code: 'SCH-1' });
  });

  it('opens the shared connection lazily for the public reader', async () => {
    mocks.getPublicSupplyListByCode.mockResolvedValue(null);
    expect(
      await createSchoolSupplyListReader().getByPublicCode('0123456789abcdef0123456789abcdef'),
    ).toEqual({ success: false, error: 'not-found' });
    expect(mocks.transaction).toHaveBeenCalledOnce();
  });

  it('opens the shared connection lazily for the lifecycle service', async () => {
    mocks.listSupplyListsForPartner.mockResolvedValue([]);
    expect(await createSchoolSupplyListService().listForPartner(reader, 3)).toEqual({
      success: true,
      data: [],
    });
  });

  it('opens the shared connection lazily for the administration reads', async () => {
    mocks.listSchoolListPartners.mockResolvedValue([{ id: 3 }]);
    mocks.listSchoolSupplyLists.mockResolvedValue([{ id: 7 }]);
    const admin = createAdminSchoolSupplyListService();
    expect(await admin.listPartnerOptions(reader)).toEqual({ success: true, data: [{ id: 3 }] });
    expect(await admin.listAll(reader, { status: 'draft' } as never)).toEqual({
      success: true,
      data: [{ id: 7 }],
    });
    expect(mocks.listSchoolSupplyLists).toHaveBeenCalledWith(expect.anything(), {
      status: 'draft',
    });
  });
});

describe('school list factories with an injected database', () => {
  const injected = { transaction: (run: (tx: unknown) => unknown) => run({}) } as never;

  it('uses the injected database for every reader and writer', async () => {
    mocks.getPartnerSchoolByCode.mockResolvedValue({ code: 'SCH-2' });
    mocks.listSupplyListsForPartner.mockResolvedValue([]);
    mocks.listSchoolListPartners.mockResolvedValue([]);
    expect(await createSchoolDirectory({ db: injected }).getByCode('SCH-2')).toEqual({
      code: 'SCH-2',
    });
    expect(await createSchoolSupplyListService({ db: injected }).listForPartner(reader, 3)).toEqual(
      { success: true, data: [] },
    );
    expect(
      await createAdminSchoolSupplyListService({ db: injected }).listPartnerOptions(reader),
    ).toEqual({ success: true, data: [] });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe('administration authoring pickers wired by the factory', () => {
  const writer = { ...reader, permissionCodes: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE] };

  it('queries specification options and variant candidates through the connection', async () => {
    mocks.listAttributeValuesForCategory.mockResolvedValue([
      { attributeKey: 'color', values: ['blue'] },
    ]);
    mocks.findVariantCandidates.mockResolvedValue([{ variantId: 5 }]);
    const admin = createAdminSchoolSupplyListService();
    expect(await admin.listSpecificationOptions(writer, 2)).toEqual({
      success: true,
      data: [{ attributeKey: 'color', values: ['blue'] }],
    });
    expect(await admin.listVariantCandidates(writer, 2)).toEqual({
      success: true,
      data: [{ variantId: 5 }],
    });
  });
});
