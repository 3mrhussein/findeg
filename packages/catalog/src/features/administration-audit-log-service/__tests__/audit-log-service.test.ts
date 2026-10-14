import { beforeEach, describe, expect, it, vi } from 'vitest';

const { auditLogQueries } = vi.hoisted(() => ({
  auditLogQueries: {
    create: vi.fn(),
    getAll: vi.fn(),
    getRecent: vi.fn(),
    getByEntity: vi.fn(),
  },
}));
vi.mock('@findeg/db/queries', () => ({ auditLogQueries }));

import { AuditLogService } from '../index';
import { createAuditLogService } from '../../catalog-factory/index';

const row = {
  id: 1,
  adminUserId: null,
  entityType: 'variant',
  entityId: '7',
  action: 'update_inventory',
  oldValues: null,
  newValues: { onHand: 5 },
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditLogService();
  });

  it('is created by the catalog factory with a fresh instance each call', () => {
    expect(createAuditLogService()).not.toBe(createAuditLogService());
  });

  it('persists audit entries', async () => {
    auditLogQueries.create.mockResolvedValue(row);
    await service.logAction({
      adminUserId: 2,
      entityType: 'variant',
      entityId: '7',
      action: 'update_inventory',
      oldValues: { onHand: 1 },
      newValues: { onHand: 5 },
    } as never);
    expect(auditLogQueries.create).toHaveBeenCalledWith({
      adminUserId: 2,
      entityType: 'variant',
      entityId: '7',
      action: 'update_inventory',
      oldValues: { onHand: 1 },
      newValues: { onHand: 5 },
    });
  });

  it('reports logging failures to the console instead of throwing', async () => {
    const error = new Error('db down');
    auditLogQueries.create.mockRejectedValue(error);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      service.logAction({ entityType: 'variant', entityId: '1', action: 'x' } as never),
    ).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledWith('Failed to create audit log entry:', error);
    spy.mockRestore();
  });

  it('maps paginated query results and derives the page from the offset', async () => {
    auditLogQueries.getAll.mockResolvedValue({ logs: [row], total: 11 });
    const result = await service.getLogs({ offset: 10, limit: 5, entityType: 'variant' } as never);
    expect(auditLogQueries.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, limit: 5, entityType: 'variant' }),
    );
    expect(result.total).toBe(11);
    expect(result.data[0]).toEqual({
      id: 1,
      adminUserId: undefined,
      entityType: 'variant',
      entityId: '7',
      action: 'update_inventory',
      oldValues: undefined,
      newValues: { onHand: 5 },
      createdAt: row.createdAt,
    });
  });

  it('defaults to the first page when no offset is given', async () => {
    auditLogQueries.getAll.mockResolvedValue({ logs: [], total: 0 });
    await service.getLogs({} as never);
    expect(auditLogQueries.getAll).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('returns recent activity capped at the requested limit', async () => {
    auditLogQueries.getRecent.mockResolvedValue([row, { ...row, id: 2 }, { ...row, id: 3 }]);
    const result = await service.getRecentActivity({ limit: 2, entityTypes: ['variant'] });
    expect(auditLogQueries.getRecent).toHaveBeenCalledWith(6, ['variant']);
    expect(result.map((entry) => entry.id)).toEqual([1, 2]);
  });

  it('returns recent activity without entity filtering by default', async () => {
    auditLogQueries.getRecent.mockResolvedValue([row]);
    await service.getRecentActivity({ limit: 1 });
    expect(auditLogQueries.getRecent).toHaveBeenCalledWith(1, undefined);
  });

  it('returns the history of one entity', async () => {
    auditLogQueries.getByEntity.mockResolvedValue([row]);
    const result = await service.getEntityLogs('variant', '7');
    expect(auditLogQueries.getByEntity).toHaveBeenCalledWith('variant', '7');
    expect(result).toHaveLength(1);
    expect(result[0].oldValues).toBeUndefined();
  });

  it('keeps old values when present', async () => {
    auditLogQueries.getByEntity.mockResolvedValue([{ ...row, oldValues: { onHand: 1 } }]);
    const [entry] = await service.getEntityLogs('variant', '7');
    expect(entry.oldValues).toEqual({ onHand: 1 });
  });
});
