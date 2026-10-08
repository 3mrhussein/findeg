/**
 * Dashboard catalog helpers driven through the current localized UI and server actions.
 * Every record carries a unique run token so specs stay isolated from seeded data.
 */

export interface UniqueCatalogName {
  slug: string;
  nameEn: string;
  nameAr: string;
}

/** Build a unique, slug-safe name pair for an isolated record. */
export function uniqueCatalogName(prefix: string): UniqueCatalogName {
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    slug: `cy-${prefix}-${token}`,
    nameEn: `Cy ${prefix} ${token}`,
    nameAr: `اختبار ${prefix} ${token}`,
  };
}

/**
 * Visit a dashboard page once the server renders (or stops rendering) the given text.
 *
 * Dashboard mutations expire cached reads with `revalidateTag(tag, 'max')`, which serves the
 * previous render once while refreshing in the background. Polling the server-rendered HTML
 * waits for that refresh, so the UI assertion that follows observes the persisted result.
 */
export function visitWhenServerRenders(
  path: string,
  text: string,
  options: { present?: boolean; attempts?: number } = {},
): void {
  const { present = true, attempts = 10 } = options;
  const poll = (remaining: number): void => {
    cy.request({ url: path, headers: { accept: 'text/html' } }).then((response) => {
      const rendered = String(response.body).includes(text);
      if (rendered === present) {
        return;
      }
      if (remaining <= 0) {
        throw new Error(
          `${path} never ${present ? 'rendered' : 'stopped rendering'} "${text}" on the server`,
        );
      }
      cy.wait(500);
      poll(remaining - 1);
    });
  };
  poll(attempts);
  cy.visit(path);
}

/**
 * Visit a page repeatedly until `check` accepts its rendered body. Used where the persisted
 * result is a small attribute (a stock level, a toggle state) rather than a block of text,
 * for the same stale-while-revalidate reason as {@link visitWhenServerRenders}.
 */
export function visitUntil(
  path: string,
  description: string,
  check: ($body: JQuery<HTMLElement>) => boolean,
  attempts = 10,
): void {
  cy.visit(path);
  cy.get('body').then(($body) => {
    if (check($body)) {
      return;
    }
    if (attempts <= 0) {
      throw new Error(`${path} never showed: ${description}`);
    }
    cy.wait(500);
    visitUntil(path, description, check, attempts - 1);
  });
}

/** SKUs must be uppercase letters, digits or hyphens. */
export function uniqueSku(): string {
  return `CY-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

/** Create a product (inactive draft by default) through the dashboard product form. */
export function createProductThroughForm(options: {
  name: UniqueCatalogName;
  sku: string;
  price: string;
}): void {
  cy.visit('/en/products/new');
  cy.get('input[placeholder="e.g. Classic Ballpoint Pen"]')
    .filter(':visible')
    .should(($el) => {
      expect(Object.keys($el[0]).some((key) => key.startsWith('__reactProps$'))).to.equal(true);
    });
  cy.get('input[placeholder="e.g. Classic Ballpoint Pen"]')
    .filter(':visible')
    .type(options.name.nameEn);
  cy.get('input[placeholder="مثال: قلم جاف كلاسيك"]').filter(':visible').type(options.name.nameAr);
  cy.contains('button', 'Variants').click();
  cy.contains('New Variant').click();
  cy.get('input[placeholder="e.g. STA-PEN-BLUE"]').type(options.sku);
  cy.get('input[placeholder="0.00"]').first().clear().type(options.price);
  cy.contains('button', 'Publish Product').click();
}

/**
 * Click a server-rendered control only after React has attached its handlers to it.
 * Clicking before hydration silently drops the interaction in the production build.
 */
export function clickWhenHydrated(subject: Cypress.Chainable<JQuery<HTMLElement>>): void {
  subject
    .should(($el) => {
      const hydrated = Object.keys($el[0]).some((key) => key.startsWith('__reactProps$'));
      expect(hydrated, 'control hydrated by React').to.equal(true);
    })
    .click();
}
