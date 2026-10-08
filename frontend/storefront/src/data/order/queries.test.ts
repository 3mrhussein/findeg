import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, latestShippingAddress } = vi.hoisted(() => ({
  getSession: vi.fn(),
  latestShippingAddress: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ getSession }));
vi.mock('@findeg/backend/features/order', () => ({
  createOrders: () => ({ latestShippingAddress }),
}));

import { getCheckoutPrefill } from './queries';

describe('checkout prefill composition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns no prefill or Order read without an authenticated Customer', async () => {
    getSession.mockResolvedValue(null);
    expect(await getCheckoutPrefill()).toBeNull();
    expect(latestShippingAddress).not.toHaveBeenCalled();
  });

  it('combines profile names and email with the latest shipping snapshot', async () => {
    getSession.mockResolvedValue({
      userId: 42,
      user: { firstName: 'Ahmed', lastName: 'Hassan', email: 'current@example.com' },
    });
    latestShippingAddress.mockResolvedValue({
      fullName: 'Previous recipient',
      phone: '01012345678',
      city: 'Cairo',
      area: 'Nasr City',
      street: 'Abbas El Akkad',
      building: '15',
      floor: '2',
      apartment: '5',
      notes: 'Call first',
    });
    expect(await getCheckoutPrefill()).toEqual({
      fullName: 'Ahmed Hassan',
      guestEmail: 'current@example.com',
      phone: '01012345678',
      city: 'Cairo',
      area: 'Nasr City',
      street: 'Abbas El Akkad',
      building: '15',
      floor: '2',
      apartment: '5',
      notes: 'Call first',
    });
    expect(latestShippingAddress).toHaveBeenCalledWith(42);
  });

  it('provides profile defaults before the first Order', async () => {
    getSession.mockResolvedValue({ userId: 42, user: { email: 'customer@example.com' } });
    latestShippingAddress.mockResolvedValue(null);
    expect(await getCheckoutPrefill()).toEqual({
      fullName: '',
      guestEmail: 'customer@example.com',
      phone: '',
      city: '',
      area: '',
      street: '',
      building: '',
      floor: '',
      apartment: '',
      notes: '',
    });
  });
});
