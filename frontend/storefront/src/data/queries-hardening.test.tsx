import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ErrorPage from '@components/shared/ErrorPage';

describe('ErrorPage component', () => {
  it('renders title, subtitle, and home link', () => {
    render(
      <ErrorPage
        title="Custom Error Title"
        subtitle="Custom Error Subtitle"
        ctaLabel="Go Home"
        ctaHref="/"
      />,
    );

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Error Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
    expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument();
  });

  it('renders working retry button and calls onRetry when clicked', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorPage
        title="Network Error"
        subtitle="Could not connect to database"
        onRetry={handleRetry}
        retryLabel="Retry Action"
      />,
    );

    const retryBtn = screen.getByTestId('error-retry-button');
    expect(retryBtn).toBeInTheDocument();
    expect(retryBtn).toHaveTextContent('Retry Action');

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
