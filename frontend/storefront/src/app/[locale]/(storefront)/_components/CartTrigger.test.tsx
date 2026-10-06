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

  it('omits a preloaded cart badge from the server snapshot', () => {
    cart.cartCount = 7;
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    expect(container.querySelector('[data-testid="header-cart-trigger"]')).not.toHaveTextContent(
      '7',
    );
  });

  it('reflects counts loaded after hydration and removes the badge when emptied', () => {
    const view = render(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Open shopping cart' });
    expect(trigger).toHaveTextContent(/^$/);
    cart.cartCount = 3;
    view.rerender(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    expect(trigger).toHaveTextContent('3');
    cart.cartCount = 0;
    view.rerender(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    expect(trigger).toHaveTextContent(/^$/);
  });

  it.each([0, 2])('opens the cart with a count of %s', (count) => {
    cart.cartCount = count;
    render(
      <TooltipProvider>
        <CartTrigger />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open shopping cart' }));
    expect(cart.setIsCartOpen).toHaveBeenCalledTimes(1);
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
