import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
const updateMemberAction = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('./actions', () => ({
  updateMemberAction: (...args: unknown[]) => updateMemberAction(...args),
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'Roles.report-viewer': 'Report viewer',
      'Roles.collection-staff': 'Collection staff',
      'Roles.list-manager': 'List manager',
      'Roles.partner-administrator': 'Partner administrator',
      SaveRoles: 'Save roles',
      Suspend: 'Suspend',
      Reactivate: 'Reactivate',
      Remove: 'Remove',
      StatusActive: 'Active',
      StatusSuspended: 'Suspended',
    };
    return map[key] ?? key;
  },
}));
vi.mock('@findeg/ui', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

import { MembersList, type MemberRow } from './MembersList';

const member = (over: Partial<MemberRow> = {}): MemberRow => ({
  id: 1,
  email: 'a@example.com',
  name: 'A',
  roles: ['list-manager'],
  status: 'active',
  authorizationVersion: 1,
  isSelf: false,
  ...over,
});

describe('MembersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the saved roles again once a refresh brings a newer version after a stale edit', async () => {
    updateMemberAction.mockResolvedValue({ status: 'error', message: 'Reload.', stale: true });
    const { rerender } = render(<MembersList code="s" canChange members={[member()]} />);

    fireEvent.click(screen.getByLabelText('Report viewer'));
    expect(screen.getByLabelText('Report viewer')).toBeChecked();
    fireEvent.click(screen.getByText('Save roles'));
    await waitFor(() => expect(refresh).toHaveBeenCalled());

    rerender(
      <MembersList
        code="s"
        canChange
        members={[member({ roles: ['collection-staff'], authorizationVersion: 2 })]}
      />,
    );

    expect(screen.getByLabelText('Report viewer')).not.toBeChecked();
    expect(screen.getByLabelText('Collection staff')).toBeChecked();
    expect(screen.getByRole('alert')).toHaveTextContent('Reload.');
  });
});
