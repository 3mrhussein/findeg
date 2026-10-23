import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ZeroGravityField } from './ZeroGravityField';

describe('ZeroGravityField', () => {
  it('renders section headline, physics controls, and philosophy band', () => {
    render(<ZeroGravityField />);

    expect(screen.getByText(/ZERO-GRAVITY STATIONERY FIELD/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /ZERO-G FLOAT/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /ORBIT SWIRL/i })).toBeDefined();

    expect(screen.getByText(/TACTILE UTILITY/i)).toBeDefined();
    expect(screen.getByText(/ZERO DISTRACTION/i)).toBeDefined();
    expect(screen.getByText(/CAMPUS STAGING/i)).toBeDefined();
  });
});
