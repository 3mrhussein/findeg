import { beforeEach, describe, expect, it, vi } from 'vitest';
const queries = vi.hoisted(() => ({
  create: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  getUnread: vi.fn(),
  getAll: vi.fn(),
  getUnreadCount: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => ({ notificationQueries: queries }));
import { createNotificationInbox } from '../../../index';
describe('Account notification inbox', () => {
  beforeEach(() => vi.resetAllMocks());
  it('delivers a notification without blocking the caller on storage failure', async () => {
    const inbox = createNotificationInbox();
    await expect(
      inbox.create({
        userId: 1,
        type: 'inventory.low_stock',
        titleEn: 'Low stock',
        titleAr: 'تنبيه',
      }),
    ).resolves.toBeUndefined();
    queries.create.mockRejectedValue(new Error('offline'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      inbox.create({
        userId: 1,
        type: 'inventory.low_stock',
        titleEn: 'Low stock',
        titleAr: 'تنبيه',
      }),
    ).resolves.toBeUndefined();
    log.mockRestore();
  });
  it('marks notifications read for the account', async () => {
    await expect(createNotificationInbox().markRead(4, 1)).resolves.toBeUndefined();
    await expect(createNotificationInbox().markAllRead(1)).resolves.toBeUndefined();
  });
  it('returns unread notifications and badge count', async () => {
    queries.getUnread.mockResolvedValue([{ id: 4, isRead: false }]);
    queries.getUnreadCount.mockResolvedValue(1);
    await expect(createNotificationInbox().getUnread(1)).resolves.toEqual([
      { id: 4, isRead: false },
    ]);
    await expect(createNotificationInbox().getUnreadCount(1)).resolves.toBe(1);
  });
  it('reports whether another inbox page may exist', async () => {
    queries.getAll.mockResolvedValue([]);
    await expect(createNotificationInbox().getAll(1)).resolves.toEqual({
      notifications: [],
      total: 0,
      hasMore: false,
    });
    const notifications = Array.from({ length: 20 }, (_, id) => ({ id }));
    queries.getAll.mockResolvedValue(notifications);
    await expect(createNotificationInbox().getAll(1, 2)).resolves.toEqual({
      notifications,
      total: 0,
      hasMore: true,
    });
  });
});
