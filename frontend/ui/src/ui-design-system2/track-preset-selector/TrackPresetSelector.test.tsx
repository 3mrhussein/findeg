import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TrackPresetSelector } from './TrackPresetSelector';

describe('TrackPresetSelector', () => {
  it('renders all grade track pills', () => {
    render(<TrackPresetSelector activeTrack="highschool" onTrackSelect={vi.fn()} />);

    expect(screen.getByText('HIGH SCHOOL CORE')).toBeDefined();
    expect(screen.getByText('UNIVERSITY STEM')).toBeDefined();
    expect(screen.getByText('ART & ARCH STUDIO')).toBeDefined();
    expect(screen.getByText('FULL MASTER KIT')).toBeDefined();
  });

  it('triggers onTrackSelect with correct track key', () => {
    const onTrackSelect = vi.fn();
    render(<TrackPresetSelector activeTrack="highschool" onTrackSelect={onTrackSelect} />);

    fireEvent.click(screen.getByText('UNIVERSITY STEM'));
    expect(onTrackSelect).toHaveBeenCalledWith('stem');

    fireEvent.click(screen.getByText('ART & ARCH STUDIO'));
    expect(onTrackSelect).toHaveBeenCalledWith('studio');

    fireEvent.click(screen.getByText('FULL MASTER KIT'));
    expect(onTrackSelect).toHaveBeenCalledWith('all');
  });
});
