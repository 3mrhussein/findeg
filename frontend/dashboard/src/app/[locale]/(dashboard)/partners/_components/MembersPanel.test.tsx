import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MembersPanel, type MemberRow } from './MembersPanel';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      Members: 'Members',
      MembersOnboardingActiveOnly:
        'Memberships can only change while the Business Partner is onboarding or active.',
      MembershipEndedNotice: 'Membership ended (no actions)',
      ChangeRoles: 'Change roles',
      Suspend: 'Suspend',
      Reactivate: 'Reactivate',
      End: 'End',
      SaveRoles: 'Save roles',
      Cancel: 'Cancel',
      NoMembers: 'No members yet.',
    };
    return map[key] ?? key;
  },
}));

vi.mock('../_actions/memberships', () => ({
  updateMembershipAction: vi.fn(),
}));

describe('MembersPanel component', () => {
  const activeMember: MemberRow = {
    id: 1,
    email: 'admin@school.test',
    name: 'Admin User',
    roles: ['partner-administrator'],
    status: 'active',
    authorizationVersion: 1,
  };

  const suspendedMember: MemberRow = {
    id: 2,
    email: 'staff@school.test',
    name: 'Staff User',
    roles: ['collection-staff'],
    status: 'suspended',
    authorizationVersion: 1,
  };

  const endedMember: MemberRow = {
    id: 3,
    email: 'former@school.test',
    name: 'Former User',
    roles: ['list-manager'],
    status: 'ended',
    authorizationVersion: 1,
  };

  it('renders actions for active members and allows suspend / change roles', () => {
    render(<MembersPanel canChange={true} members={[activeMember]} />);

    expect(screen.getByText('admin@school.test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change roles/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suspend/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^end$/i })).toBeInTheDocument();
  });

  it('renders reactivate button for suspended members', () => {
    render(<MembersPanel canChange={true} members={[suspendedMember]} />);

    expect(screen.getByText('staff@school.test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reactivate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^end$/i })).toBeInTheDocument();
  });

  it('renders explicit ended-membership notice and no actions for ended members', () => {
    render(<MembersPanel canChange={true} members={[endedMember]} />);

    expect(screen.getByText('former@school.test')).toBeInTheDocument();
    expect(screen.getByTestId('ended-membership-notice')).toHaveTextContent(
      'Membership ended (no actions)',
    );
    expect(screen.queryByRole('button', { name: /change roles/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /suspend/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reactivate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^end$/i })).not.toBeInTheDocument();
  });

  it('hides all mutation actions when partner is closed/cannot change', () => {
    render(<MembersPanel canChange={false} members={[activeMember]} />);

    expect(screen.getByText('admin@school.test')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /change roles/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /suspend/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^end$/i })).not.toBeInTheDocument();
  });
});
