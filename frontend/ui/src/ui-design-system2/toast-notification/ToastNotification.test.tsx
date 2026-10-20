import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { ToastNotification } from './ToastNotification';

describe('ToastNotification', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message with volt dot when message is provided', () => {
    render(<ToastNotification message="15% STUDENT DISCOUNT APPLIED" />);
    expect(screen.getByText('15% STUDENT DISCOUNT APPLIED')).toBeDefined();
  });

  it('does not render when message is null', () => {
    const { container } = render(<ToastNotification message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('auto-dismisses after specified duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<ToastNotification message="ITEM ADDED" durationMs={2000} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
