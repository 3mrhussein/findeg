import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PhysicsModeBar } from './PhysicsModeBar';

describe('PhysicsModeBar', () => {
  it('renders mode buttons and triggers onModeChange', () => {
    const onModeChange = vi.fn();
    const onScatterImpulse = vi.fn();

    render(
      <PhysicsModeBar
        mode="float"
        onModeChange={onModeChange}
        onScatterImpulse={onScatterImpulse}
      />,
    );

    const vortexBtn = screen.getByRole('button', { name: /ORBIT SWIRL/i });
    fireEvent.click(vortexBtn);
    expect(onModeChange).toHaveBeenCalledWith('vortex');

    const scatterBtn = screen.getByRole('button', { name: /SCATTER IMPULSE/i });
    fireEvent.click(scatterBtn);
    expect(onScatterImpulse).toHaveBeenCalledTimes(1);
  });
});
