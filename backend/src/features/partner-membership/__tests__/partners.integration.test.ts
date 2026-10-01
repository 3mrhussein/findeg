import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { partnerAccessHistory, users } from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { createPartnerMembershipServices, type PartnerServices, type StaffActor } from '..';

describe('Business Partners (Staff operations)', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let unauthorized: StaffActor;
  let staffUserId: number;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({ db: testDb.db });
    const [user] = await testDb.db
      .insert(users)
      .values({ email: 'partners-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staffUserId = user.id;
    staff = { kind: 'staff', userId: user.id, permissionCodes: ['partners.manage'] };
    unauthorized = { kind: 'staff', userId: user.id, permissionCodes: ['admin.brands.write'] };
  });

  afterAll(async () => {
    await testDb.close();
  });

  const historyFor = (businessPartnerId: number) =>
    testDb.db
      .select()
      .from(partnerAccessHistory)
      .where(eq(partnerAccessHistory.businessPartnerId, businessPartnerId))
      .orderBy(partnerAccessHistory.id);

  const create = async (code: string) => {
    const result = await services.partners.createPartner(staff, {
      code,
      nameEn: 'Nile School',
      nameAr: 'مدرسة النيل',
    });
    if (!result.success) throw new Error(`create failed: ${result.error}`);
    return result.data;
  };

  describe('createPartner', () => {
    it('creates an onboarding partner and records a partner.created audit row', async () => {
      const partner = await create('nile-school');

      expect(partner).toMatchObject({
        code: 'nile-school',
        nameEn: 'Nile School',
        nameAr: 'مدرسة النيل',
        status: 'onboarding',
        authorizationVersion: 1,
      });

      const history = await historyFor(partner.id);
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        action: 'partner.created',
        actorKind: 'staff',
        actorUserId: staffUserId,
        before: null,
        membershipId: null,
        invitationId: null,
      });
      expect(history[0].after).toMatchObject({ code: 'nile-school', status: 'onboarding' });
    });

    it('returns code-taken for a duplicate code and writes no audit row', async () => {
      const first = await create('dup-school');
      const second = await services.partners.createPartner(staff, {
        code: 'dup-school',
        nameEn: 'Other',
        nameAr: 'آخر',
      });

      expect(second).toEqual({ success: false, error: 'code-taken' });
      expect(await historyFor(first.id)).toHaveLength(1);
      const all = await services.partners.listPartners(staff);
      expect(all.success && all.data.filter((p) => p.code === 'dup-school')).toHaveLength(1);
    });

    it('refuses actors without partners.manage and writes nothing', async () => {
      const result = await services.partners.createPartner(unauthorized, {
        code: 'forbidden-school',
        nameEn: 'X',
        nameAr: 'س',
      });

      expect(result).toEqual({ success: false, error: 'forbidden' });
      const all = await services.partners.listPartners(staff);
      expect(all.success && all.data.some((p) => p.code === 'forbidden-school')).toBe(false);
    });

    it('rejects malformed input', async () => {
      const result = await services.partners.createPartner(staff, {
        code: 'Not A Slug',
        nameEn: '',
        nameAr: 'س',
      });
      expect(result).toEqual({ success: false, error: 'invalid-input' });
    });
  });

  describe('updatePartner', () => {
    it('changes names at any time and records a partner.updated audit row', async () => {
      const partner = await create('rename-school');

      const result = await services.partners.updatePartner(staff, partner.id, {
        nameEn: 'Renamed School',
      });

      expect(result.success && result.data).toMatchObject({
        nameEn: 'Renamed School',
        nameAr: 'مدرسة النيل',
      });
      const history = await historyFor(partner.id);
      expect(history.map((row) => row.action)).toEqual(['partner.created', 'partner.updated']);
      expect(history[1]).toMatchObject({
        actorKind: 'staff',
        before: { nameEn: 'Nile School' },
        after: { nameEn: 'Renamed School' },
      });
    });

    it('changes the code while onboarding', async () => {
      const partner = await create('old-code-school');

      const result = await services.partners.updatePartner(staff, partner.id, {
        code: 'new-code-school',
      });

      expect(result.success && result.data.code).toBe('new-code-school');
      const history = await historyFor(partner.id);
      expect(history[1]).toMatchObject({
        action: 'partner.updated',
        before: { code: 'old-code-school' },
        after: { code: 'new-code-school' },
      });
    });

    it('returns code-locked once the partner has left onboarding', async () => {
      const partner = await create('locked-school');
      await testDb.sql`update identity.business_partners set status = 'active' where id = ${partner.id}`;

      const result = await services.partners.updatePartner(staff, partner.id, {
        code: 'unlocked-school',
        nameEn: 'Should not apply',
      });

      expect(result).toEqual({ success: false, error: 'code-locked' });
      const reread = await services.partners.getPartner(staff, partner.id);
      expect(reread.success && reread.data).toMatchObject({
        code: 'locked-school',
        nameEn: 'Nile School',
      });
      expect(await historyFor(partner.id)).toHaveLength(1);
    });

    it('still allows renames after onboarding', async () => {
      const partner = await create('active-rename-school');
      await testDb.sql`update identity.business_partners set status = 'active' where id = ${partner.id}`;

      const result = await services.partners.updatePartner(staff, partner.id, {
        nameAr: 'اسم جديد',
        code: 'active-rename-school',
      });

      expect(result.success && result.data.nameAr).toBe('اسم جديد');
    });

    it('returns code-taken when the new code belongs to another partner', async () => {
      await create('taken-school');
      const partner = await create('wants-taken-school');

      const result = await services.partners.updatePartner(staff, partner.id, {
        code: 'taken-school',
        nameEn: 'Should not apply',
      });

      expect(result).toEqual({ success: false, error: 'code-taken' });
      const reread = await services.partners.getPartner(staff, partner.id);
      expect(reread.success && reread.data).toMatchObject({
        code: 'wants-taken-school',
        nameEn: 'Nile School',
      });
      expect(await historyFor(partner.id)).toHaveLength(1);
    });

    it('writes no audit row when nothing changes', async () => {
      const partner = await create('noop-school');

      const result = await services.partners.updatePartner(staff, partner.id, {
        code: 'noop-school',
        nameEn: 'Nile School',
      });

      expect(result.success).toBe(true);
      expect(await historyFor(partner.id)).toHaveLength(1);
    });

    it('returns not-found for an unknown partner', async () => {
      const result = await services.partners.updatePartner(staff, 999_999, { nameEn: 'X' });
      expect(result).toEqual({ success: false, error: 'not-found' });
    });

    it('refuses actors without partners.manage and changes nothing', async () => {
      const partner = await create('protected-school');

      const result = await services.partners.updatePartner(unauthorized, partner.id, {
        nameEn: 'Hacked',
      });

      expect(result).toEqual({ success: false, error: 'forbidden' });
      const reread = await services.partners.getPartner(staff, partner.id);
      expect(reread.success && reread.data.nameEn).toBe('Nile School');
      expect(await historyFor(partner.id)).toHaveLength(1);
    });
  });

  describe('reads', () => {
    it('refuses listing and fetching without partners.manage', async () => {
      const partner = await create('read-guarded-school');
      expect(await services.partners.listPartners(unauthorized)).toEqual({
        success: false,
        error: 'forbidden',
      });
      expect(await services.partners.getPartner(unauthorized, partner.id)).toEqual({
        success: false,
        error: 'forbidden',
      });
    });

    it('lets system administrators act without the explicit permission', async () => {
      const admin: StaffActor = {
        kind: 'staff',
        userId: staffUserId,
        permissionCodes: [],
        activeRoleIds: ['system_admin'],
      };
      const result = await services.partners.listPartners(admin);
      expect(result.success).toBe(true);
    });
  });

  it('keeps the audit history append-only', async () => {
    const partner = await create('append-only-school');
    await expect(
      testDb.sql`update identity.partner_access_history set action = 'partner.created' where business_partner_id = ${partner.id}`,
    ).rejects.toThrow(/append-only/);
    await expect(
      testDb.sql`delete from identity.partner_access_history where business_partner_id = ${partner.id}`,
    ).rejects.toThrow(/append-only/);
  });
});
