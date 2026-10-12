import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => {
    const translations: Record<string, string> = {
      ShopTitle: 'Shop',
      SchoolsTitle: 'Schools',
      HelpTitle: 'Help',
      AllProducts: 'All Products',
      Categories: 'Categories',
      Collections: 'Collections',
      Search: 'Search',
      Cart: 'Cart',
      FindYourList: 'Find Your School List',
      Schools: 'Schools Directory',
      TrackOrder: 'Track Order',
      AboutUs: 'About Us',
      ContactSupport: 'Contact Support',
      ReturnPolicy: 'Return Policy',
      TermsOfService: 'Terms of Service',
      Copyright: 'All rights reserved.',
      Tagline: 'School & Stationery',
    };
    return translations[key] ?? key;
  },
}));

vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { Footer } from './Footer';

describe('Footer', () => {
  it('renders brand FindEg, current year, and no hash "#" links', async () => {
    const currentYear = new Date().getFullYear();
    const jsx = await Footer({ locale: 'en' });
    const { container } = render(jsx);

    // Brand and Year
    expect(screen.getAllByText(/FindEg/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument();

    // Verify no href="#"
    const allLinks = container.querySelectorAll('a');
    expect(allLinks.length).toBeGreaterThan(0);
    allLinks.forEach((link) => {
      expect(link.getAttribute('href')).not.toBe('#');
    });

    // Check specific navigation additions
    expect(screen.getByRole('link', { name: /Schools Directory/i })).toHaveAttribute(
      'href',
      '/schools',
    );
    expect(screen.getByRole('link', { name: /Collections/i })).toHaveAttribute(
      'href',
      '/collections',
    );
    expect(screen.getByRole('link', { name: /Track Order/i })).toHaveAttribute(
      'href',
      '/order-lookup',
    );

    // Check removals: Partner Program, Fundraising, credit_card icon
    expect(screen.queryByText(/Partner Program/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fundraising/i)).not.toBeInTheDocument();
    expect(screen.queryByText('credit_card')).not.toBeInTheDocument();
  });
});
