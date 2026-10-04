import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq, like } from 'drizzle-orm';
import { outbox, partnerInvitationTokens, businessPartners, users } from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createPartnerMembershipServices,
  type PartnerServices,
  type StaffActor,
} from '../../partner-membership';
import {
  createOutbox,
  enqueue,
  PARTNER_INVITATION_KIND,
  partnerInvitationId,
  type EmailProvider,
  type OutgoingEmail,
} from '../index';

class FakeEmailProvider implements EmailProvider {
  sent: OutgoingEmail[] = [];
  failures = 0;
  async send(email: OutgoingEmail) {
    if (this.failures > 0) {
      this.failures--;
      throw new Error('provider down');
    }
    this.sent.push(email);
  }
}

const tokenOf = (email: OutgoingEmail) => {
  const link = JSON.stringify(email.react).match(/partner\/invitations\/([\w-]+)/);
  if (!link) throw new Error('no invitation link in email');
  return link[1];
};

describe('Partner Invitation delivery through the Outbox', () => {
  let testDb: TestDatabase;
  let services: PartnerServices;
  let staff: StaffActor;
  let provider: FakeEmailProvider;
  let sequence = 0;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerMembershipServices({
      db: testDb.db,
      enqueue: (tx, { invitationId }) =>
        enqueue(
          tx as never,
          partnerInvitationId(invitationId, crypto.randomUUID()),
          PARTNER_INVITATION_KIND,
          { invitationId },
        ),
    });
    const [staffUser] = await testDb.db
      .insert(users)
      .values({ email: 'invitation-outbox-staff@findeg.test', portalRole: 'staff' })
      .returning();
    staff = { kind: 'staff', userId: staffUser.id, permissionCodes: ['partners.manage'] };
  });
  afterAll(async () => testDb.close());
  beforeEach(async () => {
    await testDb.db.delete(outbox).where(like(outbox.id, 'partner-invitation:%'));
    provider = new FakeEmailProvider();
  });

  const drain = () =>
    createOutbox({ emailProvider: provider, invitations: services.invitations }).drain({
      limit: 20,
    });

  async function invite() {
    sequence += 1;
    const created = await services.partners.createPartner(staff, {
      code: `invitation-outbox-${sequence}`,
      nameEn: 'Outbox School',
      nameAr: 'مدرسة',
    });
    if (!created.success) throw new Error(created.error);
    const email = `invitee-outbox-${sequence}@findeg.test`;
    const result = await services.invitations.invite(staff, created.data.id, {
      email,
      roles: ['list-manager'],
    });
    if (!result.success) throw new Error(result.error);
    return { partner: created.data, email, ...result.data };
  }

  const rows = () =>
    testDb.db.select().from(outbox).where(eq(outbox.kind, PARTNER_INVITATION_KIND));
  const acceptable = async (token: string) =>
    (await services.invitations.getInvitation(token)).success;

  it('writes a row with only the invitation id in the invite transaction', async () => {
    const { invitation } = await invite();
    const all = (await rows()).filter(
      (r) => (r.payload as { invitationId: number }).invitationId === invitation.id,
    );
    expect(all).toHaveLength(1);
    expect(all[0].payload).toEqual({ invitationId: invitation.id });
  });

  it('leaves no row when the invite transaction rolls back', async () => {
    const before = (await rows()).length;
    const rolledBack = createPartnerMembershipServices({
      db: {
        transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
          testDb.db.transaction(async (tx) => {
            await fn(tx);
            throw new Error('boom');
          }),
      } as never,
      enqueue: (tx, { invitationId }) =>
        enqueue(tx as never, partnerInvitationId(invitationId, 'rb'), PARTNER_INVITATION_KIND, {
          invitationId,
        }),
    });
    const created = await services.partners.createPartner(staff, {
      code: `invitation-outbox-rb-${Date.now()}`,
      nameEn: 'RB',
      nameAr: 'RB',
    });
    if (!created.success) throw new Error(created.error);
    await rolledBack.invitations
      .invite(staff, created.data.id, { email: 'rb@findeg.test', roles: ['list-manager'] })
      .catch(() => {});
    expect((await rows()).length).toBe(before);
  });

  it('emails the invitee a working link when drained', async () => {
    const { email, partner } = await invite();
    const result = await drain();

    expect(result.delivered).toBeGreaterThanOrEqual(1);
    const sent = provider.sent.find((m) => m.to === email);
    expect(sent).toBeDefined();
    const token = tokenOf(sent!);
    expect(await acceptable(token)).toBe(true);
    const accepted = await services.memberships.acceptInvitation(token, {
      userId: (await testDb.db.insert(users).values({ email }).returning())[0].id,
      user: { email },
    });
    expect(accepted).toMatchObject({ success: true, data: { partner: { id: partner.id } } });
  });

  it('mints a fresh token on retry and keeps the earlier digest working', async () => {
    const { invitation, token: copied } = await invite();
    provider.failures = 1;
    await drain();
    expect(provider.sent.filter((m) => m.to.startsWith('invitee-outbox-'))).toHaveLength(0);

    const [row] = (await rows()).filter(
      (r) => (r.payload as { invitationId: number }).invitationId === invitation.id,
    );
    await testDb.db
      .update(outbox)
      .set({ nextAttemptAt: new Date(Date.now() - 1000) })
      .where(eq(outbox.id, row.id));
    await drain();

    const sent = provider.sent.find((m) => m.idempotencyKey === `${row.id}:2`);
    expect(sent).toBeDefined();
    const digests = await testDb.db
      .select()
      .from(partnerInvitationTokens)
      .where(eq(partnerInvitationTokens.invitationId, invitation.id));
    expect(digests.length).toBe(3); // copy-link, failed attempt 1, attempt 2
    expect(tokenOf(sent!)).not.toBe(copied);
    expect(await acceptable(tokenOf(sent!))).toBe(true);
    expect(await acceptable(copied)).toBe(true);
  });

  it('delivers twice for an invite followed by a resend', async () => {
    const { invitation, email } = await invite();
    await services.invitations.resendInvitation(staff, invitation.id);
    await drain();
    expect(provider.sent.filter((m) => m.to === email)).toHaveLength(2);
  });

  it('expires the row without sending when the invitation is revoked', async () => {
    const { invitation, email } = await invite();
    await services.invitations.revokeInvitation(staff, invitation.id);
    const result = await drain();
    expect(result.expired).toBeGreaterThanOrEqual(1);
    expect(provider.sent.filter((m) => m.to === email)).toHaveLength(0);
  });

  it('expires the row without sending when the invitation was already accepted', async () => {
    const { email, token } = await invite();
    const [user] = await testDb.db.insert(users).values({ email }).returning();
    await services.memberships.acceptInvitation(token, { userId: user.id, user: { email } });
    await drain();
    expect(provider.sent.filter((m) => m.to === email)).toHaveLength(0);
  });

  it('expires the row without sending when the Business Partner is no longer open', async () => {
    const { partner, email, invitation } = await invite();
    await testDb.db
      .update(businessPartners)
      .set({ status: 'closed' })
      .where(eq(businessPartners.id, partner.id));
    await drain();
    expect(provider.sent.filter((m) => m.to === email)).toHaveLength(0);
    const [row] = (await rows()).filter(
      (r) => (r.payload as { invitationId: number }).invitationId === invitation.id,
    );
    expect(row.status).toBe('expired');
  });
});
