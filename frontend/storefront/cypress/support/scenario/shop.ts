import {
  chooseSort,
  goToNextPage,
  openHeaderCartDrawer,
  readResultsSummary,
  visitCategoryPage,
  visitSearchWithQuery,
  visitShopWithQuery,
} from "../actions/shop.actions";
import {
  addProductToGuestCart,
  addProductToUserCart,
  clearGuestCart,
  createGuestId,
  getFirstProductId,
  getGuestCart,
  visitWithGuest,
} from "../actions/cart.actions";
import {
  registerUserThroughUi,
  registerUserViaApi,
  setUserSessionCookie,
} from "../actions/auth.actions";
import {
  createOrderViaApiAsUser,
  fillCheckoutRequiredFields,
  submitCheckoutForm,
  triggerCheckoutValidationBlurWithInvalidInputs,
} from "../actions/checkout.actions";
import {
  expectMyAccountOrderCardVisible,
  expectMyAccountOrderDetailVisible,
} from "../assertions/account.assertions";
import {
  expectCheckoutErrorAlertContains,
  expectCheckoutSubmitDisabled,
  expectCheckoutValidationMessagesVisible,
} from "../assertions/checkout.assertions";
import {
  expectCartContainsProductId,
  expectCartContainsProductName,
  expectCartQuantity,
  expectProductVisibleByName,
  expectSummaryToEqual,
  expectVisiblePricesAscending,
  expectVisiblePricesDescending,
} from "../assertions/shop.assertions";
import { localePath } from "../utils/url";
import { shopSelectors } from "../selectors/shop.selectors";
import { API_ROUTES, ROUTE_QUERY_KEYS, UI_ROUTES } from "../constants/routes";
import { SHOP_MESSAGES } from "../constants/messages";
import { API_QUERY_DEFAULTS, buildApiUrl } from "../constants/api-query";
import { interceptCheckoutOrderFailure } from "../interceptors/checkout.intercepts";
import { buildE2EUser } from "../utils/user-factory";

/**
 *
 */
function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sets up a guest cart with a single valid product and runs checkout callback flow.
 */
function withGuestCheckoutCart(run: (guestId: string) => void): void {
  const guestId = createGuestId();
  cy.clearCookie("admin_session");

  clearGuestCart(guestId)
    .then(() => getFirstProductId())
    .then((productId) => addProductToGuestCart(guestId, productId, 1).then(() => productId))
    .then(() => getGuestCart(guestId))
    .then((cart) => {
      const items = (cart?.items || []) as unknown[];
      expect(items.length, "guest checkout cart seeded items").to.be.greaterThan(0);
      run(guestId);
    });
}

/**
 * System case: category filter URL state must match DB-backed count logic.
 */
export const shouldFilterByLeafCategoryWithCorrectCounts = () => {
  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      limit: API_QUERY_DEFAULTS.largeListLimit,
    }),
  ).then((allResponse) => {
    const allTotal = allResponse.body.total as number;

    cy.request(
      buildApiUrl(API_ROUTES.categories, {
        lang: API_QUERY_DEFAULTS.language,
      }),
    ).then((categoriesResponse) => {
      const categories = categoriesResponse.body as Array<{ id: number; slug: string }>;
      const keychains = categories.find(
        (category) => category.slug === SHOP_MESSAGES.keychainsSlug,
      );
      expect(keychains, `${SHOP_MESSAGES.keychainsSlug} category`).to.not.be.undefined;

      cy.request(
        buildApiUrl(API_ROUTES.products, {
          lang: API_QUERY_DEFAULTS.language,
          categoryId: keychains!.id,
          limit: API_QUERY_DEFAULTS.largeListLimit,
        }),
      ).then((leafResponse) => {
        const leafTotal = leafResponse.body.total as number;

        visitShopWithQuery(
          `${ROUTE_QUERY_KEYS.categories}=${encodeURIComponent(SHOP_MESSAGES.keychainsSlug)}`,
        );

        readResultsSummary().then((summary) => {
          expectSummaryToEqual(summary, {
            shown: leafTotal,
            total: allTotal,
          });
        });
      });
    });
  });
};

/**
 * Business case: buyer can use search and see accurate result totals.
 */
export const shouldShowSearchResultsForKeywordWithCorrectCounts = () => {
  const query = SHOP_MESSAGES.keychainsSlug;

  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      q: query,
      limit: API_QUERY_DEFAULTS.largeListLimit,
    }),
  ).then((response) => {
    const total = response.body.total as number;
    const products = response.body.products as Array<{ name: string }>;

    visitSearchWithQuery(query);
    cy.contains(`${SHOP_MESSAGES.searchPrefix} \"${query}\"`).shouldBeVisible(true);

    readResultsSummary().then((summary) => {
      expectSummaryToEqual(summary, {
        shown: total,
        total,
      });
    });

    if (products.length > 0) {
      expectProductVisibleByName(products[0].name);
    }
  });
};

/**
 * System case: typo queries should show fallback notice with closest matches.
 */
export const shouldShowTypoTolerantSearchFallback = () => {
  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      q: SHOP_MESSAGES.keychainsSlug,
      limit: API_QUERY_DEFAULTS.singleItemLimit,
    }),
  ).then((response) => {
    const products = response.body.products as Array<{ name: string }>;
    expect(products.length, "keychains strict baseline").to.be.greaterThan(0);

    visitSearchWithQuery("keychainz");
    cy.get(shopSelectors.searchFallbackNotice).shouldBeVisible(true);
    readResultsSummary().then((summary) => {
      expect(summary.shown).to.be.greaterThan(0);
    });
  });
};

/**
 * Business case: user can navigate from categories index cards to category listing route.
 */
export const shouldNavigateFromCategoryIndexToCategoryListing = () => {
  cy.request(
    buildApiUrl(API_ROUTES.categories, {
      lang: API_QUERY_DEFAULTS.language,
      type: API_QUERY_DEFAULTS.rootsType,
    }),
  ).then((response) => {
    const roots = response.body as Array<{ slug: string; name: string }>;
    expect(roots.length).to.be.greaterThan(0);

    const target = roots[0];
    cy.visit(localePath(UI_ROUTES.categories));
    cy.get(shopSelectors.categoryCardBySlug(target.slug)).click();

    cy.url().should("include", localePath(UI_ROUTES.categoryBySlug(target.slug)));
    cy.get(shopSelectors.categoryResultsHeading).should("contain", target.name);
  });
};

/**
 * System case: brand filters must map to URL and result set totals.
 */
export const shouldFilterByBrandWithCorrectCounts = () => {
  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      limit: API_QUERY_DEFAULTS.largeListLimit,
    }),
  ).then((response) => {
    const products = response.body.products as Array<{ brandName?: string }>;
    const total = response.body.total as number;

    const firstWithBrand = products.find((product) => Boolean(product.brandName));
    expect(firstWithBrand?.brandName, "brand present in seeded data").to.be.a("string");

    const brandName = firstWithBrand!.brandName!;
    const brandSlug = toSlug(brandName);
    const brandCount = products.filter((product) => product.brandName === brandName).length;

    visitShopWithQuery(`${ROUTE_QUERY_KEYS.brands}=${encodeURIComponent(brandSlug)}`);

    readResultsSummary().then((summary) => {
      expectSummaryToEqual(summary, {
        shown: brandCount,
        total,
      });
    });
  });
};

/**
 * System case: sorting and pagination controls must alter URL/state and displayed list order.
 */
export const shouldSortAndPaginateShopResults = () => {
  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      limit: API_QUERY_DEFAULTS.largeListLimit,
    }),
  ).then((response) => {
    const total = response.body.total as number;

    visitShopWithQuery();

    chooseSort("price-asc");
    cy.url().should("include", `${ROUTE_QUERY_KEYS.sort}=price-asc`);
    expectVisiblePricesAscending();

    if (total > 8) {
      goToNextPage();
    }

    chooseSort("price-desc");
    cy.url().should("include", `${ROUTE_QUERY_KEYS.sort}=price-desc`);
    cy.url().should("not.include", `${ROUTE_QUERY_KEYS.page}=2`);
    expectVisiblePricesDescending();
  });
};

/**
 * System case: price range filter query should produce deterministic DB-aligned counts.
 */
export const shouldFilterByPriceRangeWithCorrectCounts = () => {
  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      limit: API_QUERY_DEFAULTS.largeListLimit,
    }),
  ).then((response) => {
    const products = response.body.products as Array<{ price: number }>;
    const total = response.body.total as number;
    expect(products.length, "seeded products").to.be.greaterThan(0);

    const prices = products.map((product) => product.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    const pivot = Math.floor((min + max) / 2);

    const shown = products.filter(
      (product) => product.price >= min && product.price <= pivot,
    ).length;
    expect(shown, "price-range filtered count").to.be.greaterThan(0);

    visitShopWithQuery(
      `${ROUTE_QUERY_KEYS.price}=${encodeURIComponent(String(min))}&${ROUTE_QUERY_KEYS.price}=${encodeURIComponent(String(pivot))}`,
    );

    readResultsSummary().then((summary) => {
      expectSummaryToEqual(summary, {
        shown,
        total,
      });
    });
  });
};

/**
 * Business case: restrictive filters should show an empty listing state.
 */
export const shouldShowEmptyStateForRestrictiveFilters = () => {
  visitShopWithQuery(
    `${ROUTE_QUERY_KEYS.brands}=${encodeURIComponent(SHOP_MESSAGES.missingBrandSlug)}`,
  );

  readResultsSummary().then((summary) => {
    expect(summary.shown).to.eq(0);
  });

  cy.get(shopSelectors.productCardTitle).should("have.length", 0);
};

/**
 * Contract case: key storefront routes should render successfully in both EN and AR locales.
 */
export const shouldSupportEnArRouteParityForKeyPages = () => {
  const locales: Array<"en" | "ar"> = ["en", "ar"];
  const query = SHOP_MESSAGES.keychainsSlug;

  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      limit: API_QUERY_DEFAULTS.singleItemLimit,
    }),
  ).then((productsResponse) => {
    const products = productsResponse.body.products as Array<{ id: number }>;
    expect(products.length, "seeded product count").to.be.greaterThan(0);
    const productId = products[0].id;

    cy.request(
      buildApiUrl(API_ROUTES.categories, {
        lang: API_QUERY_DEFAULTS.language,
        type: API_QUERY_DEFAULTS.rootsType,
      }),
    ).then((categoriesResponse) => {
      const categories = categoriesResponse.body as Array<{ slug: string }>;
      expect(categories.length, "root category count").to.be.greaterThan(0);
      const categorySlug = categories[0].slug;

      locales.forEach((locale) => {
        cy.visit(localePath(UI_ROUTES.shop, locale), { timeout: 120000 });
        cy.location("pathname").should("eq", localePath(UI_ROUTES.shop, locale));
        cy.get(shopSelectors.shopResultsHeading).should("be.visible");

        cy.visit(localePath(UI_ROUTES.categories, locale), { timeout: 120000 });
        cy.location("pathname").should("eq", localePath(UI_ROUTES.categories, locale));
        cy.get(shopSelectors.categoryCardBySlug(categorySlug), { timeout: 15000 }).should("be.visible");

        cy.visit(localePath(`${UI_ROUTES.search}?q=${encodeURIComponent(query)}`, locale), {
          timeout: 120000,
        });
        cy.location("pathname").should("eq", localePath(UI_ROUTES.search, locale));
        cy.url().should("include", `q=${encodeURIComponent(query)}`);
        cy.get(shopSelectors.searchResultsHeading).should("be.visible");

        cy.visit(localePath(UI_ROUTES.productById(productId), locale), { timeout: 120000 });
        cy.location("pathname").should("eq", localePath(UI_ROUTES.productById(productId), locale));
        cy.get(shopSelectors.productTitle).should("be.visible");
      });
    });
  });
};

/**
 * Business case: shopper can add product from PDP and see it in cart drawer.
 */
export const shouldAddProductFromDetailIntoCartDrawer = () => {
  cy.request(
    buildApiUrl(API_ROUTES.products, {
      lang: API_QUERY_DEFAULTS.language,
      limit: API_QUERY_DEFAULTS.singleItemLimit,
    }),
  ).then((response) => {
    const products = response.body.products as Array<{ id: number; name: string }>;
    expect(products.length).to.eq(1);

    const productId = products[0].id;
    const productName = products[0].name;
    cy.visit(localePath(UI_ROUTES.productById(productId)));
    cy.get(shopSelectors.productTitle).shouldBeVisible(true);
    cy.get(shopSelectors.productDetailAddToCartById(productId)).click({ force: true });

    openHeaderCartDrawer();
    expectCartContainsProductName(productName);
  });
};

/**
 * Business case: shopper can add product directly from shop grid cards.
 */
export const shouldAddProductFromShopGridCardIntoCartDrawer = () => {
  visitShopWithQuery();

  cy.get(shopSelectors.productCardTitle)
    .first()
    .then(($title) => {
      const testId = $title.attr("data-testid");
      expect(testId, "product card title test id").to.be.a("string");
      const productId = Number((testId || "").replace("product-card-title-", ""));
      expect(Number.isFinite(productId), "product id").to.eq(true);
      const productName = ($title.text() || "").trim();
      expect(productName, "product name").to.not.equal("");

      cy.get(shopSelectors.productCardAddById(productId)).first().click({ force: true });

      openHeaderCartDrawer();
      expectCartContainsProductName(productName);
    });
};

/**
 * System case: guest cart should persist while navigating across storefront routes.
 */
export const shouldPersistCartAcrossRouteTransitions = () => {
  const guestId = createGuestId();
  cy.clearCookie("admin_session");

  clearGuestCart(guestId)
    .then(() => getFirstProductId())
    .then((productId) => addProductToGuestCart(guestId, productId, 1).then(() => productId))
    .then(() => {
      visitWithGuest(localePath(UI_ROUTES.shop), guestId);
      openHeaderCartDrawer();

      cy.get('[data-testid^="cart-item-"]', { timeout: 10000 })
        .first()
        .invoke("attr", "data-testid")
        .then((testId) => {
          expect(testId, "cart item test id").to.be.a("string");
          const cartItemId = Number((testId || "").replace("cart-item-", ""));
          expect(Number.isFinite(cartItemId), "cart item id").to.eq(true);
          expectCartContainsProductId(cartItemId);

          visitWithGuest(localePath(UI_ROUTES.categories), guestId);
          openHeaderCartDrawer();
          expectCartContainsProductId(cartItemId);
        });
    });
};

/**
 * System case: cart supports increment, decrement and removal operations.
 */
export const shouldSupportCartItemQuantityAndRemovalOperations = () => {
  const guestId = createGuestId();
  cy.clearCookie("admin_session");

  clearGuestCart(guestId)
    .then(() => getFirstProductId())
    .then((productId) => addProductToGuestCart(guestId, productId, 1).then(() => productId))
    .then(() => {
      visitWithGuest(localePath(UI_ROUTES.shop), guestId);
      openHeaderCartDrawer();

      cy.get('[data-testid^="cart-item-"]', { timeout: 10000 })
        .first()
        .invoke("attr", "data-testid")
        .then((testId) => {
          expect(testId, "cart item test id").to.be.a("string");
          const cartItemId = Number((testId || "").replace("cart-item-", ""));
          expect(Number.isFinite(cartItemId), "cart item id").to.eq(true);

          expectCartContainsProductId(cartItemId);
          expectCartQuantity(cartItemId, 1);

          cy.get(shopSelectors.cartIncreaseById(cartItemId)).click({ force: true });
          expectCartQuantity(cartItemId, 2);

          getGuestCart(guestId).then((updatedCart) => {
            const updated = (updatedCart.items as Array<{ id: number; quantity: number }>).find(
              (item) => item.id === cartItemId,
            );
            expect(updated?.quantity).to.eq(2);
          });

          cy.get(shopSelectors.cartDecreaseById(cartItemId)).click({ force: true });
          expectCartQuantity(cartItemId, 1);

          cy.get(shopSelectors.cartRemoveById(cartItemId)).click({ force: true });
          cy.get("body")
            .find(shopSelectors.cartItemById(cartItemId), { timeout: 10000 })
            .should("not.exist");
        });
    });
};

/**
 * Business case: checkout should show empty state when cart has no items.
 */
export const shouldShowCheckoutEmptyStateForEmptyCart = () => {
  const guestId = createGuestId();
  clearGuestCart(guestId).then(() => {
    visitWithGuest(localePath(UI_ROUTES.checkout), guestId);

    cy.contains("h1", SHOP_MESSAGES.checkoutTitle).shouldBeVisible(true);
    cy.contains(SHOP_MESSAGES.checkoutEmptyDescription).shouldBeVisible(true);
  });
};

/**
 * Business case: guest shopper can complete checkout successfully.
 */
export const shouldAllowGuestCheckoutSubmission = () => {
  withGuestCheckoutCart((guestId) => {
    visitWithGuest(localePath(UI_ROUTES.checkout), guestId);
    fillCheckoutRequiredFields();
    submitCheckoutForm();
    cy.contains(SHOP_MESSAGES.orderConfirmed, { timeout: 30000 }).shouldBeVisible(true);
  });
};

/**
 * Business case: checkout form enforces required and format validation feedback.
 */
export const shouldValidateCheckoutFormFieldsBeforeSubmission = () => {
  withGuestCheckoutCart((guestId) => {
    visitWithGuest(localePath(UI_ROUTES.checkout), guestId);

    triggerCheckoutValidationBlurWithInvalidInputs();

    expectCheckoutValidationMessagesVisible([
      SHOP_MESSAGES.checkoutErrorFullName,
      SHOP_MESSAGES.checkoutErrorEmail,
      SHOP_MESSAGES.checkoutErrorPhone,
      SHOP_MESSAGES.checkoutErrorCity,
      SHOP_MESSAGES.checkoutErrorArea,
      SHOP_MESSAGES.checkoutErrorStreet,
    ]);
    expectCheckoutSubmitDisabled(true);
  });
};

/**
 * System case: checkout surfaces a clear error when order API fails.
 */
export const shouldShowCheckoutErrorWhenOrderApiFails = () => {
  withGuestCheckoutCart((guestId) => {
    interceptCheckoutOrderFailure();
    visitWithGuest(localePath(UI_ROUTES.checkout), guestId);

    fillCheckoutRequiredFields();
    submitCheckoutForm();

    cy.wait("@checkoutOrderFailure");
    expectCheckoutErrorAlertContains(SHOP_MESSAGES.checkoutOrderCreateFailed);
    cy.contains(SHOP_MESSAGES.orderConfirmed).should("not.exist");
  });
};

/**
 * Business case: user can register from UI and access protected account page.
 */
export const shouldAllowRegistrationHappyPath = () => {
  const user = buildE2EUser();
  registerUserThroughUi(user);
  cy.contains("h1", /My Account|حسابي/).should("be.visible");
};

/**
 * Business case: authenticated user sees order history and opens order detail page.
 */
export const shouldRenderMyAccountOrderHistoryAndDetail = () => {
  const user = buildE2EUser();

  registerUserViaApi(user).then(({ token }) => {
    getFirstProductId().then((productId) => {
      addProductToUserCart(token, productId, 1);

      cy.request({
        method: "GET",
        url: API_ROUTES.cart,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((cartResponse) => {
        const itemCount = cartResponse.body?.data?.cart?.itemCount ?? 0;
        expect(itemCount, "authenticated cart seeded items").to.be.greaterThan(0);
      });

      createOrderViaApiAsUser(token).then((orderId) => {
        setUserSessionCookie(token);
        cy.visit(localePath(UI_ROUTES.myAccount));

        expectMyAccountOrderCardVisible(orderId);
        cy.get(`[data-testid="my-account-order-card-${orderId}"]`).click();

        cy.url().should("include", localePath(`/my-account/orders/${orderId}`));
        expectMyAccountOrderDetailVisible(orderId);
      });
    });
  });
};

/**
 * Security case: unauthenticated user must be redirected away from account pages.
 */
export const shouldRedirectGuestFromMyAccountToRegistration = () => {
  cy.clearCookie("admin_session");
  cy.visit(localePath(UI_ROUTES.myAccount));
  cy.url().should("include", localePath(UI_ROUTES.registration));
};
