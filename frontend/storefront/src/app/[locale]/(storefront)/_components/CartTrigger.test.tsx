import { TooltipProvider } from '@findeg/ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cart = vi.hoisted(() => ({ cartCount: 0, setIsCartOpen: vi.fn() }));
vi.mock('@hooks/useCart', () => ({ useCart: () => cart }));
vi.mock('next-intl', () => ({ useTranslations: () => () => 'Open shopping cart' }));

import { CartTrigger } from './CartTrigger';

describe('CartTrigger', () => {
  beforeEach(() => {
    cart.cartCount = 0;
    cart.setIsCartOpen.mockReset();
  });

  it('omits the badge from server HTML even when Cart data is already available', () => {
    cart.cartCount = 7;
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    expect(container.querySelector('[data-testid="header-cart-trigger"]')).toHaveTextContent('');
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('updates the hydrated badge and removes it when the Cart becomes empty', () => {
    const view = render(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    const trigger = screen.getByTestId('header-cart-trigger');
    expect(trigger).toHaveTextContent('');
    for (const count of [1, 12, 0]) {
      cart.cartCount = count;
      view.rerender(
        <TooltipProvider>
          <CartTrigger />
        </TooltipProvider>,
      );
      expect(trigger.textContent).toBe(count > 0 ? String(count) : '');
    }
  });

  it.each([0, 3])('opens a Cart containing %s items after hydration', (count) => {
    cart.cartCount = count;
    render(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open shopping cart' }));
    expect(cart.setIsCartOpen).toHaveBeenCalledOnce();
    expect(cart.setIsCartOpen).toHaveBeenCalledWith(true);
  });

  it('hydrates server-empty navigation when the Cart has loaded before the badge hydrates', async () => {
    cart.cartCount = 0;
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    document.body.appendChild(container);
    cart.cartCount = 1;
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(
      container,
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
      { onRecoverableError },
    );
    try {
      await act(async () => {});
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(screen.getByTestId('header-cart-trigger')).toHaveTextContent('1');
    } finally {
      await act(async () => root.unmount());
      container.remove();
      cart.cartCount = 0;
    }
  });
});
