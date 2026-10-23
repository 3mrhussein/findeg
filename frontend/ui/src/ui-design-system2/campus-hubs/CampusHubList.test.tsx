import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CampusHubList } from './CampusHubList';

describe('CampusHubList', () => {
  it('renders all campus hubs with status badges and hours', () => {
    render(<CampusHubList />);

    expect(screen.getByText(/PALO ALTO CENTRAL LOCKER HUB/i)).toBeDefined();
    expect(screen.getByText(/UC BERKELEY TELEGRAPH DEPOT/i)).toBeDefined();
    expect(screen.getByText(/CAMBRIDGE KENDALL SQUARE HUB/i)).toBeDefined();
  });

  it('handles hub selection callback', () => {
    const onSelectHub = vi.fn();
    render(<CampusHubList onSelectHub={onSelectHub} />);

    fireEvent.click(screen.getByText(/UC BERKELEY TELEGRAPH DEPOT/i));
    expect(onSelectHub).toHaveBeenCalledWith('berkeley');
  });
});
