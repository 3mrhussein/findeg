import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cart = vi.hoisted(() => ({
  clearCart: vi.fn(),
  cartItems: [
    {
      productId: 10,
      variantId: 101,
      sku: 'PEN-BLUE',
      productName: 'Blue pen',
      variantLabel: '0.7 mm',
      quantity: 1,
      unitPrice: 10,
      currency: 'EGP',
    },
  ],
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('@hooks/useCart', () => ({
  useCart: () => ({
    cartItems: cart.cartItems,
    cartTotal: 10,
    clearCart: cart.clearCart,
  }),
}));
vi.mock('@i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

import { CheckoutClient } from './CheckoutClient';

const initialPrefill = {
  fullName: 'Mona Ahmed',
  guestEmail: 'mona@example.com',
  phone: '01012345678',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Makram Ebeid',
  building: '',
  floor: '',
  apartment: '',
  notes: '',
};

const originalQuote = {
  lines: [{ variantId: 101, quantity: 1, unitPrice: 10, discounts: [], lineTotal: 10 }],
  shipping: 50,
  subtotal: 10,
  total: 60,
  currency: 'EGP' as const,
  confirmation: 'confirmation-original',
};

const changedQuote = {
  ...originalQuote,
  lines: [
    {
      variantId: 101,
      quantity: 1,
      unitPrice: 12,
      discounts: [{ source: 'list-offer', amount: 2 }],
      lineTotal: 10,
    },
  ],
  shipping: 55,
  total: 65,
  confirmation: 'confirmation-changed',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('CheckoutClient acceptance failures', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValueOnce('guest-id').mockReturnValue('key'),
    });
    window.localStorage.clear();
    cart.clearCart.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a changed Quote and resubmits its new Confirmation only after the Customer confirms', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: originalQuote }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            error: {
              code: 'reconfirmation-required',
              message: 'Quote terms have changed; reconfirmation required',
              quote: changedQuote,
            },
          },
          409,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            order: { id: 22, orderReference: 'FE-ABC123' },
            message: 'Checkout accepted successfully',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<CheckoutClient initialPrefill={initialPrefill} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));

    expect(
      await screen.findByRole('heading', { name: 'Pages.Checkout.ReconfirmationTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Blue pen')).toBeInTheDocument();
    expect(screen.getByText('EGP 10.00 → EGP 12.00')).toBeInTheDocument();
    expect(
      screen.getByText('Pages.Checkout.NoDiscount → list-offer: EGP 2.00'),
    ).toBeInTheDocument();
    expect(screen.getByText('EGP 50.00 → EGP 55.00')).toBeInTheDocument();
    expect(screen.getByText('EGP 60.00 → EGP 65.00')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cart.clearCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.ConfirmUpdatedQuote' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const confirmedRequest = JSON.parse(fetchMock.mock.calls[2][1]?.body as string);
    expect(confirmedRequest.confirmation).toBe('confirmation-changed');
    await waitFor(() => expect(cart.clearCart).toHaveBeenCalledOnce());
  });

  it('names short items and their available quantities while keeping the Cart', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: originalQuote }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            error: {
              code: 'insufficient-stock',
              message: 'Insufficient stock for requested items',
              shortfalls: [{ variantId: 101, requested: 3, available: 1 }],
            },
          },
          409,
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<CheckoutClient initialPrefill={initialPrefill} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));

    expect(
      await screen.findByRole('heading', { name: 'Pages.Checkout.InsufficientStockTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Blue pen')).toBeInTheDocument();
    expect(screen.getByText('Pages.Checkout.AvailableQuantity: 1')).toBeInTheDocument();
    expect(cart.clearCart).not.toHaveBeenCalled();
  });

  it('reuses the idempotency key and payload on a plain retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: originalQuote }))
      .mockResolvedValueOnce(
        jsonResponse({ success: false, error: { message: 'Temporary failure' } }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            order: { id: 22, orderReference: 'FE-ABC123' },
            message: 'Checkout accepted successfully',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<CheckoutClient initialPrefill={initialPrefill} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Temporary failure');
    expect(cart.clearCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const firstAttempt = fetchMock.mock.calls[1][1] as RequestInit;
    const retry = fetchMock.mock.calls[2][1] as RequestInit;
    expect(firstAttempt.headers).toMatchObject({ 'Idempotency-Key': 'key' });
    expect(retry.headers).toMatchObject({ 'Idempotency-Key': 'key' });
    expect(retry.body).toBe(firstAttempt.body);
    await waitFor(() => expect(cart.clearCart).toHaveBeenCalledOnce());
  });
});
