import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (_opts?: { namespace?: string }) => (key: string) => {
    const translations: Record<string, string> = {
      Settings: 'Settings',
      SettingsDescription: 'Manage your profile and preferences',
      AccountDetails: 'Account Details',
      UpdatePersonalInfo: 'Update your personal information and contact details',
      EmailLabel: 'Email',
      EmailCannotChange:
        'Your email address is managed through your identity account and cannot be changed here.',
      NameLabel: 'Full Name',
      PhoneLabel: 'Phone Number',
      Save: 'Save',
    };
    return translations[key] ?? key;
  },
}));

vi.mock('@lib/auth-guard', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 42 }),
}));

vi.mock('@findeg/backend', () => ({
  getMyAccountData: vi.fn().mockResolvedValue({
    user: {
      id: 42,
      email: 'user@example.com',
      firstName: 'Fatma',
      lastName: 'Mohamed',
      phone: '+201098765432',
    },
    orders: [],
  }),
}));

vi.mock('@data/user/actions', () => ({
  updateProfileAction: vi.fn(),
}));

import SettingsPage from './page';

describe('SettingsPage', () => {
  it('renders profile update form with name and phone, and excludes Change Password', async () => {
    const jsx = await SettingsPage({
      params: Promise.resolve({ locale: 'en' }),
    });

    render(jsx);

    // Title and description
    expect(screen.getByText('Account Details')).toBeInTheDocument();
    expect(
      screen.getByText('Update your personal information and contact details'),
    ).toBeInTheDocument();

    // Email (disabled)
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue('user@example.com');
    expect(
      screen.getByText(/Your email address is managed through your identity account/),
    ).toBeInTheDocument();

    // Name (populated)
    const nameInput = screen.getByLabelText('Full Name');
    expect(nameInput).toHaveValue('Fatma Mohamed');

    // Phone (populated)
    const phoneInput = screen.getByLabelText('Phone Number');
    expect(phoneInput).toHaveValue('+201098765432');

    // Verify "Change Password" / password inputs do NOT exist
    expect(screen.queryByText(/Change Password/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Current Password/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/New Password/i)).not.toBeInTheDocument();
  });
});
