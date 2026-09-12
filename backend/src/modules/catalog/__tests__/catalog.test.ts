import { describe, expect, it } from 'vitest';
import { createCatalogManagement } from '../public.js';

describe('Catalog management', () => {
  it('creates bilingual active variants only for an active Catalog product', async () => {
    const catalog = {
      createActiveVariant: async () => 19,
      updateActiveVariant: async () => false,
      hasActiveVariant: async () => true,
      listActiveVariants: async () => [],
    };
    const inventory = {
      adjustOnHand: async () => 'adjusted' as const,
      availabilityFor: async () => new Map(),
    };
    await expect(
      createCatalogManagement(catalog, inventory).createVariant({
        productId: 4,
        sku: 'PEN-BLUE',
        variantKey: 'blue',
        label: { en: 'Blue', ar: 'أزرق' },
        basePrice: '15.50',
        isActive: true,
      }),
    ).resolves.toEqual({ status: 'created', variantId: 19 });
  });

  it('rejects a stock reduction that would make contested stock negative', async () => {
    const catalog = {
      createActiveVariant: async () => undefined,
      updateActiveVariant: async () => false,
      hasActiveVariant: async () => true,
      listActiveVariants: async () => [],
    };
    const inventory = {
      adjustOnHand: async () => 'insufficient-stock' as const,
      availabilityFor: async () => new Map(),
    };
    await expect(
      createCatalogManagement(catalog, inventory).adjustInventory({
        variantId: 19,
        warehouseId: 2,
        quantityDelta: -3,
        actorId: 7,
      }),
    ).resolves.toEqual({ status: 'insufficient-stock' });
  });

  it('shows customers localized active variants with current availability', async () => {
    const catalog = {
      createActiveVariant: async () => undefined,
      updateActiveVariant: async () => false,
      hasActiveVariant: async () => false,
      listActiveVariants: async () => [
        { id: 19, sku: 'PEN-BLUE', name: 'قلم', label: 'أزرق', price: '15.50' },
      ],
    };
    const inventory = {
      adjustOnHand: async () => 'not-found' as const,
      availabilityFor: async () => new Map([[19, 4]]),
    };
    await expect(createCatalogManagement(catalog, inventory).browse('ar')).resolves.toEqual([
      { id: 19, sku: 'PEN-BLUE', name: 'قلم', label: 'أزرق', price: '15.50', available: 4 },
    ]);
  });
});
