import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { asc, sql } from 'drizzle-orm';
import { outbox } from '@findeg/db/schema';
import { enqueue } from '@findeg/db/queries/outbox';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';

// The connection-free producer entry that Orders and other producers use: it writes only
// on the transaction the caller passes in.
describe('@findeg/db/queries/outbox on real Postgres', () => {
  let testDb: TestDatabase;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());
  beforeEach(async () => {
    await testDb.db.delete(outbox);
  });

  const rows = () =>
    testDb.db
      .select({ id: outbox.id, kind: outbox.kind, payload: outbox.payload, status: outbox.status })
      .from(outbox)
      .orderBy(asc(outbox.id));

  it('commits the messages with the caller transaction', async () => {
    await testDb.db.transaction(async (tx) => {
      await enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 1 });
      await enqueue(tx, 'order-status:FE-BBBBBB:shipped', 'order-status', { orderId: 2 });
    });

    expect(await rows()).toEqual([
      {
        id: 'order-status:FE-AAAAAA:shipped',
        kind: 'order-status',
        payload: { orderId: 1 },
        status: 'pending',
      },
      {
        id: 'order-status:FE-BBBBBB:shipped',
        kind: 'order-status',
        payload: { orderId: 2 },
        status: 'pending',
      },
    ]);
  });

  it('rolls back with the caller when a later write in the transaction fails', async () => {
    const attempt = testDb.db.transaction(async (tx) => {
      await enqueue(tx, 'order-status:FE-AAAAAA:cancelled', 'order-status', { orderId: 1 });
      await tx.execute(sql`select 1 / 0`);
    });

    await expect(attempt).rejects.toThrow();
    expect(await rows()).toEqual([]);
  });

  it('rolls back with the caller when the caller aborts', async () => {
    const attempt = testDb.db.transaction(async (tx) => {
      await enqueue(tx, 'order-status:FE-AAAAAA:delivered', 'order-status', { orderId: 1 });
      tx.rollback();
    });

    await expect(attempt).rejects.toThrow();
    expect(await rows()).toEqual([]);
  });

  it('keeps the first message when an id repeats within one transaction, without aborting it', async () => {
    await testDb.db.transaction(async (tx) => {
      await enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 1 });
      await enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 2 });
      // The transaction is still usable after the ignored duplicate.
      await enqueue(tx, 'order-status:FE-AAAAAA:delivered', 'order-status', { orderId: 1 });
    });

    expect((await rows()).map(({ id, payload }) => ({ id, payload }))).toEqual([
      { id: 'order-status:FE-AAAAAA:delivered', payload: { orderId: 1 } },
      { id: 'order-status:FE-AAAAAA:shipped', payload: { orderId: 1 } },
    ]);
  });

  it('ignores an id already committed by an earlier transaction', async () => {
    await testDb.db.transaction((tx) =>
      enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 1 }),
    );
    await testDb.db.transaction((tx) =>
      enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 2 }),
    );

    expect((await rows()).map(({ payload }) => payload)).toEqual([{ orderId: 1 }]);
  });

  it('lets a rolled-back id be enqueued again by a later transaction', async () => {
    await testDb.db
      .transaction(async (tx) => {
        await enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 1 });
        tx.rollback();
      })
      .catch(() => {});
    await testDb.db.transaction((tx) =>
      enqueue(tx, 'order-status:FE-AAAAAA:shipped', 'order-status', { orderId: 2 }),
    );

    expect((await rows()).map(({ payload }) => payload)).toEqual([{ orderId: 2 }]);
  });
});
