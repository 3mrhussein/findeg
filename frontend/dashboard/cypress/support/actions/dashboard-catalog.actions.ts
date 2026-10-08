/** UI actions for the production dashboard catalog (categories and products). */

export const CATEGORY_NAME_PLACEHOLDER = 'e.g. Writing Instruments';
const PRODUCT_NAME_PLACEHOLDER = 'e.g. Classic Ballpoint Pen';

/** Unique, slug-safe token so each run owns isolated records. */
export function uniqueToken(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Resolve once React has attached its event handlers to the element, so a click made
 * right after navigation is not swallowed by a not-yet-hydrated production page.
 */
export function hydrated(selector: string) {
  return cy.get(selector).should(($el) => {
    const attached = Object.keys($el[0]).some((key) => key.startsWith('__reactProps'));
    expect(attached, 'React handlers attached').to.eq(true);
  });
}

/** Row of the category tree identified by its (unique) slug. */
export function categoryRow(slug: string) {
  return cy.contains('p', slug, { timeout: 20000 }).closest('div.group');
}

/** Open the create-category panel and save a category; its slug is derived from the name. */
export function createCategoryFromUi(locale: string, nameEn: string): void {
  cy.visit(`/${locale}/categories`);
  hydrated('div.group button:has(svg.lucide-trash-2)');
  hydrated('button:has(svg.lucide-plus)');
  cy.get('button:has(svg.lucide-plus)').first().click();
  cy.get(`input[placeholder="${CATEGORY_NAME_PLACEHOLDER}"]`).type(nameEn);
  saveCategoryForm();
}

/** Submit the open category form (the one holding the English name input). */
export function saveCategoryForm(): void {
  cy.get(`input[placeholder="${CATEGORY_NAME_PLACEHOLDER}"]`)
    .closest('form')
    .find('button[type="submit"]')
    .click();
}

/** Open the variants tab of the product form and expand its first variant card. */
function openFirstVariant(): void {
  cy.get('form nav button').filter(':has(svg.lucide-layers)').click();
  cy.get('form svg.lucide-chevron-right').first().click();
}

/** Create a product with one variant from the new-product form. */
export function createProductFromUi(locale: string, nameEn: string, sku: string): void {
  cy.visit(`/${locale}/products/new`);
  hydrated(`input[placeholder="${PRODUCT_NAME_PLACEHOLDER}"]`).type(nameEn);
  openFirstVariant();
  cy.get('input[placeholder="e.g. STA-PEN-BLUE"]').type(sku);
  cy.get('input[placeholder="0.00"]').first().clear().type('12.5');
  cy.get('header button[type="submit"]').click();
  cy.location('pathname', { timeout: 20000 }).should('match', /\/products\/\d+\/edit$/);
}

/** Rename the product currently open in the edit form. */
export function renameProductFromUi(nameEn: string): void {
  // The save is a server action POST; navigating away before it settles would abort it.
  cy.intercept('POST', '**/products/*/edit').as('saveProduct');
  hydrated(`input[placeholder="${PRODUCT_NAME_PLACEHOLDER}"]`).clear().type(nameEn);
  cy.get('header button[type="submit"]').click();
  cy.wait('@saveProduct').its('response.statusCode').should('eq', 200);
}

/** Show only the test's own product in the list by searching for its SKU. */
export function searchProductsBySku(locale: string, sku: string): void {
  cy.visit(`/${locale}/products?search=${encodeURIComponent(sku)}`);
}
