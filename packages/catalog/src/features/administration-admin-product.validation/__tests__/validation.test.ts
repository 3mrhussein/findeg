import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationError } from '@findeg/domain-errors';
import {
  assertCatalogueWriteRules,
  ensureBrandExists,
  ensureCategoryExists,
  getExistingProductOrThrow,
  rethrowCatalogueWriteError,
} from '../index';

const queries = vi.hoisted(() => ({
  getCategoryById: vi.fn(),
  getBrandById: vi.fn(),
  getProductById: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => queries);

describe('catalogue existence checks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips the lookup when no category or brand is given', async () => {
    await ensureCategoryExists(null);
    await ensureBrandExists(undefined);
    expect(queries.getCategoryById).not.toHaveBeenCalled();
    expect(queries.getBrandById).not.toHaveBeenCalled();
  });

  it('passes for existing categories and brands and fails for missing ones', async () => {
    queries.getCategoryById.mockResolvedValueOnce({ id: 2 });
    await expect(ensureCategoryExists(2)).resolves.toBeUndefined();
    queries.getCategoryById.mockResolvedValueOnce(undefined);
    await expect(ensureCategoryExists(3)).rejects.toThrow('Category 3 not found');

    queries.getBrandById.mockResolvedValueOnce(undefined);
    await expect(ensureBrandExists(4)).rejects.toThrow('Brand 4 not found');
  });

  it('returns the product or throws when it does not exist', async () => {
    queries.getProductById.mockResolvedValueOnce({ id: 1 });
    expect(await getExistingProductOrThrow(1)).toEqual({ id: 1 });
    queries.getProductById.mockResolvedValueOnce(undefined);
    await expect(getExistingProductOrThrow(8)).rejects.toThrow('Product 8 not found');
  });
});

describe('catalogue write rules', () => {
  it('accepts well-formed SKUs and compare-at prices above the price', () => {
    expect(() => {
      assertCatalogueWriteRules([
        { sku: 'SKU-1', basePrice: 10, strikePrice: 12 },
        { sku: 'SKU-2', basePrice: 5, strikePrice: null },
        { basePrice: 5 },
      ]);
    }).not.toThrow();
  });

  it('maps a domain rule breach to a ValidationError on the variants field', () => {
    expect(() => {
      assertCatalogueWriteRules([{ sku: ' padded ', basePrice: 1 }]);
    }).toThrow(ValidationError);
    expect(() => {
      assertCatalogueWriteRules([{ basePrice: 10, strikePrice: 10 }]);
    }).toThrow(ValidationError);
  });

  it('rethrows other errors unchanged', () => {
    const plain = new Error('db down');
    expect(() => rethrowCatalogueWriteError(plain)).toThrow(plain);
  });
});
