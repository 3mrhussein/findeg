import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: {},
  end: vi.fn(),
  truncateTables: vi.fn(),
  seedIdentity: vi.fn(),
  seedCatalog: vi.fn(),
  seedSales: vi.fn(),
  seedInventory: vi.fn(),
  seedSystem: vi.fn(),
  synchronizeSeedSequences: vi.fn(),
}));

vi.mock('@findeg/env/database', () => ({ default: { DB_SEEDING: true } }));
vi.mock('../src/connection.ts', () => ({ db: mocks.db, connection: { end: mocks.end } }));
vi.mock('../seeds/index.ts', () => ({
  seedIdentity: mocks.seedIdentity,
  seedCatalog: mocks.seedCatalog,
  seedSales: mocks.seedSales,
  seedInventory: mocks.seedInventory,
  seedSystem: mocks.seedSystem,
}));
vi.mock('../seeds/helpers/index.ts', () => ({
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
] as const;

// The command sets process.exitCode asynchronously; isolate it from the test runner.
let originalExitCode: typeof process.exitCode;
beforeEach(() => {
  originalExitCode = process.exitCode;
  process.exitCode = undefined;
  vi.resetModules();
  for (const stage of [...stages, 'end'] as const)
    mocks[stage].mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
});

describe('seed command lifecycle', () => {
  it('repairs sequences after every fixture and closes the connection on success', async () => {
    await import('../seed');
    await vi.waitFor(() => expect(mocks.end).toHaveBeenCalledOnce());

    for (const stage of stages) {
      expect(mocks[stage]).toHaveBeenCalledOnce();
      expect(mocks[stage]).toHaveBeenCalledWith(mocks.db);
    }
    const calls = [...stages, 'end'] as const;
    for (let index = 1; index < calls.length; index++) {
      expect(mocks[calls[index - 1]].mock.invocationCallOrder[0]).toBeLessThan(
        mocks[calls[index]].mock.invocationCallOrder[0],
      );
    }
    expect(process.exitCode).toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each(stages)('closes the connection and reports failure when %s rejects', async (stage) => {
    const failure = new Error(`${stage} failed`);
    mocks[stage].mockRejectedValueOnce(failure);

    await import('../seed');
    await vi.waitFor(() => expect(process.exitCode).toBe(1));

    expect(mocks.end).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', failure);
    for (const later of stages.slice(stages.indexOf(stage) + 1)) {
      expect(mocks[later]).not.toHaveBeenCalled();
    }
    expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
  });

  it('reports a connection shutdown failure with a nonzero exit code', async () => {
    const failure = new Error('connection shutdown failed');
    mocks.end.mockRejectedValueOnce(failure);

    await import('../seed');
    await vi.waitFor(() => expect(process.exitCode).toBe(1));

    expect(mocks.end).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', failure);
  });
});
