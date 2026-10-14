import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorBoundaryPage from '../../app/[locale]/error';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from './types';

const services = vi.hoisted(() => ({ balances: vi.fn(), listing: vi.fn(), product: vi.fn() }));
vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}));
vi.mock('next/cache', () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }));
vi.mock('@findeg/inventory', () => ({
  createInventoryService: () => ({ getWarehouseBalances: services.balances }),
}));
vi.mock('@findeg/catalog', () => ({
  parse: (locale: string) => locale,
  createProductService: () => ({
    getFilteredProducts: services.listing,
    getBySlug: services.product,
    getRelatedProducts: async () => [],
    getPriceBounds: async () => ({ minPrice: 0, maxPrice: 100 }),
  }),
  createCategoryService: () => ({ getTree: async () => [] }),
  createBrandService: () => ({ getAll: async () => [] }),
}));
import { getProductPdp, getShopPlpViewModel } from './queries';

const product: Product = {
  id: 1,
  slug: 'pencil',
  name: 'Pencil',
  description: '',
  longDescription: '',
  isActive: true,
  rating: 0,
  reviewsCount: 0,
  variants: [
    {
      id: 10,
      productId: 1,
      sku: 'P1',
      variantKey: 'default',
      sortOrder: 0,
      isDefault: true,
      isActive: true,
      basePrice: '5.00',
    },
  ],
};

describe('catalog inventory hydration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    services.listing.mockResolvedValue({ products: [product], total: 1 });
    services.product.mockResolvedValue(product);
  });
  it('loads listing stock and preserves active and inactive warehouses', async () => {
    services.balances.mockResolvedValue([
      {
        variantId: 10,
        warehouseId: 1,
        warehouseCode: 'MAIN',
        isActive: true,
        onHand: 8,
        reserved: 2,
        available: 6,
      },
      {
        variantId: 10,
        warehouseId: 2,
        warehouseCode: 'OLD',
        isActive: false,
        onHand: 100,
        reserved: 0,
        available: 0,
      },
    ]);
    const listing = await getShopPlpViewModel('en', [], {});
    const pdp = await getProductPdp('en', 'pencil');
    expect(services.balances).toHaveBeenCalledWith(10);
    expect(listing?.products[0]?.variants?.[0]?.inventory).toEqual(
      pdp?.product.variants?.[0]?.inventory,
    );
    expect(pdp?.stockSnapshot).toEqual({ inStock: true, quantity: 6 });
  });
  it('treats confirmed empty inventory and inactive-only inventory as out of stock', async () => {
    services.balances.mockResolvedValue([]);
    expect((await getProductPdp('en', 'pencil'))?.stockSnapshot.inStock).toBe(false);
    services.balances.mockResolvedValue([
      {
        variantId: 10,
        warehouseId: 2,
        warehouseCode: 'OLD',
        isActive: false,
        onHand: 100,
        reserved: 0,
        available: 0,
      },
    ]);
    expect((await getProductPdp('en', 'pencil'))?.stockSnapshot).toEqual({
      inStock: false,
      quantity: 0,
    });
  });
  it('propagates inventory failures instead of misreporting zero stock', async () => {
    services.balances.mockRejectedValue(new Error('Database offline'));
    await expect(getShopPlpViewModel('en', [], {})).rejects.toThrow('Database offline');
  });
  it('recovers the error UI after retrying a failed listing query', async () => {
    services.balances.mockRejectedValueOnce(new Error('Database offline')).mockResolvedValue([]);
    let failure: Error;
    try {
      await getShopPlpViewModel('en', [], {});
      throw new Error('Expected query failure');
    } catch (error) {
      failure = error instanceof Error ? error : new Error(String(error));
    }
    const view = render(
      React.createElement(ErrorBoundaryPage, {
        error: failure,
        retry: () => {
          void getShopPlpViewModel('en', [], {}).then((listing) => {
            view.rerender(React.createElement('div', null, listing?.products[0]?.name));
          });
        },
      }),
    );
    fireEvent.click(screen.getByTestId('error-retry-button'));
    await waitFor(() => expect(screen.getByText('Pencil')).toBeInTheDocument());
    expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument();
    expect(services.listing).toHaveBeenCalledTimes(2);
  });
});
