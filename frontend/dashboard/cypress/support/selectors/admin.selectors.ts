export const adminSelectors = {
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  loginSubmit: 'button[type="submit"]',
  productNameEnInput: 'input[name="name_en"]',
  productDescEnInput: 'textarea[name="description_en"]',
  productNameArInput: 'input[name="name_ar"]',
  productDescArInput: 'textarea[name="description_ar"]',
  productPriceInput: 'input[name="price"]',
  productSkuInput: 'input[name="sku"]',
  stockQuantityInput: 'input[name="stockQuantity"]',
  lowStockInput: 'input[name="lowStockThreshold"]',
  imagesInput: 'input[name="images"]',
  createProductButton: 'button[type="submit"]',
  productsFilterSearchInput: '[data-testid="admin-products-filter-search"]',
  productsFilterCategoryTrigger: '[data-testid="admin-products-filter-category"]',
  productsFilterBrandTrigger: '[data-testid="admin-products-filter-brand"]',
  productsFilterStatusTrigger: '[data-testid="admin-products-filter-status"]',
  productsFilterClearButton: '[data-testid="admin-products-filter-clear"]',
  /**
   *
   */
  productRowById: (id: number) => `[data-testid="admin-product-row-${id}"]`,
  /**
   *
   */
  productActionsById: (id: number) => `[data-testid="admin-product-actions-${id}"]`,
  /**
   *
   */
  productEditById: (id: number) => `[data-testid="admin-product-edit-${id}"]`,
  /**
   *
   */
  productDeleteById: (id: number) => `[data-testid="admin-product-delete-${id}"]`,
  productDeleteConfirm: '[data-testid="admin-product-delete-confirm"]',
  categoriesFilterInput: '[data-testid="admin-categories-filter-input"]',
  categoryNameEnInput: '[data-testid="admin-category-name-en"]',
  categoryNameArInput: '[data-testid="admin-category-name-ar"]',
  categoryDescEnInput: '[data-testid="admin-category-description-en"]',
  categoryDescArInput: '[data-testid="admin-category-description-ar"]',
  categorySlugInput: '[data-testid="admin-category-slug"]',
  categoryParentTrigger: '[data-testid="admin-category-parent-trigger"]',
  categorySortOrderInput: '[data-testid="admin-category-sort-order"]',
  categoryActiveCheckbox: '[data-testid="admin-category-active"]',
  categorySubmitButton: '[data-testid="admin-category-submit"]',
  /**
   *
   */
  categoryRowById: (id: number) => `[data-testid="admin-category-row-${id}"]`,
  /**
   *
   */
  categoryActionsById: (id: number) => `[data-testid="admin-category-actions-${id}"]`,
  /**
   *
   */
  categoryEditById: (id: number) => `[data-testid="admin-category-edit-${id}"]`,
  /**
   *
   */
  categoryDeleteById: (id: number) => `[data-testid="admin-category-delete-${id}"]`,
  brandsAddButton: '[data-testid="admin-brands-add"]',
  brandNameInput: '[data-testid="admin-brand-name"]',
  brandSlugInput: '[data-testid="admin-brand-slug"]',
  brandLogoUrlInput: '[data-testid="admin-brand-logo-url"]',
  brandActiveCheckbox: '[data-testid="admin-brand-active"]',
  brandSubmitButton: '[data-testid="admin-brand-submit"]',
  /**
   *
   */
  brandRowById: (id: number) => `[data-testid="admin-brand-row-${id}"]`,
  /**
   *
   */
  brandEditById: (id: number) => `[data-testid="admin-brand-edit-${id}"]`,
  /**
   *
   */
  brandDeleteById: (id: number) => `[data-testid="admin-brand-delete-${id}"]`,
  brandDeleteConfirm: '[data-testid="admin-brand-delete-confirm"]',
  /**
   *
   */
  inventoryRowById: (id: number) => `[data-testid="admin-inventory-row-${id}"]`,
  /**
   *
   */
  inventoryEditById: (id: number) => `[data-testid="admin-inventory-edit-${id}"]`,
  /**
   *
   */
  inventoryStockValueById: (id: number) => `[data-testid="admin-inventory-stock-value-${id}"]`,
  /**
   *
   */
  inventoryStockInputById: (id: number) => `[data-testid="admin-inventory-stock-input-${id}"]`,
  /**
   *
   */
  inventorySaveById: (id: number) => `[data-testid="admin-inventory-save-${id}"]`,
  /**
   *
   */
  inventoryCancelById: (id: number) => `[data-testid="admin-inventory-cancel-${id}"]`,
} as const;
