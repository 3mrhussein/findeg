/**
 * Cache Invalidation E2E Tests (Phase 5.3)
 *
 * Tests read-your-writes semantics with Next.js 16 Cache Components.
 * Verifies that mutations automatically invalidate related caches without requiring
 * page reloads (T128-T131).
 */

import { buildTestProduct } from '../support/utils/product-factory';
import { buildTestCategory } from '../support/utils/category-factory';
import {
  visitAdminProductsList,
  findAdminProductIdBySku,
  updateProductFromUi,
  visitEditProductForm,
  deleteProductFromListById,
} from '../support/actions/admin-product.actions';
import {
  visitAdminCategoriesList,
  createCategoryFromUi,
  deleteCategoryFromListById,
} from '../support/actions/admin-category.actions';
import { adminSelectors } from '../support/selectors/admin.selectors';
import { UI_ROUTES, API_ROUTES } from '../support/constants/routes';
import { API_QUERY_DEFAULTS, buildApiUrl } from '../support/constants/api-query';
import { localePath } from '../support/utils/url';

describe('Cache Invalidation E2E (Phase 5.3)', () => {
  beforeEach(() => {
    cy.loginAsAdminSession();
  });

  describe('T128: Product creation → list update (read-your-writes)', () => {
    it('should show newly created product in list immediately after creation', () => {
      const testProduct = buildTestProduct();

      // Create new product via API
      cy.createAdminProductApi(testProduct, 'Keychains');

      // Visit products list - should include the newly created product via cache invalidation
      visitAdminProductsList();

      // Search for the product by SKU
      cy.get(adminSelectors.productsFilterSearchInput, { timeout: 10000 }).type(testProduct.sku);

      // Verify new product appears in the list (cache tag "products" was invalidated)
      cy.contains('td', testProduct.nameEn, { timeout: 10000 }).should('be.visible');

      // Cleanup
      cy.cleanupProductBySku(testProduct.sku);
    });

    it('should immediately reflect product update in list (cache invalidation)', () => {
      const testProduct = buildTestProduct();
      const updatedName = `Updated-${Date.now()}`;

      // Create product via API
      cy.createAdminProductApi(testProduct, 'Keychains');

      // Find product ID
      findAdminProductIdBySku(testProduct.sku).then((productId) => {
        // Update product
        visitEditProductForm(productId);
        updateProductFromUi({ nameEn: updatedName });

        // Navigate back to products list
        cy.visit(localePath(UI_ROUTES.adminProducts));

        // Verify the updated name appears in the list
        // The "products" cache tag was invalidated by updateProduct action
        cy.get(adminSelectors.productsFilterSearchInput, { timeout: 10000 }).type(testProduct.sku);
        cy.contains('td', updatedName, { timeout: 10000 }).should('be.visible');
      });

      // Cleanup
      cy.cleanupProductBySku(testProduct.sku);
    });

    it('should immediately remove deleted product from list', () => {
      const testProduct = buildTestProduct();

      // Create product
      cy.createAdminProductApi(testProduct, 'Keychains');

      // Visit products list and verify product exists
      visitAdminProductsList();
      cy.get(adminSelectors.productsFilterSearchInput, { timeout: 10000 }).type(testProduct.sku);
      cy.contains('td', testProduct.nameEn, { timeout: 10000 }).should('be.visible');

      // Delete product
      findAdminProductIdBySku(testProduct.sku).then((productId) => {
        deleteProductFromListById(productId);

        // Return to list after deletion
        cy.visit(localePath(UI_ROUTES.adminProducts));

        // Verify product is gone (deleteProduct invalidated the "products" cache)
        cy.get(adminSelectors.productsFilterSearchInput, { timeout: 10000 }).clear();
        cy.get(adminSelectors.productsFilterSearchInput).type(testProduct.sku);

        cy.get('tbody tr', { timeout: 5000 }).then(($rows) => {
          const productFound = [...$rows].some(
            (row) => row.textContent && row.textContent.includes(testProduct.nameEn),
          );
          expect(productFound, 'deleted product should not appear in list').to.eq(false);
        });
      });
    });
  });

  describe('T130: Category update → immediate list reflection (cache invalidation)', () => {
    it('should show newly created category immediately in list', () => {
      const testCategory = buildTestCategory();

      // Create category via API
      cy.createAdminCategoryApi(testCategory);

      // Visit categories list
      visitAdminCategoriesList();

      // Verify new category appears in the tree (cache tag "categories" invalidated)
      cy.contains(testCategory.nameEn, { timeout: 10000 }).should('be.visible');

      // Cleanup
      cy.deleteCategoryBySlug(testCategory.slug);
    });

    it('should immediately remove deleted category from list', () => {
      const testCategory = buildTestCategory();

      // Create category
      cy.createAdminCategoryApi(testCategory);

      // Visit list and verify it exists
      visitAdminCategoriesList();
      cy.contains(testCategory.nameEn, { timeout: 10000 }).should('be.visible');

      // Delete category (invalidates "categories" cache)
      cy.deleteCategoryBySlug(testCategory.slug);

      // Return to list
      visitAdminCategoriesList();

      // Verify deleted category is gone (cache was invalidated)
      cy.get('body').then(($body) => {
        const categoryFound = $body.text().includes(testCategory.nameEn);
        expect(categoryFound, 'deleted category should not appear in list').to.eq(false);
      });
    });
  });

  describe('T131: Cache invalidation mechanism verification', () => {
    it('should verify updateTag() causes immediate data refresh', () => {
      const testProduct = buildTestProduct();

      // Create product
      cy.createAdminProductApi(testProduct, 'Keychains');

      // Query product list immediately - should return fresh data including new product
      // This verifies that createProduct action called updateTag("products")
      cy.request({
        method: 'GET',
        url: buildApiUrl(API_ROUTES.products, {
          lang: API_QUERY_DEFAULTS.language,
          q: testProduct.sku,
        }),
      }).then((response) => {
        const found = (response.body?.products || []).some((p: any) => p.sku === testProduct.sku);
        expect(found, 'product should appear immediately after creation via updateTag()').to.eq(
          true,
        );
      });

      // Cleanup
      cy.cleanupProductBySku(testProduct.sku);
    });

    it('should verify all CRUD operations call updateTag()', () => {
      const testProduct = buildTestProduct();

      // Track cache invalidation through product lifecycle
      cy.createAdminProductApi(testProduct, 'Keychains');

      // Verify creation: product appears in list
      visitAdminProductsList();
      cy.get(adminSelectors.productsFilterSearchInput).type(testProduct.sku);
      cy.contains('td', testProduct.nameEn).should('be.visible');

      // Verify update: changed data is visible
      const updatedName = `Updated-${Date.now()}`;
      findAdminProductIdBySku(testProduct.sku).then((productId) => {
        visitEditProductForm(productId);
        updateProductFromUi({ nameEn: updatedName });
        cy.visit(localePath(UI_ROUTES.adminProducts));
        cy.get(adminSelectors.productsFilterSearchInput).clear().type(testProduct.sku);
        cy.contains('td', updatedName).should('be.visible');

        // Verify deletion: product is removed from list
        deleteProductFromListById(productId);
        cy.visit(localePath(UI_ROUTES.adminProducts));
        cy.get(adminSelectors.productsFilterSearchInput).clear().type(testProduct.sku);
        cy.get('tbody tr').then(($rows) => {
          const found = [...$rows].some((row) => row.textContent?.includes(testProduct.nameEn));
          expect(found).to.eq(false);
        });
      });
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      createAdminProductApi(product: any, categoryName: string): Chainable<void>;
      createAdminCategoryApi(category: any): Chainable<void>;
      deleteCategoryBySlug(slug: string): Chainable<void>;
      cleanupProductBySky(sku: string): Chainable<void>;
      loginAsAdminSession(): Chainable<void>;
      visitAdminNewProductForm(): Chainable<void>;
      createAdminProductUi(product: any, categoryName: string): Chainable<void>;
    }
  }
}
