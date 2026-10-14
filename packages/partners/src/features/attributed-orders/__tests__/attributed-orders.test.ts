import { beforeEach, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import { getAttributedOrderTotals, listAttributedOrders } from '@findeg/db/queries/partner-sales';
import { AttributedOrderService, isValidAttributedOrdersFilter } from '../index';

vi.mock('@findeg/db/queries/partners', () => ({ getBusinessPartnerById: vi.fn() }));
vi.mock('@findeg/db/queries/partner-sales', () => ({
  listAttributedOrders: vi.fn(),
  getAttributedOrderTotals: vi.fn(),
}));

const reader = { userId: 1, permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW] };
const period = { from: '2026-10-01', to: '2026-10-31' };
const executor = { transaction: (run: (tx: unknown) => unknown) => run(executor) };
const totals = { orderCount: 1, chargedPiasters: 5000n, quantity: 2 };

function service() {
  return new AttributedOrderService(async () => executor as never);
}

beforeEach(() => {
  vi.mocked(getBusinessPartnerById).mockReset();
  vi.mocked(listAttributedOrders).mockReset();
  vi.mocked(getAttributedOrderTotals).mockReset();
});

it('refuses actors without the Partner Reports permission', async () => {
  expect(await service().getAttributedOrders({ userId: 1 }, 1, period)).toEqual({
    success: false,
    error: 'forbidden',
  });
});

it('rejects an invalid period before reading anything', async () => {
  const result = await service().getAttributedOrders(reader, 1, {
    from: '2026-10-31',
    to: period.from,
  });
  expect(result).toEqual({ success: false, error: 'invalid-input' });
  expect(getBusinessPartnerById).not.toHaveBeenCalled();
});

it('reports not-found for an unknown Business Partner', async () => {
  vi.mocked(getBusinessPartnerById).mockResolvedValue(undefined);
  expect(await service().getAttributedOrders(reader, 9, period)).toEqual({
    success: false,
    error: 'not-found',
  });
});

it('returns the orders and their totals from one snapshot', async () => {
  vi.mocked(getBusinessPartnerById).mockResolvedValue({ id: 1 } as never);
  vi.mocked(listAttributedOrders).mockResolvedValue([{ id: 5 }] as never);
  vi.mocked(getAttributedOrderTotals).mockResolvedValue(totals as never);
  const result = await service().getAttributedOrders(reader, 1, {
    ...period,
    orderStatuses: ['confirmed'],
  });
  expect(result).toEqual({ success: true, data: { orders: [{ id: 5 }], totals } });
  expect(vi.mocked(listAttributedOrders).mock.calls[0][1]).toMatchObject({
    businessPartnerId: 1,
    from: '2026-10-01',
    to: '2026-10-31',
    orderStatuses: ['confirmed'],
  });
});

it('accepts omitted status lists and rejects empty or unknown ones', () => {
  expect(isValidAttributedOrdersFilter({ ...period })).toBe(true);
  expect(isValidAttributedOrdersFilter({ ...period, orderStatuses: [] })).toBe(false);
  expect(isValidAttributedOrdersFilter({ ...period, paymentStatuses: ['bogus' as never] })).toBe(
    false,
  );
  expect(isValidAttributedOrdersFilter({ from: '2026-10-02', to: '2026-10-01' })).toBe(false);
});
