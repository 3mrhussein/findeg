import { vi } from 'vitest';
vi.mock('@findeg/db/queries', () => ({}));
import { describe, expect, it } from 'vitest';
import {
  createAdminSearchAnalyticsService,
  createBrandService,
  createCategoryService,
  createCollectionService,
  createProductService,
  createSearchService,
  createTagService,
  createVariantService,
} from '../index';

describe('catalog service factories', () => {
  it('creates a fresh instance of each service on every call', () => {
    const factories = [
      createProductService,
      createCategoryService,
      createVariantService,
      createTagService,
      createCollectionService,
      createSearchService,
      createBrandService,
      createAdminSearchAnalyticsService,
    ];
    for (const factory of factories) {
      expect(factory()).not.toBe(factory());
    }
  });
});
