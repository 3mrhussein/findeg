import { describe, expect, it, vi } from 'vitest';

// The producer entry must load without the application environment or the default
// connection: Orders and other producers write on the caller's transaction only.
vi.mock('../../../connection', () => {
  throw new Error('the outbox producer entry must not load the default connection');
});
vi.mock('@findeg/env', () => {
  throw new Error('the outbox producer entry must not load the application environment');
});
vi.mock('@findeg/env/database', () => {
  throw new Error('the outbox producer entry must not load the application environment');
});

describe('@findeg/db/queries/outbox', () => {
  it('imports without the application environment or the default connection', async () => {
    const entry = await import('@findeg/db/queries/outbox');

    expect(typeof entry.enqueue).toBe('function');
  });

  it('exposes only the producer, not the connection-bound worker queries', async () => {
    const entry = await import('@findeg/db/queries/outbox');

    expect(Object.keys(entry).sort()).toEqual(['enqueue']);
  });

  it('inserts through the caller transaction and ignores a repeated id', async () => {
    const { enqueue } = await import('@findeg/db/queries/outbox');
    const { outbox } = await import('../../../schema/system/outbox');
    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));
    const tx = { insert } as unknown as Parameters<typeof enqueue>[0];

    await enqueue(tx, 'order-status:FE-ABC123:shipped', 'order-status', { orderId: 7 });

    expect(insert).toHaveBeenCalledWith(outbox);
    expect(values).toHaveBeenCalledWith({
      id: 'order-status:FE-ABC123:shipped',
      kind: 'order-status',
      payload: { orderId: 7 },
    });
    expect(onConflictDoNothing).toHaveBeenCalledWith();
  });

  it('refuses to run without the caller transaction', async () => {
    const { enqueue } = await import('@findeg/db/queries/outbox');

    await expect(
      enqueue(undefined as unknown as Parameters<typeof enqueue>[0], 'id', 'kind', {}),
    ).rejects.toThrow(/caller's transaction/);
  });
});
