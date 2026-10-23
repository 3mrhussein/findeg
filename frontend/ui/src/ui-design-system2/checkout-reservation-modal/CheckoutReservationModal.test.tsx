import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CheckoutReservationModal } from './CheckoutReservationModal';

describe('CheckoutReservationModal', () => {
  const mockSummary = {
    totalItems: 5,
    eduDiscountActive: true,
    netTotalDue: 42.5,
    formattedNetTotal: '$42.50',
  };

  it('does not render content when open is false', () => {
    render(<CheckoutReservationModal open={false} onOpenChange={() => {}} summary={mockSummary} />);
    expect(screen.queryByTestId('checkout-reservation-modal')).toBeNull();
  });

  it('renders modal details and summary when open is true', () => {
    render(
      <CheckoutReservationModal
        open={true}
        onOpenChange={() => {}}
        summary={mockSummary}
        defaultEmail="alex.rivera@stanford.edu"
      />,
    );

    expect(screen.getByTestId('checkout-reservation-modal')).toBeDefined();
    expect(screen.getByText(/CAMPUS LOCKER & DELIVERY RESERVATION/i)).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /YOUR SUPPLY PACK IS READY TO STAGE/i,
      }),
    ).toBeDefined();

    // Summary box
    expect(screen.getByText('5 ITEMS')).toBeDefined();
    expect(screen.getByText('15% APPLIED')).toBeDefined();
    expect(screen.getByText('$42.50')).toBeDefined();

    // Email input
    const emailInput = screen.getByLabelText(/STUDENT \.EDU EMAIL/i) as HTMLInputElement;
    expect(emailInput.value).toBe('alex.rivera@stanford.edu');
  });

  it('updates input fields and calls onConfirmReservation with form values', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <CheckoutReservationModal
        open={true}
        onOpenChange={onOpenChange}
        summary={mockSummary}
        onConfirmReservation={onConfirm}
      />,
    );

    const emailInput = screen.getByLabelText(/STUDENT \.EDU EMAIL/i);
    fireEvent.change(emailInput, { target: { value: 'jordan.lee@mit.edu' } });

    const hubSelect = screen.getByLabelText(/PICKUP HUB OR DELIVERY/i);
    fireEvent.change(hubSelect, {
      target: { value: 'Berkeley — 185 Bancroft Way (24/7 Hub)' },
    });

    const confirmBtn = screen.getByRole('button', {
      name: /CONFIRM RESERVATION/i,
    });
    fireEvent.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      email: 'jordan.lee@mit.edu',
      hub: 'Berkeley — 185 Bancroft Way (24/7 Hub)',
      summary: mockSummary,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes modal when Back button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <CheckoutReservationModal open={true} onOpenChange={onOpenChange} summary={mockSummary} />,
    );

    const backBtn = screen.getByRole('button', { name: /^BACK$/i });
    fireEvent.click(backBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
