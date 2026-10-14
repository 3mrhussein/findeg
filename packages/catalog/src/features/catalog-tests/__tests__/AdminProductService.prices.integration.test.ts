import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  connectToTestDatabase,
  type TestDatabase,
} from '../../../../../../configs/vitest/postgres/index';
import { AdminProductService } from '@findeg/catalog';
import { ValidationError } from '@findeg/domain-errors';

/** Real service commands validate the pair the writer actually persists. */
describe('AdminProductService partial price writes on PostgreSQL', () => {
  let testDb: TestDatabase;
  const service = new AdminProductService();
  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => {
    await testDb.close();
  });

  async function product() {
    const created = await service.createProduct({
      localizedName: { en: `Price fixture ${randomUUID()}`, ar: 'دفتر' },
      tagIds: [],
      isActive: true,
      pricingMode: 'per-variant',
      variants: [
        {
          sku: `PRICE-${randomUUID()}`,
          localizedLabel: { en: 'Default', ar: 'افتراضي' },
          sortOrder: 0,
          isDefault: true,
          isActive: true,
          basePrice: 45,
          strikePrice: 60,
          images: [],
          attributes: [],
        },
      ],
    });
    const read = await service.getProductForEdit(created.productId);
    return {
      productId: created.productId,
      variantId: (
        read ??
        (() => {
          throw new Error('Expected a value');
        })()
      ).variants[0].id,
    };
  }

  it.each([40, 45])(
    'refuses a strike-price-only update at or below the stored base: %s',
    async (strikePrice) => {
      const { productId, variantId } = await product();
      await expect(
        service.updateProduct(productId, { variants: [{ id: variantId, strikePrice }] }),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(
        (
          (await service.getProductForEdit(productId)) ??
          (() => {
            throw new Error('Expected a value');
          })()
        ).variants[0],
      ).toMatchObject({
        basePrice: 45,
        strikePrice: 60,
      });
    },
  );

  it('refuses a base-price-only update reaching the stored compare-at price', async () => {
    const { productId, variantId } = await product();
    await expect(
      service.updateProduct(productId, { variants: [{ id: variantId, basePrice: 60 }] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([75, null])(
    'allows a higher compare-at price or explicitly clears it: %s',
    async (strikePrice) => {
      const { productId, variantId } = await product();
      await service.updateProduct(productId, { variants: [{ id: variantId, strikePrice }] });
      expect(
        (
          (await service.getProductForEdit(productId)) ??
          (() => {
            throw new Error('Expected a value');
          })()
        ).variants[0],
      ).toMatchObject({
        basePrice: 45,
        strikePrice,
      });
    },
  );

  it('serializes conflicting partial updates so only one valid price pair is saved', async () => {
    const { productId, variantId } = await product();
    const results = await Promise.allSettled([
      service.updateProduct(productId, { variants: [{ id: variantId, basePrice: 55 }] }),
      service.updateProduct(productId, { variants: [{ id: variantId, strikePrice: 50 }] }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejection = results.find((result) => result.status === 'rejected');
    expect(rejection?.status === 'rejected' && rejection.reason).toBeInstanceOf(ValidationError);
    const row = (
      (await service.getProductForEdit(productId)) ??
      (() => {
        throw new Error('Expected a value');
      })()
    ).variants[0];
    expect([
      [55, 60],
      [45, 50],
    ]).toContainEqual([row.basePrice, row.strikePrice]);
  });
  it('validates multiple changes to the same variant against earlier changes in the batch', async () => {
    const { productId, variantId } = await product();
    await expect(
      service.updateProduct(productId, {
        variants: [
          { id: variantId, basePrice: 55 },
          { id: variantId, strikePrice: 50 },
        ],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(
      (
        (await service.getProductForEdit(productId)) ??
        (() => {
          throw new Error('Expected a value');
        })()
      ).variants[0],
    ).toMatchObject({
      basePrice: 45,
      strikePrice: 60,
    });
  });
});
