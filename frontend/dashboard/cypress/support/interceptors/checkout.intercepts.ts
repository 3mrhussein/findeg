import { API_ROUTES } from '../constants/routes';
import { SHOP_MESSAGES } from '../constants/messages';

/**
 * Forces checkout order endpoint to fail for client error-path testing.
 */
export function interceptCheckoutOrderFailure(
  message: string = SHOP_MESSAGES.checkoutOrderCreateFailed,
): void {
  cy.intercept('POST', API_ROUTES.checkoutOrder, {
    statusCode: 500,
    body: {
      success: false,
      error: {
        message,
      },
    },
  }).as('checkoutOrderFailure');
}
