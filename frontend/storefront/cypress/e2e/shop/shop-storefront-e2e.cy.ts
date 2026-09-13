import {
  shouldAddProductFromShopGridCardIntoCartDrawer,
  shouldAddProductFromDetailIntoCartDrawer,
  shouldAllowGuestCheckoutSubmission,
  shouldAllowRegistrationHappyPath,
  shouldFilterByBrandWithCorrectCounts,
  shouldFilterByPriceRangeWithCorrectCounts,
  shouldFilterByLeafCategoryWithCorrectCounts,
  shouldNavigateFromCategoryIndexToCategoryListing,
  shouldPersistCartAcrossRouteTransitions,
  shouldRedirectGuestFromMyAccountToRegistration,
  shouldRenderMyAccountOrderHistoryAndDetail,
  shouldShowCheckoutEmptyStateForEmptyCart,
  shouldShowCheckoutErrorWhenOrderApiFails,
  shouldSupportEnArRouteParityForKeyPages,
  shouldShowSearchResultsForKeywordWithCorrectCounts,
  shouldShowEmptyStateForRestrictiveFilters,
  shouldShowTypoTolerantSearchFallback,
  shouldSortAndPaginateShopResults,
  shouldSupportCartItemQuantityAndRemovalOperations,
  shouldValidateCheckoutFormFieldsBeforeSubmission,
} from '../../support/scenario/shop';

describe('Shop Storefront E2E', () => {
  beforeEach(() => {
    cy.clearCookie('admin_session');
    cy.clearLocalStorage('findeg_guest_id');
  });

  it('should filter products by category with DB-aligned counts', () => {
    shouldFilterByLeafCategoryWithCorrectCounts();
  });

  it('should filter products by brand with DB-aligned counts', () => {
    shouldFilterByBrandWithCorrectCounts();
  });

  it('should filter products by price range with DB-aligned counts', () => {
    shouldFilterByPriceRangeWithCorrectCounts();
  });

  it('should support sorting and pagination controls', () => {
    shouldSortAndPaginateShopResults();
  });

  it('should render search results for a keyword', () => {
    shouldShowSearchResultsForKeywordWithCorrectCounts();
  });

  it('should show typo-tolerant fallback when strict search has no exact matches', () => {
    shouldShowTypoTolerantSearchFallback();
  });

  it('should navigate from categories index to category listing', () => {
    shouldNavigateFromCategoryIndexToCategoryListing();
  });

  it('should show empty listing state for restrictive filters', () => {
    shouldShowEmptyStateForRestrictiveFilters();
  });

  it('should render key storefront routes in both en and ar locales', () => {
    shouldSupportEnArRouteParityForKeyPages();
  });

  it('should add product from detail page into cart drawer', () => {
    shouldAddProductFromDetailIntoCartDrawer();
  });

  it('should add product from shop grid card into cart drawer', () => {
    shouldAddProductFromShopGridCardIntoCartDrawer();
  });

  it('should persist cart across route transitions', () => {
    shouldPersistCartAcrossRouteTransitions();
  });

  it('should support cart quantity change and remove operations', () => {
    shouldSupportCartItemQuantityAndRemovalOperations();
  });

  it('should show checkout empty state when cart is empty', () => {
    shouldShowCheckoutEmptyStateForEmptyCart();
  });

  it('should validate checkout form fields before submission', () => {
    shouldValidateCheckoutFormFieldsBeforeSubmission();
  });

  it('should allow guest checkout submission', () => {
    shouldAllowGuestCheckoutSubmission();
  });

  it('should show checkout error message when order API fails', () => {
    shouldShowCheckoutErrorWhenOrderApiFails();
  });

  it('should complete registration happy path', () => {
    shouldAllowRegistrationHappyPath();
  });

  it('should render my-account order history and detail', () => {
    shouldRenderMyAccountOrderHistoryAndDetail();
  });

  it('should redirect guest from my-account to registration', () => {
    shouldRedirectGuestFromMyAccountToRegistration();
  });
});
