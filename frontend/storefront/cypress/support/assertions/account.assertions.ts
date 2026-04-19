import { accountSelectors } from "../selectors/account.selectors";

/**
 * Asserts order card exists in my-account order history list.
 */
export function expectMyAccountOrderCardVisible(orderId: number): void {
  cy.get(accountSelectors.orderCardById(orderId)).should("be.visible");
}

/**
 * Asserts order detail heading renders expected order id.
 */
export function expectMyAccountOrderDetailVisible(orderId: number): void {
  cy.get(accountSelectors.orderDetailHeading).should("contain", `#${orderId}`);
}
