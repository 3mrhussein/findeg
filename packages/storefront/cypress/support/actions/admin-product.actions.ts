import { adminSelectors } from "../selectors/admin.selectors";
import { localePath } from "../utils/url";
import type { TestProductInput } from "../utils/product-factory";
import { fetchAdminToken } from "./auth.actions";
import { API_ROUTES, UI_ROUTES } from "../constants/routes";
import { ADMIN_MESSAGES, SHOP_MESSAGES } from "../constants/messages";
import { adminIntercepts } from "../interceptors/admin.intercepts";

const SKU_INPUT_SELECTOR = `${adminSelectors.productSkuInput}, input[placeholder="PROD-001"]`;

interface AdminProductUpdateInput {
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price?: string;
}

/**
 *
 */
function selectRadixOption(fieldLabel: string, optionText: string): void {
  cy.contains("label", fieldLabel)
    .parent()
    .find('button[role="combobox"]')
    .should("be.visible")
    .and("not.be.disabled")
    .click({ force: true });

  cy.get('[role="option"]', { timeout: 10000 }).contains(optionText).click({ force: true });
}

/**
 *
 */
export function visitNewProductForm(): void {
  cy.visit(UI_ROUTES.adminProductsNew);
  cy.location("pathname", { timeout: 15000 }).should((pathname) => {
    const localizedAdminLogin = localePath(UI_ROUTES.adminLogin);
    const isAdminLogin =
      pathname === UI_ROUTES.adminLogin || pathname.startsWith(localizedAdminLogin);
    expect(isAdminLogin, `unexpected admin-login redirect: ${pathname}`).to.eq(false);
  });
  cy.get("body").then(($body) => {
    const hasProductForm =
      $body.find(SKU_INPUT_SELECTOR).length > 0 &&
      $body.find(adminSelectors.productNameEnInput).length > 0;
    if (hasProductForm) return;
    cy.visit(localePath(UI_ROUTES.adminProductsNew));
  });
  cy.get(SKU_INPUT_SELECTOR, { timeout: 20000 }).should("be.visible");
  cy.get(adminSelectors.productNameEnInput, { timeout: 20000 }).should("be.visible");
}

/**
 *
 */
function typeIntoEnabledInput(selector: string, value: string): void {
  cy.get(selector, { timeout: 20000 }).should("be.visible").and("not.be.disabled");
  cy.get(selector, { timeout: 20000 }).clear({ force: true });
  cy.get(selector, { timeout: 20000 }).type(value, { force: true });
  cy.get(selector, { timeout: 20000 }).should("have.value", value);
}

/**
 *
 */
function resolveSkuSelector() {
  return cy.get("body").then(($body): string => {
    if ($body.find(adminSelectors.productSkuInput).length > 0) {
      return adminSelectors.productSkuInput;
    }

    return 'input[placeholder="PROD-001"]';
  });
}

/**
 *
 */
export function visitAdminProductsList(): void {
  cy.visit(UI_ROUTES.adminProducts);
  cy.location("pathname", { timeout: 15000 }).should((pathname) => {
    const localizedProducts = localePath(UI_ROUTES.adminProducts);
    const isProductsPath =
      pathname === UI_ROUTES.adminProducts ||
      pathname.startsWith(`${UI_ROUTES.adminProducts}/`) ||
      pathname.startsWith(localizedProducts);
    expect(isProductsPath, `expected admin products path, got ${pathname}`).to.eq(true);
  });
  cy.get(adminSelectors.productsFilterSearchInput, { timeout: 15000 }).should("be.visible");
}

/**
 *
 */
export function visitEditProductForm(productId: number): void {
  cy.visit(localePath(UI_ROUTES.adminProductEditById(productId)));
  cy.location("pathname", { timeout: 15000 }).should((pathname) => {
    const localizedEdit = localePath(UI_ROUTES.adminProductEditById(productId));
    const isEditPath = pathname === localizedEdit || pathname.endsWith(`/admin/products/${productId}/edit`);
    expect(isEditPath, `expected admin product edit path, got ${pathname}`).to.eq(true);
  });
  cy.get(adminSelectors.productNameEnInput, { timeout: 20000 }).should("be.visible");
}

/**
 *
 */
export function filterAdminProductsBySearch(searchTerm: string): void {
  adminIntercepts.interceptProductListUpdate();

  cy.get(adminSelectors.productsFilterSearchInput, { timeout: 15000 })
    .should("be.visible")
    .clear({ force: true })
    .type(searchTerm, { force: true })
    .should("have.value", searchTerm)
    .type("{enter}", { force: true });

  adminIntercepts.waitForProductListUpdate();

  cy.url({ timeout: 10000 }).should("include", `search=${encodeURIComponent(searchTerm)}`);
}

/**
 *
 */
export function filterAdminProductsByCategory(categoryLabel: string): void {
  adminIntercepts.interceptProductListUpdate();
  cy.get(adminSelectors.productsFilterCategoryTrigger).click({ force: true });
  cy.get('[role="option"]', { timeout: 10000 }).contains(categoryLabel).click({ force: true });
  adminIntercepts.waitForProductListUpdate();
  cy.url({ timeout: 10000 }).should("include", "categoryId=");
}

/**
 *
 */
export function clearAdminProductsFilters(): void {
  adminIntercepts.interceptProductListUpdate();
  cy.get(adminSelectors.productsFilterClearButton).click({ force: true });
  adminIntercepts.waitForProductListUpdate();
  cy.url({ timeout: 10000 }).should("not.include", "search=");
  cy.url({ timeout: 10000 }).should("not.include", "categoryId=");
}

/**
 *
 */
export function createProductFromUi(
  input: TestProductInput,
  categoryName: string = SHOP_MESSAGES.keychainsLabel,
): void {
  cy.get(adminSelectors.createProductButton, { timeout: 20000 }).should("not.be.disabled");

  resolveSkuSelector().then((skuSelector) => {
    typeIntoEnabledInput(skuSelector, input.sku);
    typeIntoEnabledInput(adminSelectors.productPriceInput, input.price);
    typeIntoEnabledInput(adminSelectors.productNameEnInput, input.nameEn);
    typeIntoEnabledInput(adminSelectors.productNameArInput, input.nameAr);
    typeIntoEnabledInput(adminSelectors.productDescEnInput, input.descriptionEn);
    typeIntoEnabledInput(adminSelectors.productDescArInput, input.descriptionAr);
    typeIntoEnabledInput(adminSelectors.stockQuantityInput, input.stockQuantity);
    typeIntoEnabledInput(adminSelectors.lowStockInput, input.lowStockThreshold);
    typeIntoEnabledInput(adminSelectors.imagesInput, input.imageUrl);
  });

  selectRadixOption(ADMIN_MESSAGES.categoryFieldLabel, categoryName);

  adminIntercepts.interceptProductCreation();

  cy.get(adminSelectors.createProductButton)
    .should("be.visible")
    .and("not.be.disabled")
    .contains(ADMIN_MESSAGES.createProductButtonRegex)
    .click();

  adminIntercepts.waitForProductCreation();

  cy.location("pathname", { timeout: 15000 }).should((pathname) => {
    const localizedProducts = localePath(UI_ROUTES.adminProducts);
    const isProductsPath =
      pathname === UI_ROUTES.adminProducts ||
      pathname.startsWith(`${UI_ROUTES.adminProducts}/`) ||
      pathname.startsWith(localizedProducts);
    expect(isProductsPath, `expected admin products path, got ${pathname}`).to.eq(true);
  });
}

/**
 * Creates a product directly via API for fast data setup.
 */
export function createProductViaApi(
  input: TestProductInput,
  categoryName: string = SHOP_MESSAGES.keychainsLabel,
): Cypress.Chainable<any> {
  return fetchAdminToken().then((token) => {
    // We need to find the category ID by name/label
    cy
      .request({
        method: "GET",
        url: API_ROUTES.categories,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const categories = response.body as Array<{ id: number; name: string; slug: string }>;
        // Try to match by slug (which we have in messages) or name
        const category = categories.find(
          (c) => c.name === categoryName || c.slug === SHOP_MESSAGES.keychainsSlug,
        );
        const categoryId = category?.id || 1;

        return cy.request({
          method: "POST",
          url: API_ROUTES.adminProducts,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: {
            sku: input.sku,
            price: Number(input.price),
            translations: [
              {
                language: "en",
                name: input.nameEn,
                description: input.descriptionEn,
                longDescription: input.descriptionEn,
              },
              {
                language: "ar",
                name: input.nameAr,
                description: input.descriptionAr,
                longDescription: input.descriptionAr,
              },
            ],
            stockQuantity: Number(input.stockQuantity),
            lowStockThreshold: Number(input.lowStockThreshold),
            images: [input.imageUrl],
            categoryId: categoryId,
            isActive: true,
          },
        });
      })
      .then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
      })
      .then(() => undefined);
  });
}

/**
 *
 */
export function findAdminProductIdBySku(sku: string): Cypress.Chainable<number> {
  return fetchAdminToken().then((token) =>
    cy
      .request({
        method: "GET",
        url: API_ROUTES.adminProducts,
        qs: { search: sku, page: 1, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const products = (response.body?.data || []) as Array<{ id: number; sku?: string }>;
        const product = products.find((item) => item.sku === sku);
        expect(product?.id, `admin product id for sku ${sku}`).to.be.a("number");
        return product!.id;
      }),
  );
}

/**
 *
 */
export function updateProductFromUi(input: AdminProductUpdateInput): void {
  if (typeof input.price === "string") {
    typeIntoEnabledInput(adminSelectors.productPriceInput, input.price);
  }
  if (typeof input.nameEn === "string") {
    typeIntoEnabledInput(adminSelectors.productNameEnInput, input.nameEn);
  }
  if (typeof input.nameAr === "string") {
    typeIntoEnabledInput(adminSelectors.productNameArInput, input.nameAr);
  }
  if (typeof input.descriptionEn === "string") {
    typeIntoEnabledInput(adminSelectors.productDescEnInput, input.descriptionEn);
  }
  if (typeof input.descriptionAr === "string") {
    typeIntoEnabledInput(adminSelectors.productDescArInput, input.descriptionAr);
  }

  cy.get(adminSelectors.createProductButton)
    .should("be.visible")
    .and("not.be.disabled")
    .contains(/update product/i)
    .click();

  cy.location("pathname", { timeout: 20000 }).should((pathname) => {
    const localizedProducts = localePath(UI_ROUTES.adminProducts);
    const isProductsPath =
      pathname === UI_ROUTES.adminProducts ||
      pathname.startsWith(`${UI_ROUTES.adminProducts}/`) ||
      pathname.startsWith(localizedProducts);
    expect(isProductsPath, `expected admin products path, got ${pathname}`).to.eq(true);
  });
}

/**
 *
 */
export function deleteProductFromListById(productId: number): void {
  cy.get(adminSelectors.productActionsById(productId), { timeout: 15000 })
    .should("be.visible")
    .click({ force: true });

  cy.get(adminSelectors.productDeleteById(productId), { timeout: 10000 }).click({ force: true });
  cy.get(adminSelectors.productDeleteConfirm, { timeout: 15000 })
    .should("be.visible")
    .and("not.be.disabled")
    .click({ force: true });

  cy.get(adminSelectors.productDeleteConfirm, { timeout: 20000 }).should("not.exist");
  cy.get(adminSelectors.productRowById(productId), { timeout: 20000 }).should("not.exist");
}

/**
 *
 */
export function deleteProductBySku(sku: string): void {
  fetchAdminToken().then((token) => {
    cy.request({
      method: "GET",
      url: API_ROUTES.adminProducts,
      qs: { search: sku, page: 1, limit: 20 },
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const products = (response.body?.data || []) as Array<{ id: number; sku?: string }>;
      const product = products.find((item) => item.sku === sku);

      if (!product?.id) return;

      cy.request({
        method: "DELETE",
        url: API_ROUTES.adminProductById(product.id),
        headers: { Authorization: `Bearer ${token}` },
      })
        .its("status")
        .should("be.oneOf", [200, 204]);
    });
  });
}
