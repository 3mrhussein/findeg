/**
 * Reusable business/UI strings used by Cypress scenarios and actions.
 * Keep text assertions and frequently used labels centralized.
 */
export const SHOP_MESSAGES = {
  keychainsSlug: 'keychains',
  keychainsLabel: 'Keychains',
  missingBrandSlug: 'zzzz-no-brand-match',
  searchPrefix: 'Search Results for',
  checkoutTitle: 'Checkout',
  checkoutEmptyDescription: 'Add items to your cart before proceeding to checkout.',
  checkoutErrorFullName: 'Please enter your full name.',
  checkoutErrorEmail: 'Please enter a valid email address.',
  checkoutErrorPhone: 'Please enter a valid phone number.',
  checkoutErrorCity: 'Please enter your city.',
  checkoutErrorArea: 'Please enter your area.',
  checkoutErrorStreet: 'Please enter your street.',
  checkoutOrderCreateFailed: 'Failed to create order.',
  placeOrderButton: 'Place Order',
  orderConfirmed: 'Order Confirmed',
  sortPriceLowToHigh: 'Price: Low to High',
  sortPriceHighToLow: 'Price: High to Low',
  resultsRegex: /Showing\s+(\d+)\s+of\s+(\d+)\s+results/i,
} as const;

export const ADMIN_MESSAGES = {
  signInButtonRegex: /sign in/i,
  createProductHeadingRegex: /create product/i,
  createProductButtonRegex: /create product/i,
  categoryFieldLabel: 'Category',
} as const;
