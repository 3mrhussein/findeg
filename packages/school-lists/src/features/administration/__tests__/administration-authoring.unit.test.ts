import { describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { AdminSchoolSupplyListService } from '../index';
import type { ISchoolSupplyListService, SupplyListStaffActor } from '../../../types';

const writer: SupplyListStaffActor = {
  kind: 'staff',
  userId: 1,
  permissionCodes: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE],
};
const reader: SupplyListStaffActor = {
  kind: 'staff',
  userId: 2,
  permissionCodes: [PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ],
};

const lifecycle = () =>
  new Proxy(
    {},
    { get: () => vi.fn(async () => ({ success: true, data: undefined })) },
  ) as ISchoolSupplyListService;

function service(
  options: { specs?: { attributeKey: string; values: string[] }[]; list?: boolean } = {},
) {
  const specs = vi.fn(async () => options.specs ?? []);
  const candidates = vi.fn(async () => []);
  const all = options.list === false ? undefined : vi.fn(async () => [{ id: 7 }] as never);
  const partners = vi.fn(async () => [
    { id: 3, nameEn: 'Nile', nameAr: 'النيل', status: 'active' as const },
  ]);
  return {
    specs,
    candidates,
    all,
    svc: new AdminSchoolSupplyListService(lifecycle(), specs, candidates, all, partners),
  };
}

describe('AdminSchoolSupplyListService reads', () => {
  it('lists partner options and index rows for readers', async () => {
    const { svc } = service();
    expect(await svc.listPartnerOptions(reader)).toMatchObject({
      success: true,
      data: [{ id: 3 }],
    });
    expect(await svc.listAll(reader)).toEqual({ success: true, data: [{ id: 7 }] });
  });

  it('returns an empty index when no index query is wired', async () => {
    const { svc } = service({ list: false });
    expect(await svc.listAll(writer)).toEqual({ success: true, data: [] });
  });

  it('refuses reads for actors without any school-list permission', async () => {
    const { svc } = service();
    const nobody: SupplyListStaffActor = { kind: 'staff', userId: 4, permissionCodes: [] };
    expect(await svc.listPartnerOptions(nobody)).toEqual({ success: false, error: 'forbidden' });
    expect(await svc.listAll(nobody)).toEqual({ success: false, error: 'forbidden' });
  });
});

describe('AdminSchoolSupplyListService authoring pickers', () => {
  it('refuses read-only Staff from the authoring pickers', async () => {
    const { svc } = service();
    expect(await svc.listSpecificationOptions(reader, 2)).toEqual({
      success: false,
      error: 'forbidden',
    });
    expect(await svc.listVariantCandidates(reader, 2)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });

  it('rejects an invalid category id before querying', async () => {
    const { svc, specs } = service();
    expect(await svc.listSpecificationOptions(writer, 0)).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(specs).not.toHaveBeenCalled();
  });

  it('returns specification options and variant candidates for writers', async () => {
    const { svc, specs, candidates } = service({
      specs: [{ attributeKey: 'color', values: ['blue'] }],
    });
    expect(await svc.listSpecificationOptions(writer, 2)).toEqual({
      success: true,
      data: [{ attributeKey: 'color', values: ['blue'] }],
    });
    expect(await svc.listVariantCandidates(writer, 2)).toEqual({ success: true, data: [] });
    expect(specs).toHaveBeenCalledWith(2);
    expect(candidates).toHaveBeenCalledWith(2);
  });
});

describe('AdminSchoolSupplyListService item validation', () => {
  const item = {
    variantId: 5,
    exactItem: false,
    required: true,
    quantity: 1,
    localizedLabel: { en: 'Notebook' },
  };

  it('accepts a plain item without a specification and forwards it to the lifecycle', async () => {
    const { svc } = service();
    expect(await svc.addItem(writer, 7, item as never)).toMatchObject({ success: true });
  });

  it('refuses an exact item that also carries a substitution specification', async () => {
    const { svc } = service();
    const bad = {
      ...item,
      exactItem: true,
      specification: { categoryId: 2, attributes: { color: 'blue' } },
    };
    expect(await svc.addItem(writer, 7, bad as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('refuses a specification value the category does not offer', async () => {
    const { svc } = service({ specs: [{ attributeKey: 'color', values: ['blue'] }] });
    const bad = { ...item, specification: { categoryId: 2, attributes: { color: 'pink' } } };
    expect(await svc.addItem(writer, 7, bad as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('accepts a specification whose attributes the category offers, on update too', async () => {
    const { svc } = service({ specs: [{ attributeKey: 'color', values: ['blue'] }] });
    const good = { ...item, specification: { categoryId: 2, attributes: { color: 'blue' } } };
    expect(await svc.addItem(writer, 7, good as never)).toMatchObject({ success: true });
    expect(
      await svc.updateItem(writer, 7, 11, {
        specification: { categoryId: 2, attributes: { color: 'blue' } },
      } as never),
    ).toMatchObject({ success: true });
  });

  it('refuses writes without the write permission', async () => {
    const { svc } = service();
    expect(await svc.createDraft(reader, {} as never)).toEqual({
      success: false,
      error: 'forbidden',
    });
    expect(await svc.publish(reader, 7)).toEqual({ success: false, error: 'forbidden' });
  });
});
