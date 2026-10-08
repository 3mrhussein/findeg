import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getDetail = vi.fn();
class NotFoundSignal extends Error {}

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSignal('NEXT_NOT_FOUND');
  },
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
const setRequestLocale = vi.fn();
vi.mock('next-intl/server', () => ({
  setRequestLocale: (locale: string) => setRequestLocale(locale),
}));
vi.mock('@findeg/backend/features/administration', () => ({
  createAdministrationServices: () => ({ orders: { getDetail } }),
}));
vi.mock('@i18n/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@actions/order-actions', () => ({
  updateOrderStatusAction: vi.fn(),
  updateOrderPaymentStatusAction: vi.fn(),
}));
vi.mock('@hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

import OrderDetailPage from './page';

const renderPage = async (id: string, locale = 'en') =>
  render(await OrderDetailPage({ params: Promise.resolve({ locale, id }) }));

describe('Order detail page', () => {
  beforeEach(() => {
    getDetail.mockReset();
    setRequestLocale.mockReset();
  });

  it.each(['abc', '1.5', '-3', '0', '12abc', '99999999999', '1e3', ''])(
    'returns not-found for malformed id %j without querying',
    async (id) => {
      await expect(renderPage(id)).rejects.toBeInstanceOf(NotFoundSignal);
      expect(getDetail).not.toHaveBeenCalled();
    },
  );

  it('returns not-found for an unknown Order', async () => {
    getDetail.mockResolvedValue(null);
    await expect(renderPage('4242')).rejects.toBeInstanceOf(NotFoundSignal);
    expect(getDetail).toHaveBeenCalledWith(4242);
  });

  const detail = () => ({
    order: {
      id: 7,
      orderReference: 'FE-AB12CD',
      status: 'pending',
      paymentStatus: 'paid',
      totalAmount: 100,
      currency: 'EGP',
      customerName: 'Ahmed Hassan',
      items: [],
      createdAt: new Date('2026-10-05T08:00:00.000Z'),
    },
    activity: [
      {
        id: 1,
        action: 'update_payment_status',
        adminName: 'Mona Saleh',
        oldValue: 'unpaid',
        newValue: 'paid',
        createdAt: new Date('2026-10-05T09:00:00.000Z'),
      },
    ],
  });

  it.each(['en', 'ar'])('renders the Order and its real activity entries (%s)', async (locale) => {
    getDetail.mockResolvedValue(detail());
    await renderPage('7', locale);
    expect(setRequestLocale).toHaveBeenCalledWith(locale);
    expect(getDetail).toHaveBeenCalledWith(7);
    expect(screen.getAllByText(/Ahmed Hassan/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Action by Mona Saleh/)).toBeInTheDocument();
    expect(screen.queryByText(/No recent activity/)).not.toBeInTheDocument();
  });
});
