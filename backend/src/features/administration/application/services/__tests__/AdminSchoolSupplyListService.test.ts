import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import type {
  ISchoolSupplyListService,
  SupplyListItemInput,
  SupplyListStaffActor,
} from '../../../../school';
import { createAdministrationServices } from '../../..';

const mocks = vi.hoisted(() => ({
  db: {},
  lifecycle: {} as ISchoolSupplyListService,
  listSpecificationOptions: vi.fn(),
  listVariantCandidates: vi.fn(),
}));

vi.mock('../../../../school', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../school')>()),
  createSchoolSupplyListService: vi.fn(() => mocks.lifecycle),
}));

vi.mock('@findeg/db/queries/school-supply-lists', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/db/queries/school-supply-lists')>()),
  findVariantCandidates: mocks.listVariantCandidates,
  listAttributeValuesForCategory: mocks.listSpecificationOptions,
}));

vi.mock('@findeg/db/connection', () => ({ db: mocks.db }));

const writer: SupplyListStaffActor = {
  kind: 'staff',
  userId: 42,
  permissionCodes: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
};

describe('AdminSchoolSupplyListService', () => {
  let lifecycle: ISchoolSupplyListService;
  let service: ReturnType<typeof createAdministrationServices>['schoolSupplyLists'];

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.lifecycle = {} as ISchoolSupplyListService;
    lifecycle = mocks.lifecycle;
    service = createAdministrationServices().schoolSupplyLists;
  });

  it('returns catalog-backed specification options to authorized Staff', async () => {
    mocks.listSpecificationOptions.mockResolvedValue([
      { attributeKey: 'color', values: ['blue', 'red'] },
    ]);

    await expect(service.listSpecificationOptions(writer, 7)).resolves.toEqual({
      success: true,
      data: [{ attributeKey: 'color', values: ['blue', 'red'] }],
    });
  });

  it('rejects a free-typed specification value when adding an item', async () => {
    const addItem = vi.fn<
      Parameters<ISchoolSupplyListService['addItem']>,
      ReturnType<ISchoolSupplyListService['addItem']>
    >();
    lifecycle.addItem = addItem;
    mocks.listSpecificationOptions.mockResolvedValue([
      { attributeKey: 'color', values: ['blue', 'red'] },
    ]);
    const input: SupplyListItemInput = {
      variantId: 12,
      exactItem: false,
      specification: { categoryId: 7, attributes: { color: 'chartreuse' } },
      localizedLabel: { en: 'Notebook' },
    };

    await expect(service.addItem(writer, 3, input)).resolves.toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(addItem).not.toHaveBeenCalled();
  });

  it('rejects a free-typed attribute when editing an item', async () => {
    const updateItem = vi.fn<
      Parameters<ISchoolSupplyListService['updateItem']>,
      ReturnType<ISchoolSupplyListService['updateItem']>
    >();
    lifecycle.updateItem = updateItem;
    mocks.listSpecificationOptions.mockResolvedValue([
      { attributeKey: 'color', values: ['blue', 'red'] },
    ]);

    await expect(
      service.updateItem(writer, 3, 9, {
        specification: { categoryId: 7, attributes: { finish: 'matte' } },
      }),
    ).resolves.toEqual({ success: false, error: 'invalid-input' });
    expect(updateItem).not.toHaveBeenCalled();
  });

  it('rejects malformed item input before consulting catalog options', async () => {
    lifecycle.addItem = vi.fn();

    await expect(
      service.addItem(writer, 3, {
        localizedLabel: { en: 'Notebook' },
        specification: { categoryId: 7, attributes: null },
      } as unknown as SupplyListItemInput),
    ).resolves.toEqual({ success: false, error: 'invalid-input' });
    expect(mocks.listSpecificationOptions).not.toHaveBeenCalled();
  });

  it('accepts a specification made entirely from catalog options', async () => {
    const addItem = vi
      .fn<
        Parameters<ISchoolSupplyListService['addItem']>,
        ReturnType<ISchoolSupplyListService['addItem']>
      >()
      .mockResolvedValue({ success: false, error: 'item-not-found' });
    lifecycle.addItem = addItem;
    mocks.listSpecificationOptions.mockResolvedValue([
      { attributeKey: 'color', values: ['blue', 'red'] },
      { attributeKey: 'size', values: ['A4', 'A5'] },
    ]);
    const input: SupplyListItemInput = {
      variantId: 12,
      exactItem: false,
      specification: { categoryId: 7, attributes: { color: 'blue', size: 'A4' } },
      localizedLabel: { en: 'Notebook' },
    };

    await expect(service.addItem(writer, 3, input)).resolves.toEqual({
      success: false,
      error: 'item-not-found',
    });
    expect(addItem).toHaveBeenCalledWith(writer, 3, input);
  });

  it('exposes every School Supply List lifecycle operation', async () => {
    const unavailable = vi.fn().mockResolvedValue({ success: false, error: 'not-found' });
    lifecycle.createDraft = unavailable;
    lifecycle.cloneToDraft = unavailable;
    lifecycle.updateDraft = unavailable;
    lifecycle.removeItem = unavailable;
    lifecycle.reorderItems = unavailable;
    lifecycle.publish = unavailable;
    lifecycle.archive = unavailable;
    lifecycle.getById = unavailable;

    const results = await Promise.all([
      service.createDraft(writer, {
        businessPartnerId: 2,
        grade: 'Grade 1',
        academicYear: '2026/2027',
        localizedTitle: { en: 'Grade 1 supplies' },
      }),
      service.cloneToDraft(writer, 3),
      service.updateDraft(writer, 3, { grade: 'Grade 2' }),
      service.removeItem(writer, 3, 9),
      service.reorderItems(writer, 3, [9, 10]),
      service.publish(writer, 3),
      service.archive(writer, 3),
      service.getById(writer, 3),
    ]);

    expect(results).toEqual(
      Array.from({ length: 8 }, () => ({ success: false, error: 'not-found' })),
    );
  });

  it('returns catalog candidate variants to authorized Staff', async () => {
    mocks.listVariantCandidates.mockResolvedValue([
      { variantId: 12, categoryId: 7, attributes: { color: 'blue' } },
    ]);

    await expect(service.listVariantCandidates(writer, 7)).resolves.toEqual({
      success: true,
      data: [{ variantId: 12, categoryId: 7, attributes: { color: 'blue' } }],
    });
  });

  it('rejects a non-null specification submitted for an Exact Item', async () => {
    const addItem = vi
      .fn<
        Parameters<ISchoolSupplyListService['addItem']>,
        ReturnType<ISchoolSupplyListService['addItem']>
      >()
      .mockResolvedValue({ success: false, error: 'item-not-found' });
    lifecycle.addItem = addItem;

    await expect(
      service.addItem(writer, 3, {
        exactItem: true,
        specification: { categoryId: 7, attributes: { color: 'chartreuse' } },
        localizedLabel: { en: 'Notebook' },
      }),
    ).resolves.toEqual({ success: false, error: 'invalid-input' });
    expect(addItem).not.toHaveBeenCalled();
  });

  it('refuses every operation when the caller is not authorized as Staff', async () => {
    const outsider = { kind: 'partner', userId: 99 } as unknown as SupplyListStaffActor;
    const results = await Promise.all([
      service.listSpecificationOptions(outsider, 7),
      service.listVariantCandidates(outsider, 7),
      service.createDraft(outsider, {
        businessPartnerId: 2,
        grade: 'Grade 1',
        academicYear: '2026/2027',
        localizedTitle: { en: 'Grade 1 supplies' },
      }),
      service.cloneToDraft(outsider, 3),
      service.updateDraft(outsider, 3, { grade: 'Grade 2' }),
      service.addItem(outsider, 3, { localizedLabel: { en: 'Notebook' } }),
      service.updateItem(outsider, 3, 9, { quantity: 2 }),
      service.removeItem(outsider, 3, 9),
      service.reorderItems(outsider, 3, [9]),
      service.publish(outsider, 3),
      service.archive(outsider, 3),
      service.getById(outsider, 3),
    ]);

    expect(results).toEqual(
      Array.from({ length: 12 }, () => ({ success: false, error: 'forbidden' })),
    );
    expect(mocks.listSpecificationOptions).not.toHaveBeenCalled();
    expect(mocks.listVariantCandidates).not.toHaveBeenCalled();
  });
});
