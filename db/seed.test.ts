import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: {},
  process: { exitCode: undefined as number | undefined },
  truncateTables: vi.fn(),
  seedIdentity: vi.fn(),
  seedCatalog: vi.fn(),
  seedSales: vi.fn(),
  seedInventory: vi.fn(),
  seedSystem: vi.fn(),
  synchronizeSeedSequences: vi.fn(),
  end: vi.fn(),
}));
vi.mock('@findeg/env/database', () => ({ default: { DB_SEEDING: true } }));
vi.mock('process', () => ({ default: mocks.process }));
vi.mock('./src/connection.ts', () => ({ db: mocks.db, connection: { end: mocks.end } }));
vi.mock('./seeds/index.ts', () => ({
  seedIdentity: mocks.seedIdentity,
  seedCatalog: mocks.seedCatalog,
  seedSales: mocks.seedSales,
  seedInventory: mocks.seedInventory,
  seedSystem: mocks.seedSystem,
}));
vi.mock('./seeds/helpers/index.ts', () => ({
  truncateTables: mocks.truncateTables,
  synchronizeSeedSequences: mocks.synchronizeSeedSequences,
}));

const stages = [
  'truncateTables',
  'seedIdentity',
  'seedCatalog',
  'seedSales',
  'seedInventory',
  'seedSystem',
  'synchronizeSeedSequences',
  'end',
] as const;

describe('seed command lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    for (const stage of stages) mocks[stage].mockReset().mockResolvedValue(undefined);
    mocks.process.exitCode = undefined;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('repairs sequences after every fixture and closes the connection on success', async () => {
    await import('./seed');
    await vi.waitFor(() => expect(mocks.end).toHaveBeenCalledTimes(1));
    for (const [index, stage] of stages.entries()) {
      expect(mocks[stage]).toHaveBeenCalledTimes(1);
      if (stage !== 'end') expect(mocks[stage]).toHaveBeenCalledWith(mocks.db);
      if (index > 0) {
        expect(mocks[stages[index - 1]].mock.invocationCallOrder[0]).toBeLessThan(
          mocks[stage].mock.invocationCallOrder[0],
        );
      }
    }
    expect(mocks.process.exitCode).toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each(stages)(
    'reports a failing %s stage with a nonzero exit status and closes the connection',
    async (stage) => {
      const failure = new Error(`${stage} failed`);
      mocks[stage].mockRejectedValueOnce(failure);
      await import('./seed');
      await vi.waitFor(() => expect(mocks.process.exitCode).toBe(1));
      expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', failure);
      expect(mocks.end).toHaveBeenCalledTimes(1);
      for (const laterStage of stages.slice(stages.indexOf(stage) + 1)) {
        if (laterStage !== 'end') expect(mocks[laterStage]).not.toHaveBeenCalled();
      }
    },
  );
});
