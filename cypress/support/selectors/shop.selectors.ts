export const shopSelectors = {
  resultsSummaryText: "main p.text-muted-foreground",
  shopResultsHeading: "#shop-results-heading",
  categoryResultsHeading: "#category-results-heading",
  searchResultsHeading: "#search-results-heading",
  searchFallbackNotice: '[data-testid="search-fallback-notice"]',
  productTitle: "h1#product-title",
  productCardTitle: 'h3[data-testid^="product-card-title-"]',
  productCardAddById: (id: number) => `[data-testid="product-card-add-${id}"]`,
  productCardPrice: 'div[data-testid^="product-card-price-"]',
  headerCartTrigger: '[data-testid="header-cart-trigger"]',
  cartDrawerContent: '[data-testid="cart-drawer-content"]',
  cartDrawerDialogOpen: '[role="dialog"][data-state="open"]',
  /**
   *
   */
  cartItemById: (id: number) => `[data-testid="cart-item-${id}"]`,
  /**
   *
   */
  cartQuantityById: (id: number) => `[data-testid="cart-quantity-${id}"]`,
  /**
   *
   */
  cartIncreaseById: (id: number) => `[data-testid="cart-increase-${id}"]`,
  /**
   *
   */
  cartDecreaseById: (id: number) => `[data-testid="cart-decrease-${id}"]`,
  /**
   *
   */
  cartRemoveById: (id: number) => `[data-testid="cart-remove-${id}"]`,
  checkoutFullName: "#fullName",
  checkoutEmail: "#email",
  checkoutPhone: "#phone",
  checkoutCity: "#city",
  checkoutArea: "#area",
  checkoutStreet: "#street",
  checkoutSubmitButton: 'button[type="submit"]',
  checkoutErrorAlert: '[role="alert"]',
  /**
   *
   */
  categoryCardBySlug: (slug: string) => `[data-testid="category-card-${slug}"]`,
  /**
   *
   */
  productDetailAddToCartById: (id: number) => `[data-testid="product-detail-add-to-cart-${id}"]`,
  /**
   *
   */
  categoryFilterLabel: (slug: string) => `label[for="cat-${slug}"]`,
  categoryFilterCheckbox: (slug: string) => `[id="cat-${slug}"]`,
  /**
   *
   */
  brandFilterLabel: (slug: string) => `label[for="brand-${slug}"]`,
  brandFilterCheckbox: (slug: string) => `[id="brand-${slug}"]`,
  paginationNext: 'button[title="Next Page"]',
  sortTrigger: '[data-testid="shop-sort-trigger"]',
  /**
   *
   */
  sortOptionByValue: (value: string) => `[data-testid="shop-sort-option-${value}"]`,
} as const;
