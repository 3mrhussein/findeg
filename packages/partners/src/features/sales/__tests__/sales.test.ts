import { describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import type { PartnerSalesDatabase } from '@findeg/db/queries/partner-sales';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import {
  listAttributedOrders,
  getAttributedOrderTotals,
  getFirstAttributedOrderMonth,
  listAttributedSalesRows,
} from '@findeg/db/queries/partner-sales';
import { createPartnerSalesServices } from '../index';

vi.mock('@findeg/db/connection', () => ({
  db: { transaction: (run: (tx: unknown) => unknown) => run({}) },
}));
vi.mock('@findeg/db/queries/partners', () => ({
  getBusinessPartnerById: vi.fn(async () => ({ id: 1 })),
}));
vi.mock('@findeg/db/queries/partner-sales', () => ({
  listAttributedOrders: vi.fn(async () => []),
  getAttributedOrderTotals: vi.fn(async () => ({
    orderCount: 0,
    chargedPiasters: 0n,
    quantity: 0,
  })),
  getFirstAttributedOrderMonth: vi.fn(async () => null),
  listAttributedSalesRows: vi.fn(async () => []),
}));

const reader = { userId: 1, permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW] };

describe('createPartnerSalesServices', () => {
  it('reads through the injected database with the injected clock', async () => {
    const services = createPartnerSalesServices({
      db: {
        transaction: (run: (tx: unknown) => unknown) => run({}),
      } as unknown as PartnerSalesDatabase,
      now: () => new Date('2026-10-14T10:00:00Z'),
    });
    const report = await services.partnerReports.getStaffReport(reader, 1, {});
    expect(report.success).toBe(true);
    expect(getBusinessPartnerById).toHaveBeenCalled();
  });

  it('falls back to the shared connection and the system clock when no database is injected', async () => {
    const services = createPartnerSalesServices();
    const orders = await services.attributedOrders.getAttributedOrders(reader, 1, {
      from: '2026-10-01',
      to: '2026-10-31',
    });
    expect(orders.success).toBe(true);
    expect(listAttributedOrders).toHaveBeenCalled();
    expect(getAttributedOrderTotals).toHaveBeenCalled();
    const current = await services.partnerReports.getStaffReport(reader, 1, {});
    expect(current.success).toBe(true);
    expect(getFirstAttributedOrderMonth).toHaveBeenCalled();
    expect(listAttributedSalesRows).toHaveBeenCalled();
  });
});
