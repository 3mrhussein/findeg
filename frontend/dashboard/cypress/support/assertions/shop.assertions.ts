import { shopSelectors } from "../selectors/shop.selectors";
import type { ResultsSummary } from "../actions/shop.actions";

/**
 *
 */
export function expectSummaryToEqual(actual: ResultsSummary, expected: ResultsSummary): void {
  expect(actual.shown, "shown count").to.eq(expected.shown);
  expect(actual.total, "total count").to.eq(expected.total);
}

/**
 *
 */
export function expectProductVisibleByName(name: string): void {
  // Check for existence instead of visibility due to Framer Motion animations
  // The product cards have opacity:0 initially which Cypress considers "not visible"
  cy.contains(shopSelectors.productCardTitle, name).should("exist");
}

/**
 *
 */
export function expectCartContainsProductId(productId: number): void {
  cy.get(shopSelectors.cartItemById(productId), { timeout: 30000 }).should("exist");
}

/**
 *
 */
export function expectCartContainsProductName(name: string): void {
  cy.get('[data-testid^="cart-item-"]', { timeout: 30000 }).contains(name).should("exist");
}

/**
 *
 */
export function expectCartQuantity(productId: number, quantity: number): void {
  cy.get(shopSelectors.cartQuantityById(productId)).should("have.text", String(quantity));
}

/**
 *
 */
export function expectVisiblePricesAscending(): void {
  cy.get(shopSelectors.productCardPrice).should(($prices) => {
    const values = [...$prices].map((el) => {
      const text = el.textContent || "";
      return Number(text.replace(/[^0-9.]/g, ""));
    });
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).to.deep.equal(sorted);
  });
}

/**
 *
 */
export function expectVisiblePricesDescending(): void {
  cy.get(shopSelectors.productCardPrice).should(($prices) => {
    const values = [...$prices].map((el) => {
      const text = el.textContent || "";
      return Number(text.replace(/[^0-9.]/g, ""));
    });
    const sorted = [...values].sort((a, b) => b - a);
    expect(values).to.deep.equal(sorted);
  });
}
