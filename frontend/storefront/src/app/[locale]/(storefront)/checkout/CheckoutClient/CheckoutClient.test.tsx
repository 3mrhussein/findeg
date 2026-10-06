import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicSupplyList } from '@findeg/backend/features/school';

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

const supplyList: PublicSupplyList = {
  publicCode: 'a'.repeat(32),
  status: 'published',
  grade: 'Grade 1',
  academicYear: '2026/2027',
  title: { en: 'Grade 1 supplies' },
  description: null,
  heroImageUrl: null,
  school: { id: 1, nameEn: 'Nile School', nameAr: 'مدرسة النيل', logoUrl: null },
  replacementPublicCode: null,
  offer: null,
  items: [
    {
      id: 7,
      required: true,
      quantity: 3,
      exactItem: true,
      specification: null,
      label: { en: 'Blue pen' },
      note: null,
      defaultVariant: {
        variantId: 101,
        sku: 'PEN-BLUE',
        name: { en: 'Blue pen' },
        variantLabel: { en: '0.7 mm' },
        brand: null,
        price: '10.00',
        inStock: true,
      },
      eligibleVariants: [
        {
          variantId: 101,
          sku: 'PEN-BLUE',
          name: { en: 'Blue pen' },
          variantLabel: { en: '0.7 mm' },
          brand: null,
          price: '10.00',
          inStock: true,
          differingAttributes: {},
        },
      ],
    },
  ],
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

  it('hydrates server-empty checkout when the Cart has already loaded before the page hydrates', async () => {
    const loadedItems = cart.cartItems;
    const container = document.createElement('div');
    const recoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      cart.cartItems = [];
      container.innerHTML = renderToString(<CheckoutClient initialPrefill={initialPrefill} />);
      document.body.appendChild(container);
      cart.cartItems = loadedItems;
      await act(async () => {
        root = hydrateRoot(container, <CheckoutClient initialPrefill={initialPrefill} />, {
          onRecoverableError: recoverableError,
        });
      });
      expect(recoverableError).not.toHaveBeenCalled();
      expect(container.querySelector('#fullName')).not.toBeNull();
    } finally {
      cart.cartItems = loadedItems;
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it('renders ordinary checkout as empty on the server even with a populated Cart', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<CheckoutClient initialPrefill={initialPrefill} />);
    expect(container).toHaveTextContent('Pages.Cart.Empty');
    expect(container.querySelector('#fullName')).toBeNull();
  });

  it('renders server-provided List checkout immediately and hydrates without an empty-state flash', async () => {
    const element = (
      <CheckoutClient
        initialPrefill={initialPrefill}
        checkoutSource={{ source: 'list', publicCode: supplyList.publicCode, list: supplyList }}
      />
    );
    const container = document.createElement('div');
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      container.innerHTML = renderToString(element);
      document.body.appendChild(container);
      expect(container.querySelector('#fullName')).toHaveValue(initialPrefill.fullName);
      expect(container).not.toHaveTextContent('Pages.Cart.Empty');
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError });
      });
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(container.querySelector('#fullName')).toHaveValue(initialPrefill.fullName);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it('shows an empty Cart after hydration, then follows Cart additions and removals', () => {
    const loadedItems = cart.cartItems;
    try {
      cart.cartItems = [];
      const view = render(<CheckoutClient initialPrefill={initialPrefill} />);
      expect(screen.getByText('Pages.Cart.Empty')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Pages.Checkout.PlaceOrder' }),
      ).not.toBeInTheDocument();

      cart.cartItems = loadedItems;
      view.rerender(<CheckoutClient initialPrefill={initialPrefill} />);
      expect(screen.queryByText('Pages.Cart.Empty')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' })).toBeInTheDocument();

      cart.cartItems = [];
      view.rerender(<CheckoutClient initialPrefill={initialPrefill} />);
      expect(screen.getByText('Pages.Cart.Empty')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Pages.Checkout.PlaceOrder' }),
      ).not.toBeInTheDocument();
      expect(cart.clearCart).not.toHaveBeenCalled();
    } finally {
      cart.cartItems = loadedItems;
    }
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
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            order: { id: 25, orderReference: 'FE-LIST25' },
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

  it('accepts the active List Selection without clearing the Cart', async () => {
    window.localStorage.setItem(
      `findeg:list-selection:${supplyList.publicCode}`,
      JSON.stringify({
        v: 1,
        lines: [{ listItemId: 7, variantId: 101, quantity: 5 }],
      }),
    );
    const listQuote = {
      ...originalQuote,
      lines: [
        {
          listItemId: 7,
          variantId: 101,
          quantity: 5,
          unitPrice: 10,
          discounts: [],
          lineTotal: 50,
        },
      ],
      subtotal: 50,
      total: 100,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: listQuote }))
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            order: { id: 23, orderReference: 'FE-LIST23' },
            message: 'Checkout accepted successfully',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <CheckoutClient
        initialPrefill={initialPrefill}
        checkoutSource={{
          source: 'list',
          publicCode: supplyList.publicCode,
          list: supplyList,
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const validate = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    const accept = JSON.parse(fetchMock.mock.calls[1][1]?.body as string);
    expect(validate).toMatchObject({
      source: 'list',
      publicCode: supplyList.publicCode,
      lines: [{ listItemId: 7, variantId: 101, quantity: 5 }],
    });
    expect(accept).toMatchObject({
      source: 'list',
      publicCode: supplyList.publicCode,
      lines: [{ listItemId: 7, variantId: 101, quantity: 5 }],
      confirmation: originalQuote.confirmation,
    });
    expect(cart.clearCart).not.toHaveBeenCalled();
    expect(
      window.localStorage.getItem(`findeg:list-selection:${supplyList.publicCode}`),
    ).toBeNull();
  });

  it('keeps failed Cart and List attempts under separate idempotency keys', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('guest-id')
        .mockReturnValueOnce('cart-key')
        .mockReturnValueOnce('list-key'),
    });
    const listQuote = {
      ...originalQuote,
      lines: [{ ...originalQuote.lines[0], listItemId: 7, quantity: 3, lineTotal: 30 }],
      subtotal: 30,
      total: 80,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: originalQuote }))
      .mockResolvedValueOnce(
        jsonResponse({ success: false, error: { message: 'Cart timeout' } }, 500),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: listQuote }))
      .mockResolvedValueOnce(
        jsonResponse({ success: false, error: { message: 'List timeout' } }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            order: { id: 24, orderReference: 'FE-CART24' },
            message: 'Checkout accepted successfully',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const view = render(<CheckoutClient initialPrefill={initialPrefill} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cart timeout');

    view.rerender(
      <CheckoutClient
        initialPrefill={initialPrefill}
        checkoutSource={{ source: 'list', publicCode: supplyList.publicCode, list: supplyList }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

    view.rerender(<CheckoutClient initialPrefill={initialPrefill} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));

    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({
      'Idempotency-Key': 'cart-key',
    });
    expect(fetchMock.mock.calls[3][1]?.headers).toMatchObject({
      'Idempotency-Key': 'list-key',
    });
    expect(fetchMock.mock.calls[4][1]?.headers).toMatchObject({
      'Idempotency-Key': 'cart-key',
    });
    expect(fetchMock.mock.calls[4][1]?.body).toBe(fetchMock.mock.calls[1][1]?.body);

    view.rerender(
      <CheckoutClient
        initialPrefill={initialPrefill}
        checkoutSource={{ source: 'list', publicCode: supplyList.publicCode, list: supplyList }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pages.Checkout.PlaceOrder' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(6));
    expect(fetchMock.mock.calls[5][1]?.headers).toMatchObject({
      'Idempotency-Key': 'list-key',
    });
    expect(fetchMock.mock.calls[5][1]?.body).toBe(fetchMock.mock.calls[3][1]?.body);
  });
});
