import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import * as partnerQueries from '@findeg/db/queries/partners';
import { PartnerService } from '../index';

vi.mock('@findeg/db/queries/partners', () => ({
  getBusinessPartnerById: vi.fn(),
  getPartnerSchoolProfile: vi.fn(),
  hasActivePartnerAdministrator: vi.fn(),
  insertBusinessPartner: vi.fn(),
  insertPartnerAccessHistory: vi.fn(),
  isPartnerCodeTakenError: vi.fn(() => false),
  listBusinessPartners: vi.fn(),
  lockBusinessPartnerById: vi.fn(),
  setBusinessPartnerStatus: vi.fn(),
  updateBusinessPartner: vi.fn(),
  upsertPartnerSchoolProfile: vi.fn(),
}));

const staff = {
  kind: 'staff' as const,
  userId: 1,
  permissionCodes: [PERMISSION_CODES.PARTNERS_MANAGE],
};
const viewer = {
  kind: 'staff' as const,
  userId: 2,
  permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW],
};
const executor = { transaction: (run: (tx: unknown) => unknown) => run(executor) };

const partnerRow = {
  id: 5,
  code: 'sch-100',
  nameEn: 'Nile School',
  nameAr: 'مدرسة النيل',
  status: 'onboarding',
  authorizationVersion: 1,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};
const profile = {
  businessPartnerId: 5,
  governorate: 'Cairo',
  area: 'Maadi',
  schoolType: 'National',
  academicSystem: 'American',
  logoUrl: null,
};

const service = () => new PartnerService(async () => executor as never);
const q = vi.mocked(partnerQueries);

beforeEach(() => {
  vi.resetAllMocks();
  q.isPartnerCodeTakenError.mockReturnValue(false);
  q.insertPartnerAccessHistory.mockResolvedValue(undefined as never);
});

describe('authorization', () => {
  it('refuses managing partners without the permission', async () => {
    expect(
      await service().createPartner(
        { kind: 'staff', userId: 9 },
        { code: 'SCH-1', nameEn: 'a', nameAr: 'b' },
      ),
    ).toEqual({ success: false, error: 'forbidden' });
    expect(await service().updatePartner({ kind: 'staff', userId: 9 }, 5, {})).toEqual({
      success: false,
      error: 'forbidden',
    });
    expect(await service().changePartnerStatus({ kind: 'staff', userId: 9 }, 5, 'active')).toEqual({
      success: false,
      error: 'forbidden',
    });
    expect(
      await service().savePartnerSchoolProfile({ kind: 'staff', userId: 9 }, 5, profile as never),
    ).toEqual({ success: false, error: 'forbidden' });
  });

  it('refuses listing and reading without the directory permission', async () => {
    const none = { kind: 'staff' as const, userId: 9 };
    expect(await service().listPartners(none)).toEqual({ success: false, error: 'forbidden' });
    expect(await service().getPartner(none, 5)).toEqual({ success: false, error: 'forbidden' });
    expect(await service().getPartnerSchoolProfile(none, 5)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });

  it('exposes the allowed status changes from the domain', () => {
    expect(service().allowedStatusChanges('onboarding')).toContain('active');
  });
});

describe('createPartner', () => {
  it('rejects input that fails the schema', async () => {
    expect(await service().createPartner(staff, { code: 'x', nameEn: '', nameAr: 'b' })).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('creates the partner and its audit row in one transaction, with an optional school profile', async () => {
    q.insertBusinessPartner.mockResolvedValue(partnerRow as never);
    q.upsertPartnerSchoolProfile.mockResolvedValue(profile as never);
    const result = await service().createPartner(staff, {
      code: 'sch-100',
      nameEn: 'Nile School',
      nameAr: 'مدرسة النيل',
      schoolProfile: {
        governorate: 'Cairo',
        area: 'Maadi',
        schoolType: 'National',
        academicSystem: 'American',
        logoUrl: '',
      } as never,
    });
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({ id: 5, code: 'sch-100' }),
    });
    expect(q.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ action: 'partner.created', before: null }),
    );
  });

  it('creates a partner without a school profile', async () => {
    q.insertBusinessPartner.mockResolvedValue(partnerRow as never);
    const result = await service().createPartner(staff, {
      code: 'sch-100',
      nameEn: 'Nile School',
      nameAr: 'مدرسة النيل',
    });
    expect(result.success).toBe(true);
    expect(q.upsertPartnerSchoolProfile).not.toHaveBeenCalled();
  });

  it('maps a taken code to code-taken and rethrows other errors', async () => {
    q.insertBusinessPartner.mockRejectedValueOnce(new Error('duplicate'));
    q.isPartnerCodeTakenError.mockReturnValueOnce(true);
    expect(
      await service().createPartner(staff, { code: 'sch-100', nameEn: 'a', nameAr: 'b' }),
    ).toEqual({ success: false, error: 'code-taken' });
    const boom = new Error('connection lost');
    q.insertBusinessPartner.mockRejectedValueOnce(boom);
    await expect(
      service().createPartner(staff, { code: 'sch-100', nameEn: 'a', nameAr: 'b' }),
    ).rejects.toBe(boom);
  });
});

describe('updatePartner', () => {
  it('rejects input that fails the schema', async () => {
    expect(await service().updatePartner(staff, 5, { nameEn: '' })).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('reports not-found when the partner does not exist', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(undefined);
    expect(await service().updatePartner(staff, 5, { nameEn: 'x' })).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('returns the current partner unchanged when nothing differs', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    const result = await service().updatePartner(staff, 5, { nameEn: 'Nile School' });
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({ nameEn: 'Nile School' }),
    });
    expect(q.updateBusinessPartner).not.toHaveBeenCalled();
  });

  it('updates the name and records before and after values', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.updateBusinessPartner.mockResolvedValue({ ...partnerRow, nameEn: 'Nile Academy' } as never);
    const result = await service().updatePartner(staff, 5, { nameEn: 'Nile Academy' });
    expect(result).toMatchObject({ success: true, data: { nameEn: 'Nile Academy' } });
    expect(q.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({
        action: 'partner.updated',
        before: { nameEn: 'Nile School' },
        after: { nameEn: 'Nile Academy' },
      }),
    );
  });

  it('saves the school profile alongside the update', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.getPartnerSchoolProfile.mockResolvedValue(undefined);
    q.upsertPartnerSchoolProfile.mockResolvedValue(profile as never);
    q.updateBusinessPartner.mockResolvedValue({ ...partnerRow, nameAr: 'النيل' } as never);
    const result = await service().updatePartner(staff, 5, {
      nameAr: 'النيل',
      schoolProfile: {
        governorate: 'Cairo',
        area: 'Maadi',
        schoolType: 'National',
        academicSystem: 'American',
        logoUrl: null,
      } as never,
    });
    expect(result.success).toBe(true);
    expect(q.upsertPartnerSchoolProfile).toHaveBeenCalled();
  });

  it('refuses a code change the domain locks', async () => {
    q.lockBusinessPartnerById.mockResolvedValue({ ...partnerRow, status: 'active' } as never);
    const result = await service().updatePartner(staff, 5, { code: 'sch-200' });
    expect(result).toEqual({ success: false, error: 'code-locked' });
  });

  it('maps a taken code on update to code-taken', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.updateBusinessPartner.mockRejectedValueOnce(new Error('duplicate'));
    q.isPartnerCodeTakenError.mockReturnValueOnce(true);
    expect(await service().updatePartner(staff, 5, { nameEn: 'Other' })).toEqual({
      success: false,
      error: 'code-taken',
    });
  });
});

describe('changePartnerStatus', () => {
  it('reports not-found for an unknown partner', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(undefined);
    expect(await service().changePartnerStatus(staff, 5, 'active')).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('changes status when the domain allows it and audits the change', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.hasActivePartnerAdministrator.mockResolvedValue(true);
    q.setBusinessPartnerStatus.mockResolvedValue({ ...partnerRow, status: 'active' } as never);
    const result = await service().changePartnerStatus(staff, 5, 'active');
    expect(result).toMatchObject({ success: true, data: { status: 'active' } });
    expect(q.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({
        action: 'partner.status_changed',
        before: { status: 'onboarding' },
        after: { status: 'active' },
      }),
    );
  });

  it('refuses an invalid transition with its application error', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.hasActivePartnerAdministrator.mockResolvedValue(true);
    const result = await service().changePartnerStatus(staff, 5, 'onboarding' as never);
    expect(result.success).toBe(false);
  });
});

describe('reads', () => {
  it('lists partners as views', async () => {
    q.listBusinessPartners.mockResolvedValue([partnerRow] as never);
    const result = await service().listPartners(viewer);
    expect(result).toEqual({ success: true, data: [expect.objectContaining({ id: 5 })] });
  });

  it('reads one partner or reports not-found', async () => {
    q.getBusinessPartnerById
      .mockResolvedValueOnce(partnerRow as never)
      .mockResolvedValueOnce(undefined);
    expect(await service().getPartner(viewer, 5)).toMatchObject({ success: true, data: { id: 5 } });
    expect(await service().getPartner(viewer, 6)).toEqual({ success: false, error: 'not-found' });
  });

  it('reads the school profile, null when none is saved, and not-found for an unknown partner', async () => {
    q.getBusinessPartnerById
      .mockResolvedValueOnce(partnerRow as never)
      .mockResolvedValueOnce(partnerRow as never)
      .mockResolvedValueOnce(undefined);
    q.getPartnerSchoolProfile
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(profile as never);
    expect(await service().getPartnerSchoolProfile(viewer, 5)).toEqual({
      success: true,
      data: null,
    });
    expect(await service().getPartnerSchoolProfile(viewer, 5)).toEqual({
      success: true,
      data: profile,
    });
    expect(await service().getPartnerSchoolProfile(viewer, 6)).toEqual({
      success: false,
      error: 'not-found',
    });
  });
});

describe('savePartnerSchoolProfile', () => {
  it('rejects an invalid profile', async () => {
    expect(await service().savePartnerSchoolProfile(staff, 5, { area: '' } as never)).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('reports not-found for an unknown partner', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(undefined);
    expect(await service().savePartnerSchoolProfile(staff, 5, profile as never)).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('saves a new profile and audits it', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.getPartnerSchoolProfile.mockResolvedValue(undefined);
    q.upsertPartnerSchoolProfile.mockResolvedValue(profile as never);
    const result = await service().savePartnerSchoolProfile(staff, 5, {
      governorate: 'Cairo',
      area: 'Maadi',
      schoolType: 'National',
      academicSystem: 'American',
      logoUrl: null,
    } as never);
    expect(result).toEqual({ success: true, data: profile });
    expect(q.insertPartnerAccessHistory).toHaveBeenCalledWith(
      executor,
      expect.objectContaining({ before: { schoolProfile: null } }),
    );
  });

  it('returns the existing profile without writing when nothing changed', async () => {
    q.lockBusinessPartnerById.mockResolvedValue(partnerRow as never);
    q.getPartnerSchoolProfile.mockResolvedValue(profile as never);
    const result = await service().savePartnerSchoolProfile(staff, 5, {
      governorate: 'Cairo',
      area: 'Maadi',
      schoolType: 'National',
      academicSystem: 'American',
      logoUrl: null,
    } as never);
    expect(result).toEqual({ success: true, data: profile });
    expect(q.upsertPartnerSchoolProfile).not.toHaveBeenCalled();
  });
});
