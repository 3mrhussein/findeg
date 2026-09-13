import {
  shouldFilterAdminProductsListWithServerFilters,
  shouldManageAdminBrandsCrudFromDashboard,
  shouldManageAdminCategoriesCrudFromDashboard,
  shouldReflectInventoryUpdateFromAdminInStorefrontStockBehavior,
  shouldReflectDeletedProductFromAdminInShop,
  shouldReflectNewlyCreatedProductFromAdminInShop,
  shouldReflectUpdatedProductFromAdminInShop,
} from '../../support/scenario/admin';

describe('Admin Dashboard E2E', () => {
  it('should let admin create a product and expose it to shoppers in catalog flows', () => {
    shouldReflectNewlyCreatedProductFromAdminInShop();
  });

  it('should allow admin to filter products list using server-driven filters', () => {
    shouldFilterAdminProductsListWithServerFilters();
  });

  it('should let admin update a product and reflect changes in storefront search', () => {
    shouldReflectUpdatedProductFromAdminInShop();
  });

  it('should let admin delete a product and hide it from storefront search', () => {
    shouldReflectDeletedProductFromAdminInShop();
  });

  it('should let admin create update and delete categories from dashboard', () => {
    shouldManageAdminCategoriesCrudFromDashboard();
  });

  it('should let admin create update and delete brands from dashboard', () => {
    shouldManageAdminBrandsCrudFromDashboard();
  });

  it('should let admin update inventory and enforce storefront stock behavior', () => {
    shouldReflectInventoryUpdateFromAdminInStorefrontStockBehavior();
  });
});
