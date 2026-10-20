import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HeroStudioStage } from './HeroStudioStage';

describe('HeroStudioStage', () => {
  it('renders typography block, 3-column metadata strip, and HUD inspection', () => {
    const onTrackSelect = vi.fn();
    const onAddItem = vi.fn();

    render(
      <HeroStudioStage
        activeTrack="highschool"
        onTrackSelect={onTrackSelect}
        onAddItem={onAddItem}
      />,
    );

    expect(screen.getByText(/CINEMATIC 3D STATIONERY STUDIO/i)).toBeDefined();
    expect(screen.getAllByText(/CAMPUS LOCKER PICKUP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/15% .EDU DISCOUNT/i)).toBeDefined();
    expect(screen.getByText(/4 ACADEMIC TRACKS/i)).toBeDefined();

    // Verify HUD button triggers onAddItem
    const addBtn = screen.getByRole('button', { name: /\+ ADD TO SUPPLY LIST/i });
    fireEvent.click(addBtn);
    expect(onAddItem).toHaveBeenCalled();
  });
});
