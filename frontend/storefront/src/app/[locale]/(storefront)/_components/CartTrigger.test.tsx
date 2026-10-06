import { TooltipProvider } from '@findeg/ui';
import { act, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const cart = vi.hoisted(() => ({ cartCount: 0, setIsCartOpen: vi.fn() }));
vi.mock('@hooks/useCart', () => ({ useCart: () => cart }));
vi.mock('next-intl', () => ({ useTranslations: () => () => 'Open shopping cart' }));

import { CartTrigger } from './CartTrigger';

describe('CartTrigger', () => {
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
