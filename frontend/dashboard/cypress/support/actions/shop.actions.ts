import { shopSelectors } from '../selectors/shop.selectors';
import { localePath } from '../utils/url';
import { ROUTE_QUERY_KEYS, UI_ROUTES } from '../constants/routes';
import { SHOP_MESSAGES } from '../constants/messages';

export interface ResultsSummary {
  shown: number;
  total: number;
}

const RESULTS_REGEX = SHOP_MESSAGES.resultsRegex;
const PAGE_VISIT_TIMEOUT = 120000;

/**
 *
 */
export function visitShopWithQuery(query = ''): void {
  const suffix = query ? `?${query}` : '';
  cy.visit(`${localePath(UI_ROUTES.shop)}${suffix}`, { timeout: PAGE_VISIT_TIMEOUT });
  cy.get(shopSelectors.shopResultsHeading).should('be.visible');
}

/**
 *
 */
export function visitSearchWithQuery(query = ''): void {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
  cy.visit(`${localePath(UI_ROUTES.search)}${suffix}`, { timeout: PAGE_VISIT_TIMEOUT });
}

/**
 *
 */
export function applyCategoryFilter(slug: string): void {
  cy.get(shopSelectors.categoryFilterCheckbox(slug))
    .filter(':visible')
    .first()
    .click({ force: true });
  cy.url({ timeout: 10000 }).should('include', `${ROUTE_QUERY_KEYS.categories}=${slug}`);
}

/**
 *
 */
export function applyBrandFilter(slug: string): void {
  cy.get(shopSelectors.brandFilterCheckbox(slug)).filter(':visible').first().click({ force: true });
  cy.url({ timeout: 10000 }).should('include', `${ROUTE_QUERY_KEYS.brands}=${slug}`);
}

/**
 *
 */
export function chooseSort(optionText: string): void {
  const maybeValue =
    optionText === 'featured' ||
    optionText === 'price-asc' ||
    optionText === 'price-desc' ||
    optionText === 'rating-desc'
      ? optionText
      : null;

  cy.get(shopSelectors.sortTrigger).should('be.visible').scrollIntoView().click({ force: true });

  if (maybeValue) {
    cy.get(shopSelectors.sortOptionByValue(maybeValue), { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });
    return;
  }

  cy.get('[role="listbox"]:visible', { timeout: 15000 })
    .first()
    .contains('[role="option"]', optionText, { timeout: 15000 })
    .click({ force: true });
}

/**
 *
 */
export function goToNextPage(): void {
  cy.get(shopSelectors.paginationNext).scrollIntoView().click({ force: true });
  cy.url().should('include', `${ROUTE_QUERY_KEYS.page}=2`);
}

/**
 *
 */
export function readResultsSummary(): Cypress.Chainable<ResultsSummary> {
  return cy
    .get(shopSelectors.resultsSummaryText)
    .should('be.visible')
    .contains(RESULTS_REGEX)
    .then(($p) => {
      const text = $p.text();
      const match = text.match(RESULTS_REGEX);
      expect(match, `results summary text: ${text}`).to.not.be.null;

      return {
        shown: Number(match![1]),
        total: Number(match![2]),
      };
    });
}

/**
 *
 */
export function visitCategoryPage(slug: string): void {
  cy.visit(localePath(UI_ROUTES.categoryBySlug(slug)), { timeout: PAGE_VISIT_TIMEOUT });
  cy.get(shopSelectors.categoryResultsHeading).should('be.visible');
}

/**
 *
 */
export function openHeaderCartDrawer(): void {
  const drawerSelectors = `${shopSelectors.cartDrawerContent}, ${shopSelectors.cartDrawerDialogOpen}`;

  const ensureDrawerOpen = (attempts = 5): Cypress.Chainable<undefined> =>
    cy.get('body').then(($body) => {
      const hasOpenDrawer = $body.find(drawerSelectors).length > 0;
      if (hasOpenDrawer) return cy.wrap(undefined, { log: false });

      if (attempts <= 0) {
        throw new Error('Cart drawer did not open after multiple trigger attempts');
      }

      cy.get(shopSelectors.headerCartTrigger)
        .filter(':visible')
        .should('have.length.greaterThan', 0)
        .first()
        .click({ force: true });

      cy.wait(250, { log: false });
      return ensureDrawerOpen(attempts - 1);
    });

  ensureDrawerOpen();
  cy.get(drawerSelectors, { timeout: 30000 }).should('be.visible');
}
