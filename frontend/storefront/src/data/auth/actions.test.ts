import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logout } from './actions';
import { deleteSession } from '@lib/session';
import { redirect } from '@i18n/navigation';
import { getLocale } from 'next-intl/server';

vi.mock('@lib/session', () => ({
  deleteSession: vi.fn(),
}));

vi.mock('@i18n/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(),
}));

describe('Auth actions - logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the session and redirects to /login preserving current locale (e.g. ar)', async () => {
    vi.mocked(getLocale).mockResolvedValue('ar');

    await logout();

    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(getLocale).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith({ href: '/login', locale: 'ar' });
  });

  it('preserves en locale on logout', async () => {
    vi.mocked(getLocale).mockResolvedValue('en');

    await logout();

    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith({ href: '/login', locale: 'en' });
  });
});
