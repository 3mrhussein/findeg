import { shopSelectors } from '../selectors/shop.selectors';

/**
 * Asserts checkout submit button disabled state.
 */
export function expectCheckoutSubmitDisabled(disabled: boolean): void {
  cy.get(shopSelectors.checkoutSubmitButton).should(disabled ? 'be.disabled' : 'not.be.disabled');
}

/**
 * Asserts that all provided validation messages are visible.
 */
export function expectCheckoutValidationMessagesVisible(messages: string[]): void {
  messages.forEach((message) => {
    cy.contains(message).should('be.visible');
  });
}

/**
 * Asserts that checkout error alert includes the expected message.
 */
export function expectCheckoutErrorAlertContains(message: string): void {
  cy.get(shopSelectors.checkoutErrorAlert).should('be.visible').and('contain', message);
}
