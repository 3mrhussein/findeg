import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { TooltipProvider } from '@findeg/ui';

const mockUseUser = vi.fn();
vi.mock('@hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

vi.mock('@hooks/useCategories', () => ({
  useCategories: () => ({ categories: [], isLoading: false }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      TrackOrder: 'Track Order',
      DeliverTo: 'Deliver to: Cairo',
      MyAccount: 'My Account',
      SignIn: 'Sign In',
      SavedItems: 'Saved Items',
      AllCategories: 'All Categories',
      Schools: 'Schools',
      Collections: 'Collections',
    };
    return translations[key] ?? key;
  },
  useLocale: () => 'en',
}));

vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@components/shared/ToggleLanguage', () => ({
  default: () => <div>ToggleLanguage</div>,
}));

vi.mock('@app/[locale]/(storefront)/_components/CartTrigger', () => ({
  CartTrigger: () => <div>CartTrigger</div>,
}));

vi.mock('./SearchBar', () => ({
  SearchBar: () => <div>SearchBar</div>,
}));

vi.mock('./MobileNavSheet', () => ({
  MobileNavSheet: () => <div>MobileNavSheet</div>,
}));

vi.mock('./MegaMenuOverlay', () => ({
  MegaMenuOverlay: () => null,
}));

import { Navbar } from './Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "My Account" link pointing to /my-account when user is logged in', () => {
    mockUseUser.mockReturnValue({
      isLoggedIn: true,
      currentUser: { id: 1, name: 'Alice' },
    });

    render(
      <TooltipProvider>
        <Navbar />
      </TooltipProvider>,
    );

    // Look for link to /my-account
    const accountLinks = screen.getAllByRole('link', { name: /my account/i });
    expect(accountLinks.length).toBeGreaterThan(0);
    expect(accountLinks[0]).toHaveAttribute('href', '/my-account');
  });

  it('renders "Sign In" link pointing to /login when user is not logged in', () => {
    mockUseUser.mockReturnValue({
      isLoggedIn: false,
      currentUser: null,
    });

    render(
      <TooltipProvider>
        <Navbar />
      </TooltipProvider>,
    );

    const loginLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });

  it('renders Track Order, Schools, and Collections links without "#"', () => {
    mockUseUser.mockReturnValue({
      isLoggedIn: false,
      currentUser: null,
    });

    render(
      <TooltipProvider>
        <Navbar />
      </TooltipProvider>,
    );

    const trackOrderLink = screen.getByRole('link', { name: /track order/i });
    expect(trackOrderLink).toHaveAttribute('href', '/order-lookup');

    const schoolsLink = screen.getByRole('link', { name: /schools/i });
    expect(schoolsLink).toHaveAttribute('href', '/schools');

    const collectionsLink = screen.getByRole('link', { name: /collections/i });
    expect(collectionsLink).toHaveAttribute('href', '/collections');
  });

  it('displays brand name FindEg', () => {
    mockUseUser.mockReturnValue({
      isLoggedIn: false,
      currentUser: null,
    });

    render(
      <TooltipProvider>
        <Navbar />
      </TooltipProvider>,
    );

    expect(screen.getByText(/FindEg/)).toBeInTheDocument();
  });
});
