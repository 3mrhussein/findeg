import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';

vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ErrorPage from '@components/shared/ErrorPage';
import ErrorBoundaryPage from '../app/[locale]/error';

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

describe('ErrorBoundary route component', () => {
  it('renders error page with working server-data retry', () => {
    const retry = vi.fn();
    render(<ErrorBoundaryPage error={new Error('Database offline')} retry={retry} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    const retryBtn = screen.getByTestId('error-retry-button');
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe('Data queries hardening', () => {
  it('enforces import server-only across every queries.ts file', () => {
    const dataDir = path.resolve(__dirname, '.');
    const queryFiles = fs
      .readdirSync(dataDir, { recursive: true })
      .filter((file) => typeof file === 'string' && file.endsWith('queries.ts'))
      .map((file) => path.join(dataDir, file as string));

    expect(queryFiles.length).toBeGreaterThan(0);

    for (const filePath of queryFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(
        content.includes("import 'server-only'") || content.includes('import "server-only"'),
      ).toBe(true);
    }
  });
});
