import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { guestAccessCodes, guestAccessRequests, orders, outbox } from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { createOutbox, type EmailProvider, type OutgoingEmail } from '../../outbox';
import { createGuestAccessService } from '../index';
import { verifyGuestOrderToken } from '../domain/token';

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
  /** The 6-digit code in the nth sent email (rendered props, not persisted anywhere). */
  codeOf(n: number): string {
    const props = this.sent[n].react.props as { code: string };
    return props.code;
  }
}

describe('Guest Order Access on real Postgres', () => {
  let testDb: TestDatabase;
  let email: FakeEmailProvider;
  const service = createGuestAccessService();

  const GUEST_EMAIL = 'guest@example.com';
  let reference: string;
  let orderId: number;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());

  const createOrder = async (guestEmail: string | null = GUEST_EMAIL) => {
    const [order] = await testDb.db
      .insert(orders)
      .values({ guestEmail, subtotal: '100', totalAmount: '100' })
      .returning();
    return order;
  };

  beforeEach(async () => {
    await testDb.db.delete(outbox);
    await testDb.db.delete(guestAccessRequests);
    email = new FakeEmailProvider();
    const order = await createOrder();
    reference = order.orderReference;
    orderId = order.id;
  });

  const drain = () => createOutbox({ emailProvider: email }).drain({ limit: 10 });
  const requestCode = async (ref = reference, mail = GUEST_EMAIL) => {
    const result = await service.requestAccess({ reference: ref, email: mail });
    await drain();
    return result;
  };
  const requests = () =>
    testDb.db.select().from(guestAccessRequests).where(eq(guestAccessRequests.orderId, orderId));

  describe('requestAccess', () => {
    it('answers identically whether or not the order matches', async () => {
      const match = await service.requestAccess({ reference, email: GUEST_EMAIL });
      const wrongEmail = await service.requestAccess({ reference, email: 'other@example.com' });
      const unknown = await service.requestAccess({ reference: 'FE-ZZZZZZ', email: GUEST_EMAIL });

      expect(match).toEqual({ success: true });
      expect(wrongEmail).toEqual(match);
      expect(unknown).toEqual(match);
      expect(await requests()).toHaveLength(1);
    });

    it('matches reference and email case-insensitively', async () => {
      await service.requestAccess({
        reference: reference.toLowerCase(),
        email: 'GUEST@Example.com',
      });
      expect(await requests()).toHaveLength(1);
    });

    it('never matches a signed-in order that has no guest email', async () => {
      const order = await createOrder(null);
      await service.requestAccess({ reference: order.orderReference, email: GUEST_EMAIL });
      expect(await testDb.db.select().from(guestAccessRequests)).toHaveLength(0);
    });

    it('creates a 15-minute request and an outbox row with ids only', async () => {
      await service.requestAccess({ reference, email: GUEST_EMAIL });

      const [request] = await requests();
      const minutes = (request.expiresAt.getTime() - request.createdAt.getTime()) / 60_000;
      expect(minutes).toBeCloseTo(15, 0);
      const rows = await testDb.db.select().from(outbox);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        id: `guest-access:${request.id}`,
        payload: { accessRequestId: request.id },
      });
    });

    it('allows at most 3 requests per order per hour, counted from request rows', async () => {
      for (let i = 0; i < 4; i++) await service.requestAccess({ reference, email: GUEST_EMAIL });
      expect(await requests()).toHaveLength(3);

      await testDb.db
        .update(guestAccessRequests)
        .set({ createdAt: sql`now() - interval '61 minutes'` })
        .where(eq(guestAccessRequests.orderId, orderId));
      await service.requestAccess({ reference, email: GUEST_EMAIL });
      expect(await requests()).toHaveLength(4);
    });

    it('rejects malformed input without creating anything', async () => {
      expect(await service.requestAccess({ reference: '', email: 'nope' })).toMatchObject({
        success: false,
      });
      expect(await requests()).toHaveLength(0);
    });
  });

  describe('code email', () => {
    it('mints the code at send time and persists only a hash', async () => {
      await service.requestAccess({ reference, email: GUEST_EMAIL });
      expect(await testDb.db.select().from(guestAccessCodes)).toHaveLength(0);

      await drain();

      expect(email.sent).toHaveLength(1);
      expect(email.sent[0].to).toBe(GUEST_EMAIL);
      const code = email.codeOf(0);
      expect(code).toMatch(/^\d{6}$/);
      const stored = await testDb.db.select().from(guestAccessCodes);
      expect(stored).toHaveLength(1);
      expect(stored[0].codeHash).not.toContain(code);
      const dump = JSON.stringify({
        codes: stored,
        requests: await requests(),
        outbox: await testDb.db.select().from(outbox),
      });
      expect(dump).not.toContain(code);
    });

    it('a retried send mints another code and both work until one is used', async () => {
      email.failures = 1;
      await service.requestAccess({ reference, email: GUEST_EMAIL });
      await drain();
      expect(email.sent).toHaveLength(0);
      // the failed attempt's code was never delivered; make the retry due
      await testDb.db.update(outbox).set({ nextAttemptAt: sql`now() - interval '1 second'` });
      await drain();
      expect(email.sent).toHaveLength(1);
      expect(await testDb.db.select().from(guestAccessCodes)).toHaveLength(2);

      const result = await service.verify({ reference, code: email.codeOf(0) });
      expect(result).toMatchObject({ success: true });
    });

    it('a duplicated email carries a working second code; one use kills the rest', async () => {
      await requestCode();
      // simulate the provider redelivering: the row is processed again
      await testDb.db
        .update(outbox)
        .set({ status: 'pending', nextAttemptAt: sql`now() - interval '1 second'` });
      await drain();
      expect(email.sent).toHaveLength(2);
      const [first, second] = [email.codeOf(0), email.codeOf(1)];
      expect(first).not.toBe(second);
      expect(email.sent[0].idempotencyKey).not.toBe(email.sent[1].idempotencyKey);

      expect(await service.verify({ reference, code: second })).toMatchObject({ success: true });
      expect(await service.verify({ reference, code: first })).toMatchObject({
        success: false,
      });
    });

    it('does not send for a consumed or expired request', async () => {
      await service.requestAccess({ reference, email: GUEST_EMAIL });
      await testDb.db
        .update(guestAccessRequests)
        .set({ expiresAt: sql`now() - interval '1 second'` });

      const result = await drain();

      expect(result.expired).toBe(1);
      expect(email.sent).toHaveLength(0);
      expect((await testDb.db.select().from(outbox))[0].status).toBe('expired');
    });
  });

  describe('verify', () => {
    it('a correct code returns a token that unlocks only that order', async () => {
      const other = await createOrder('other@example.com');
      await requestCode();

      const result = await service.verify({ reference, code: email.codeOf(0) });

      expect(result).toMatchObject({ success: true, orderReference: reference });
      if (!result.success) throw new Error('unreachable');
      expect(await verifyGuestOrderToken(result.token)).toBe(reference);
      expect(await service.getOrder(result.token, reference)).toMatchObject({
        orderReference: reference,
      });
      expect(await service.getOrder(result.token, other.orderReference)).toBeNull();
      expect(await service.getOrder('forged.token.value', reference)).toBeNull();
      expect(await service.getOrder(undefined, reference)).toBeNull();
    });

    it('a used code cannot be used again', async () => {
      await requestCode();
      const code = email.codeOf(0);
      expect(await service.verify({ reference, code })).toMatchObject({ success: true });
      expect(await service.verify({ reference, code })).toMatchObject({ success: false });
    });

    it('allows 5 attempts, then even the right code is refused', async () => {
      await requestCode();
      const code = email.codeOf(0);
      const wrong = code === '000000' ? '111111' : '000000';

      for (let i = 0; i < 5; i++) {
        expect(await service.verify({ reference, code: wrong })).toMatchObject({ success: false });
      }
      expect(await service.verify({ reference, code })).toMatchObject({ success: false });
    });

    it('the 5th attempt can still succeed', async () => {
      await requestCode();
      const code = email.codeOf(0);
      const wrong = code === '000000' ? '111111' : '000000';
      for (let i = 0; i < 4; i++) await service.verify({ reference, code: wrong });
      expect(await service.verify({ reference, code })).toMatchObject({ success: true });
    });

    it('refuses an expired request', async () => {
      await requestCode();
      await testDb.db
        .update(guestAccessRequests)
        .set({ expiresAt: sql`now() - interval '1 second'` });
      expect(await service.verify({ reference, code: email.codeOf(0) })).toMatchObject({
        success: false,
      });
    });

    it('a code for one order does not open another', async () => {
      const other = await createOrder('other@example.com');
      await requestCode();
      expect(
        await service.verify({ reference: other.orderReference, code: email.codeOf(0) }),
      ).toMatchObject({ success: false });
    });

    it('answers an unknown reference like a wrong code', async () => {
      expect(await service.verify({ reference: 'FE-ZZZZZZ', code: '123456' })).toEqual({
        success: false,
        reason: 'invalid-code',
      });
    });
  });
});
