import { buildTestProduct } from "../utils/product-factory";
import { buildTestCategory } from "../utils/category-factory";
import { buildTestBrand } from "../utils/brand-factory";
import {
  addProductToGuestCartExpectStatus,
  clearGuestCart,
  createGuestId,
  getGuestCart,
} from "../actions/cart.actions";
import { visitSearchWithQuery, visitShopWithQuery } from "../actions/shop.actions";
import { expectProductVisibleByName } from "../assertions/shop.assertions";
import { API_ROUTES, ROUTE_QUERY_KEYS } from "../constants/routes";
import { SHOP_MESSAGES } from "../constants/messages";
import { API_QUERY_DEFAULTS, buildApiUrl } from "../constants/api-query";
import { shopSelectors } from "../selectors/shop.selectors";
import { adminSelectors } from "../selectors/admin.selectors";
import {
  clearAdminProductsFilters,
  deleteProductFromListById,
  filterAdminProductsByCategory,
  filterAdminProductsBySearch,
  findAdminProductIdBySku,
  updateProductFromUi,
  visitAdminProductsList,
  visitEditProductForm,
} from "../actions/admin-product.actions";
import {
  createCategoryFromUi,
  deleteCategoryBySlug,
  deleteCategoryFromListById,
  updateCategoryFromUi,
  visitAdminCategoriesList,
  visitAdminEditCategoryForm,
  visitAdminNewCategoryForm,
} from "../actions/admin-category.actions";
import {
  createBrandFromUi,
  deleteBrandBySlug,
  deleteBrandFromListById,
  updateBrandFromUiById,
  visitAdminBrandsList,
} from "../actions/admin-brand.actions";
import {
  updateInventoryFromUiByProductId,
  visitAdminInventoryList,
} from "../actions/admin-inventory.actions";

interface ApiProductSnapshot {
  id?: number;
  sku?: string;
  name?: string;
  stockQuantity?: number;
}

interface AdminCategoryApiSnapshot {
  id: number;
  slug?: string;
  name?: string;
}

interface AdminBrandApiSnapshot {
  id: number;
  slug?: string;
  name?: string;
}

/**
 * Polls storefront products API until a SKU resolves to the expected product name.
 */
function waitForStorefrontProductNameBySku(
  sku: string,
  expectedName: string,
  attempts = 12,
): Cypress.Chainable<any> {
  return cy
    .request(
      buildApiUrl(API_ROUTES.products, {
        lang: API_QUERY_DEFAULTS.language,
        q: sku,
        limit: API_QUERY_DEFAULTS.largeListLimit,
      }),
    )
    .then((response) => {
      const products = (response.body?.products || []) as ApiProductSnapshot[];
      const matched = products.find((product) => product.sku === sku);

      if (matched?.name === expectedName) return;

      if (attempts <= 1) {
        expect(
          matched?.name,
          `expected storefront API name for sku ${sku} to converge to "${expectedName}"`,
        ).to.eq(expectedName);
        return;
      }

      cy.wait(500, { log: false });
      return waitForStorefrontProductNameBySku(sku, expectedName, attempts - 1);
    })
    .then(() => undefined);
}

/**
 * Polls storefront products API until a SKU resolves to the expected stock quantity.
 */
function waitForStorefrontProductStockBySku(
  sku: string,
  expectedStockQuantity: number,
  attempts = 12,
): Cypress.Chainable<any> {
  return cy
    .request(
      buildApiUrl(API_ROUTES.products, {
        lang: API_QUERY_DEFAULTS.language,
        q: sku,
        limit: API_QUERY_DEFAULTS.largeListLimit,
      }),
    )
    .then((response) => {
      const products = (response.body?.products || []) as ApiProductSnapshot[];
      const matched = products.find((product) => product.sku === sku);

      if (matched?.stockQuantity === expectedStockQuantity) return;

      if (attempts <= 1) {
        expect(
          matched?.stockQuantity,
          `expected storefront API stock for sku ${sku} to converge to ${expectedStockQuantity}`,
        ).to.eq(expectedStockQuantity);
        return;
      }

      cy.wait(500, { log: false });
      return waitForStorefrontProductStockBySku(sku, expectedStockQuantity, attempts - 1);
    })
    .then(() => undefined);
}

/**
 * Polls admin categories API until a slug becomes visible and returns its ID.
 */
function waitForAdminCategoryIdBySlug(slug: string, attempts = 12): Cypress.Chainable<any> {
  return cy
    .request({
      method: "GET",
      url: API_ROUTES.adminCategories,
    })
    .then((response) => {
      const categories = (response.body?.data?.categories || []) as AdminCategoryApiSnapshot[];
      const category = categories.find((item) => item.slug === slug);
      if (category?.id) return category.id;

      if (attempts <= 1) {
        expect(category?.id, `admin category id for slug ${slug}`).to.be.a("number");
        return undefined;
      }

      cy.wait(400, { log: false });
      return waitForAdminCategoryIdBySlug(slug, attempts - 1);
    });
}

/**
 * Polls admin brands API until a slug becomes visible and returns its ID.
 */
function waitForAdminBrandIdBySlug(slug: string, attempts = 12): Cypress.Chainable<any> {
  return cy
    .request({
      method: "GET",
      url: API_ROUTES.adminBrands,
    })
    .then((response) => {
      const brands = (response.body?.data?.brands || []) as AdminBrandApiSnapshot[];
      const brand = brands.find((item) => item.slug === slug);
      if (brand?.id) return brand.id;

      if (attempts <= 1) {
        expect(brand?.id, `admin brand id for slug ${slug}`).to.be.a("number");
        return undefined;
      }

      cy.wait(400, { log: false });
      return waitForAdminBrandIdBySlug(slug, attempts - 1);
    });
}

/**
 * Business case: Admin can create a product from dashboard and shoppers can discover it immediately.
 */
export const shouldReflectNewlyCreatedProductFromAdminInShop = () => {
  const testProduct = buildTestProduct();

  cy.loginAsAdminSession();
  cy.visitAdminNewProductForm();
  cy.createAdminProductUi(testProduct, SHOP_MESSAGES.keychainsLabel);

  // Validate that the created product is attached to the intended category in backend data.
  cy.request(
    buildApiUrl(API_ROUTES.categories, {
      lang: API_QUERY_DEFAULTS.language,
    }),
  ).then((categoriesResponse) => {
    const categories = categoriesResponse.body as Array<{ id: number; slug: string }>;
    const keychains = categories.find((category) => category.slug === SHOP_MESSAGES.keychainsSlug);
    expect(keychains, "keychains category").to.not.be.undefined;

    cy.request(
      buildApiUrl(API_ROUTES.products, {
        lang: API_QUERY_DEFAULTS.language,
        categoryId: keychains!.id,
        limit: API_QUERY_DEFAULTS.largeListLimit,
      }),
    ).then((productsResponse) => {
      const products = productsResponse.body.products as Array<{ name: string }>;
      const found = products.some((product) => product.name === testProduct.nameEn);
      expect(found, "created product must be in keychains category results").to.eq(true);
    });
  });

  // Validate storefront visibility through deterministic search UI.
  visitSearchWithQuery(testProduct.sku);
  expectProductVisibleByName(testProduct.nameEn);

  // Keep shop query-state validation on category filter URL.
  visitShopWithQuery(`${ROUTE_QUERY_KEYS.categories}=${SHOP_MESSAGES.keychainsSlug}`);
  cy.url().should("include", `${ROUTE_QUERY_KEYS.categories}=${SHOP_MESSAGES.keychainsSlug}`);

  cy.cleanupProductBySku(testProduct.sku);
};

/**
 * Business case: Admin can filter products list from dashboard with server-driven filters.
 */
export const shouldFilterAdminProductsListWithServerFilters = () => {
  const testProduct = buildTestProduct();

  cy.loginAsAdminSession();
  cy.createAdminProductApi(testProduct, SHOP_MESSAGES.keychainsLabel);

  visitAdminProductsList();
  filterAdminProductsBySearch(testProduct.sku);
  cy.contains("td", testProduct.nameEn, { timeout: 10000 }).should("be.visible");

  filterAdminProductsByCategory(SHOP_MESSAGES.keychainsLabel);
  cy.contains("td", testProduct.nameEn, { timeout: 10000 }).should("be.visible");

  clearAdminProductsFilters();
  cy.contains("td", testProduct.nameEn, { timeout: 10000 }).should("be.visible");

  cy.cleanupProductBySku(testProduct.sku);
};

/**
 * Business case: Admin can update an existing product and storefront reflects updated content.
 */
export const shouldReflectUpdatedProductFromAdminInShop = () => {
  const testProduct = buildTestProduct();
  const updateStamp = Date.now();
  const updatedNameEn = `Cypress Renamed Product E2E-${updateStamp}`;
  const updatedNameAr = `منتج محدث سايبريس E2E-${updateStamp}`;
  const updatedDescriptionEn = `${testProduct.descriptionEn} Updated details.`;
  const updatedDescriptionAr = `${testProduct.descriptionAr} تفاصيل محدثة.`;
  const updatedPrice = "79.99";

  cy.loginAsAdminSession();
  cy.createAdminProductApi(testProduct, SHOP_MESSAGES.keychainsLabel);

  findAdminProductIdBySku(testProduct.sku).then((productId) => {
    visitEditProductForm(productId);
    updateProductFromUi({
      nameEn: updatedNameEn,
      nameAr: updatedNameAr,
      descriptionEn: updatedDescriptionEn,
      descriptionAr: updatedDescriptionAr,
      price: updatedPrice,
    });
  });

  waitForStorefrontProductNameBySku(testProduct.sku, updatedNameEn);
  visitSearchWithQuery(testProduct.sku);
  expectProductVisibleByName(updatedNameEn);
  cy.get(shopSelectors.productCardTitle).should(($titles) => {
    const oldNameStillExists = [...$titles].some(
      (title) => (title.textContent || "").trim() === testProduct.nameEn,
    );
    expect(oldNameStillExists, "exact old name should not remain after update").to.eq(false);
  });

  cy.cleanupProductBySku(testProduct.sku);
};

/**
 * Business case: Admin can delete an existing product and it disappears from storefront search.
 */
export const shouldReflectDeletedProductFromAdminInShop = () => {
  const testProduct = buildTestProduct();

  cy.loginAsAdminSession();
  cy.createAdminProductApi(testProduct, SHOP_MESSAGES.keychainsLabel);

  findAdminProductIdBySku(testProduct.sku).then((productId) => {
    visitAdminProductsList();
    filterAdminProductsBySearch(testProduct.sku);
    cy.get(adminSelectors.productRowById(productId), { timeout: 15000 }).should("exist");

    deleteProductFromListById(productId);
  });

  visitSearchWithQuery(testProduct.sku);
  cy.contains(shopSelectors.productCardTitle, testProduct.nameEn).should("not.exist");

  cy.cleanupProductBySku(testProduct.sku);
};

/**
 * Business case: Admin can create, update, and delete category entries from dashboard.
 */
export const shouldManageAdminCategoriesCrudFromDashboard = () => {
  const category = buildTestCategory();
  const updateStamp = Date.now();
  const updatedSlug = `cypress-category-updated-${updateStamp}`;
  const updatedNameEn = `Cypress Category Updated E2E-${updateStamp}`;
  const updatedNameAr = `تصنيف سايبريس محدث E2E-${updateStamp}`;

  cy.loginAsAdminSession();

  visitAdminNewCategoryForm();
  createCategoryFromUi(category);

  waitForAdminCategoryIdBySlug(category.slug).then((categoryId) => {
    visitAdminEditCategoryForm(categoryId);
    updateCategoryFromUi({
      slug: updatedSlug,
      nameEn: updatedNameEn,
      nameAr: updatedNameAr,
      descriptionEn: `${category.descriptionEn} Updated.`,
      descriptionAr: `${category.descriptionAr} محدث.`,
      sortOrder: 1,
    });
  });

  waitForAdminCategoryIdBySlug(updatedSlug).then((updatedCategoryId) => {
    visitAdminCategoriesList();
    cy.get(adminSelectors.categoriesFilterInput).clear().type(updatedNameEn);
    cy.contains("td", updatedNameEn).should("be.visible");
    cy.contains("td", updatedSlug).should("be.visible");

    deleteCategoryFromListById(updatedCategoryId);
  });

  cy.request({
    method: "GET",
    url: API_ROUTES.adminCategories,
  }).then((response) => {
    const categories = (response.body?.data?.categories || []) as AdminCategoryApiSnapshot[];
    const stillExists = categories.some((item) => item.slug === updatedSlug);
    expect(stillExists, `updated category slug ${updatedSlug} should be deleted`).to.eq(false);
  });

  deleteCategoryBySlug(category.slug);
  deleteCategoryBySlug(updatedSlug);
};

/**
 * Business case: Admin can create, update, and delete brand entries from dashboard.
 */
export const shouldManageAdminBrandsCrudFromDashboard = () => {
  const brand = buildTestBrand();
  const updateStamp = Date.now();
  const updatedSlug = `cypress-brand-updated-${updateStamp}`;
  const updatedName = `Cypress Brand Updated E2E-${updateStamp}`;

  cy.loginAsAdminSession();

  visitAdminBrandsList();
  createBrandFromUi(brand);

  waitForAdminBrandIdBySlug(brand.slug).then((brandId) => {
    visitAdminBrandsList();
    updateBrandFromUiById(brandId, {
      slug: updatedSlug,
      name: updatedName,
      logoUrl: `https://picsum.photos/seed/brand-updated-${updateStamp}/200/200`,
    });
  });

  waitForAdminBrandIdBySlug(updatedSlug).then((updatedBrandId) => {
    visitAdminBrandsList();
    cy.get(adminSelectors.brandRowById(updatedBrandId)).should("exist");
    cy.contains("td", updatedName).should("be.visible");
    cy.contains("td", updatedSlug).should("be.visible");

    deleteBrandFromListById(updatedBrandId);
  });

  cy.request({
    method: "GET",
    url: API_ROUTES.adminBrands,
  }).then((response) => {
    const brands = (response.body?.data?.brands || []) as AdminBrandApiSnapshot[];
    const stillExists = brands.some((item) => item.slug === updatedSlug);
    expect(stillExists, `updated brand slug ${updatedSlug} should be deleted`).to.eq(false);
  });

  deleteBrandBySlug(brand.slug);
  deleteBrandBySlug(updatedSlug);
};

/**
 * Business case: Admin inventory edits must immediately control storefront stock acceptance.
 */
export const shouldReflectInventoryUpdateFromAdminInStorefrontStockBehavior = () => {
  const testProduct = buildTestProduct();
  const guestId = createGuestId();
  const initialStock = 3;
  const depletedStock = 0;
  const restockedStock = 5;

  cy.loginAsAdminSession();
  cy.createAdminProductApi(
    {
      ...testProduct,
      stockQuantity: String(initialStock),
      lowStockThreshold: "1",
    },
    SHOP_MESSAGES.keychainsLabel,
  );

  findAdminProductIdBySku(testProduct.sku).then((productId) => {
    visitAdminInventoryList();
    updateInventoryFromUiByProductId(productId, depletedStock);
    waitForStorefrontProductStockBySku(testProduct.sku, depletedStock);

    clearGuestCart(guestId)
      .then(() =>
        cy.request({
          method: "POST",
          url: API_ROUTES.cartItems,
          headers: {
            "Content-Type": "application/json",
            "X-Guest-Id": guestId,
          },
          body: {
            productId,
            quantity: 1,
            variantKey: "default",
            uomCode: "pcs",
            customerGroup: "public_b2c",
          },
          failOnStatusCode: false,
        }),
      )
      .then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body?.error?.errorCode).to.eq("CART_INSUFFICIENT_STOCK");
      })
      .then(() => getGuestCart(guestId))
      .then((cart) => {
        const items = (cart?.items || []) as Array<{ id: number }>;
        const exists = items.some((item) => item.id === productId);
        expect(exists, "out-of-stock product must not be added to cart").to.eq(false);
      });

    visitAdminInventoryList();
    updateInventoryFromUiByProductId(productId, restockedStock);
    waitForStorefrontProductStockBySku(testProduct.sku, restockedStock);

    addProductToGuestCartExpectStatus(guestId, productId, 201, 1);
    getGuestCart(guestId).then((cart) => {
      const items = (cart?.items || []) as Array<{ id: number; quantity: number }>;
      const matched = items.find((item) => item.id === productId);
      expect(matched, "restocked product should be addable").to.not.be.undefined;
      expect(matched?.quantity, "restocked cart quantity").to.eq(1);
    });
  });

  clearGuestCart(guestId);
  cy.cleanupProductBySku(testProduct.sku);
};
