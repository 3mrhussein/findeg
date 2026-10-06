import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ logout: vi.fn(), isCollapsed: false }));
vi.mock('@actions/auth-actions', () => ({ logoutAction: mocks.logout }));
vi.mock('./SidebarContext', () => ({ useSidebar: () => ({ isCollapsed: mocks.isCollapsed }) }));

import { AdminSidebarUserClient } from './AdminSidebarUserClient';

beforeEach(() => {
  mocks.logout.mockReset().mockResolvedValue(undefined);
  mocks.isCollapsed = false;
});

describe('admin logout forms', () => {
  it('submits the expanded sidebar logout action exactly once with form data', async () => {
    render(<AdminSidebarUserClient userName="Test Admin" />);
    const button = screen.getByRole('button', { name: 'Logout' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button.closest('form')).not.toBeNull();
    expect(mocks.logout).not.toHaveBeenCalled();

    fireEvent.click(button);

    await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce());
    expect(mocks.logout.mock.calls[0][0]).toBeInstanceOf(FormData);
  });

  it('keeps logout hidden while collapsed and restores a working form when expanded', async () => {
    mocks.isCollapsed = true;
    const view = render(<AdminSidebarUserClient />);
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
    expect(mocks.logout).not.toHaveBeenCalled();

    mocks.isCollapsed = false;
    view.rerender(<AdminSidebarUserClient />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce());
    expect(mocks.logout.mock.calls[0][0]).toBeInstanceOf(FormData);
  });
});
