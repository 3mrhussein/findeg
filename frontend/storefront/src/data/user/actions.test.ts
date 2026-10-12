import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile, updateProfileAction } from './actions';
import { getSession } from '@lib/session';
import { revalidatePath } from 'next/cache';
import { updateProfile as backendUpdateProfile } from '@findeg/backend';

vi.mock('@lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@findeg/backend', () => ({
  updateProfile: vi.fn(),
}));

vi.mock('./queries', () => ({
  getCurrentUser: vi.fn(),
}));

describe('User actions - updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws an error if user is not authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('name', 'Ahmed Ali');

    await expect(updateProfile(formData)).rejects.toThrow('Not authenticated');
    expect(backendUpdateProfile).not.toHaveBeenCalled();
  });

  it('validates, splits name, persists name and phone, and revalidates paths', async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: 101,
      portalRole: 'customer',
      user: {
        email: 'ahmed@example.com',
        firstName: 'Ahmed',
        lastName: 'Ali',
        fullName: 'Ahmed Ali',
      },
    });

    const formData = new FormData();
    formData.append('name', 'Ahmed Ali');
    formData.append('phone', '+201012345678');

    const result = await updateProfile(formData);

    expect(result).toEqual({ success: true });
    expect(backendUpdateProfile).toHaveBeenCalledWith(101, {
      firstName: 'Ahmed',
      lastName: 'Ali',
      phone: '+201012345678',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/my-account');
    expect(revalidatePath).toHaveBeenCalledWith('/my-account/settings');
  });

  it('handles single word names correctly', async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: 102,
      portalRole: 'customer',
      user: {
        email: 'sara@example.com',
        firstName: 'Sara',
        lastName: '',
        fullName: 'Sara',
      },
    });

    const formData = new FormData();
    formData.append('name', 'Sara');

    const result = await updateProfileAction(formData);

    expect(result).toEqual({ success: true });
    expect(backendUpdateProfile).toHaveBeenCalledWith(102, {
      firstName: 'Sara',
      lastName: '',
      phone: undefined,
    });
  });
});
