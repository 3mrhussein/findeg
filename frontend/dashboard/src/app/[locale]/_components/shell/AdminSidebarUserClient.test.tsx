import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));
vi.mock('@actions/auth-actions', () => ({ logoutAction: logout }));

import { AdminSidebarUserClient } from './AdminSidebarUserClient';
import { SidebarProvider } from './SidebarContext';

describe('sidebar logout form', () => {
  beforeEach(() => {
    logout.mockReset().mockResolvedValue(undefined);
    window.localStorage.clear();
  });

  function renderLogout() {
    render(
      <SidebarProvider>
        <AdminSidebarUserClient userName="Test Admin" />
      </SidebarProvider>,
    );
    return screen.getByRole('button', { name: 'Logout' });
  }

  it('submits the server action with FormData once when clicked', async () => {
    const button = renderLogout();
    expect(logout).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button.closest('form')).not.toBeNull();
    fireEvent.click(button);
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(logout).toHaveBeenCalledWith(expect.any(FormData));
  });

  it('supports form submission without a click handler', async () => {
    const button = renderLogout();
    const form = button.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(logout).toHaveBeenCalledWith(expect.any(FormData));
  });

  it('does not invoke logout when rendered collapsed', () => {
    window.localStorage.setItem('findeg-admin-sidebar', 'true');
    render(
      <SidebarProvider>
        <AdminSidebarUserClient userName="Test Admin" />
      </SidebarProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });
});
