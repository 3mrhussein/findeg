import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StudyClockDial } from './StudyClockDial';

describe('StudyClockDial', () => {
  it('renders dial, numerals 1-12, and session presets', () => {
    render(<StudyClockDial />);

    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('9')).toBeDefined();

    expect(screen.getByRole('button', { name: /08:00 LECTURE/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /13:00 STUDIO LAB/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /17:00 LIBRARY SPRINT/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /21:00 EXAM REVIEW/i })).toBeDefined();
  });

  it('triggers onSelectSession when a session preset button is clicked', () => {
    const onSelectSession = vi.fn();
    render(<StudyClockDial onSelectSession={onSelectSession} />);

    fireEvent.click(screen.getByRole('button', { name: /13:00 STUDIO LAB/i }));
    expect(onSelectSession).toHaveBeenCalledWith(1);
  });

  it('updates the ruler hand transform angle according to active session', () => {
    const { rerender } = render(<StudyClockDial activeSessionIndex={0} />);
    const rotor = screen.getByTestId('clock-hand-rotor');
    expect(rotor.style.transform).toBe('rotate(-90deg)');

    rerender(<StudyClockDial activeSessionIndex={1} />);
    expect(rotor.style.transform).toBe('rotate(12deg)');
  });
});
