import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { getActiveMembershipRoles, getBusinessPartnerById } from '@findeg/db/queries/partners';
import {
  getFirstAttributedOrderMonth,
  listAttributedSalesRows,
} from '@findeg/db/queries/partner-sales';
import {
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
  PartnerReportService,
  canReadPartnerReports,
  projectPartnerSales,
  REPORTED_PAYMENT_STATUSES,
  toSalesRowView,
  type SalesRowView,
} from '../index';

vi.mock('@findeg/db/queries/partners', () => ({
  getActiveMembershipRoles: vi.fn(),
  getBusinessPartnerById: vi.fn(),
}));
vi.mock('@findeg/db/queries/partner-sales', () => ({
  getFirstAttributedOrderMonth: vi.fn(),
  listAttributedSalesRows: vi.fn(),
}));

const executor = { transaction: (run: (tx: unknown) => unknown) => run(executor) };
const now = () => new Date('2026-10-14T10:00:00Z');
const staff = { userId: 1, permissionCodes: [PERMISSION_CODES.PARTNER_REPORTS_VIEW] };
const member = { userId: 7 };

function row(overrides: Record<string, unknown> = {}) {
  return {
    listId: 1,
    listTitle: { en: 'Grade 4', ar: 'الصف الرابع' },
    listItemId: 2,
    listItemLabel: { en: 'Notebook', ar: 'دفتر' },
    variantId: 3,
    productName: { en: 'Notebook A4', ar: '' },
    productNameSnapshot: 'Snapshot name',
    variantLabel: null,
    variantLabelSnapshot: { en: 'Blue', ar: 'أزرق' },
    quantity: 4,
    chargedPiasters: 2000n,
    orderCount: 50,
    ...overrides,
  };
}

function service() {
  return new PartnerReportService(() => Promise.resolve().then(() => executor as never), now);
}

beforeEach(() => {
  vi.mocked(getActiveMembershipRoles).mockReset();
  vi.mocked(getBusinessPartnerById).mockReset();
  vi.mocked(getFirstAttributedOrderMonth).mockReset();
  vi.mocked(listAttributedSalesRows).mockReset();
  vi.mocked(getFirstAttributedOrderMonth).mockResolvedValue('2026-08');
  vi.mocked(listAttributedSalesRows).mockResolvedValue([row()] as never);
});

describe('row projection helpers', () => {
  it('falls back from the requested locale to the other one, then to the snapshot', () => {
    const view = toSalesRowView(
      row({ listTitle: null, productName: null, variantLabel: null }),
      'ar',
    );
    expect(view.listName).toBeNull();
    expect(view.productName).toBe('Snapshot name');
    expect(view.variantLabel).toBe('أزرق');
    expect(toSalesRowView(row() as never, 'ar').productName).toBe('Notebook A4');
  });

  it('suppresses rows under the Order threshold into Other items', () => {
    const big: SalesRowView = toSalesRowView(row(), 'en');
    const small: SalesRowView = {
      ...big,
      listItemId: 9,
      orderCount: 1,
      quantity: 2,
      chargedPiasters: 500n,
    };
    const projected = projectPartnerSales([big, small]);
    expect(projected.sales).toHaveLength(1);
    expect(projected.otherItems).toEqual({ quantity: 2, chargedPiasters: 500n });
    expect(MIN_DISTINCT_ORDERS_PER_SALES_ROW).toBeGreaterThan(1);
  });

  it('reads report roles and reports refunded payments as excluded', () => {
    expect(canReadPartnerReports(['partner-administrator'])).toBe(true);
    expect(canReadPartnerReports(['list-manager'])).toBe(false);
    expect(REPORTED_PAYMENT_STATUSES).not.toContain('refunded');
  });
});

describe('getPartnerReport', () => {
  it('rejects a malformed month before reading', async () => {
    expect(await service().getPartnerReport(member, 1, { month: '2026-13' })).toEqual({
      success: false,
      error: 'invalid-input',
    });
    expect(getActiveMembershipRoles).not.toHaveBeenCalled();
  });

  it('refuses a user with no active membership or a role that cannot read reports', async () => {
    vi.mocked(getActiveMembershipRoles).mockResolvedValue(undefined as never);
    expect(await service().getPartnerReport(member, 1)).toEqual({
      success: false,
      error: 'forbidden',
    });
    vi.mocked(getActiveMembershipRoles).mockResolvedValue(['list-manager'] as never);
    expect(await service().getPartnerReport(member, 1)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });

  it('returns the current month with the month picker and the partner projection', async () => {
    vi.mocked(getActiveMembershipRoles).mockResolvedValue(['partner-administrator'] as never);
    const result = await service().getPartnerReport(member, 1);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.month).toBe('2026-10');
    expect(result.data.months).toEqual(['2026-08', '2026-09', '2026-10']);
    expect(result.data.sales[0]).not.toHaveProperty('orderCount');
  });

  it('rejects a month outside the picker range', async () => {
    vi.mocked(getActiveMembershipRoles).mockResolvedValue(['report-viewer'] as never);
    expect(await service().getPartnerReport(member, 1, { month: '2026-01' })).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('allows only the current month when a partner has no attributed orders yet', async () => {
    vi.mocked(getActiveMembershipRoles).mockResolvedValue(['report-viewer'] as never);
    vi.mocked(getFirstAttributedOrderMonth).mockResolvedValue(null);
    const current = await service().getPartnerReport(member, 1, { month: '2026-10' });
    expect(current.success && current.data.months).toEqual([]);
    expect(await service().getPartnerReport(member, 1, { month: '2026-09' })).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });
});

describe('getStaffReport', () => {
  it('refuses staff without the report permission', async () => {
    expect(await service().getStaffReport({ userId: 1 }, 1)).toEqual({
      success: false,
      error: 'forbidden',
    });
  });

  it('reports not-found for an unknown Business Partner', async () => {
    vi.mocked(getBusinessPartnerById).mockResolvedValue(undefined);
    expect(await service().getStaffReport(staff, 99)).toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('rejects a malformed month for staff', async () => {
    expect(await service().getStaffReport(staff, 1, { month: 'bad' })).toEqual({
      success: false,
      error: 'invalid-input',
    });
  });

  it('returns every row unsuppressed, with ids and order counts', async () => {
    vi.mocked(getBusinessPartnerById).mockResolvedValue({ id: 1 } as never);
    const result = await service().getStaffReport(staff, 1, { month: '2026-09', locale: 'ar' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.month).toBe('2026-09');
    expect(result.data.sales[0]).toMatchObject({ orderCount: 50, variantId: 3 });
    expect(vi.mocked(listAttributedSalesRows).mock.calls[0][1]).toMatchObject({
      businessPartnerId: 1,
      from: '2026-09-01',
      to: '2026-09-30',
    });
  });
});
