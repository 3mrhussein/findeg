import { shopSelectors } from '../selectors/shop.selectors';
import { GUEST_CHECKOUT_DATA } from '../constants/test-data';
import { SHOP_MESSAGES } from '../constants/messages';
import { API_ROUTES } from '../constants/routes';

export interface CheckoutFormInput {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  street: string;
}

/**
 * Waits until checkout form inputs are mounted and interactive.
 */
function waitForCheckoutFormReady(): void {
  cy.get(shopSelectors.checkoutFullName, { timeout: 30000 }).should('exist');
}

/**
 * Fills required checkout fields with valid guest input.
 */
export function fillCheckoutRequiredFields(data: CheckoutFormInput = GUEST_CHECKOUT_DATA): void {
  waitForCheckoutFormReady();
  cy.get(shopSelectors.checkoutFullName).clear().type(data.fullName);
  cy.get(shopSelectors.checkoutEmail).clear().type(data.email);
  cy.get(shopSelectors.checkoutPhone).clear().type(data.phone);
  cy.get(shopSelectors.checkoutCity).clear().type(data.city);
  cy.get(shopSelectors.checkoutArea).clear().type(data.area);
  cy.get(shopSelectors.checkoutStreet).clear().type(data.street);
}

/**
 * Triggers field-level validation by blurring required checkout inputs.
 */
export function triggerCheckoutValidationBlurWithInvalidInputs(): void {
  waitForCheckoutFormReady();
  cy.get(shopSelectors.checkoutFullName).clear().focus().blur();
  cy.get(shopSelectors.checkoutEmail).clear().type('invalid-email').blur();
  cy.get(shopSelectors.checkoutPhone).clear().type('12345').blur();
  cy.get(shopSelectors.checkoutCity).clear().focus().blur();
  cy.get(shopSelectors.checkoutArea).clear().focus().blur();
  cy.get(shopSelectors.checkoutStreet).clear().focus().blur();
}

/**
 * Submits the checkout form.
 */
export function submitCheckoutForm(): void {
  cy.get(shopSelectors.checkoutSubmitButton)
    .contains(SHOP_MESSAGES.placeOrderButton)
    .click({ force: true });
}

/**
 * Creates an order through checkout API for an authenticated user.
 */
export function createOrderViaApiAsUser(token: string): Cypress.Chainable<number> {
  return cy
    .request({
      method: 'POST',
      url: API_ROUTES.checkoutOrder,
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `admin_session=${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        address: {
          fullName: GUEST_CHECKOUT_DATA.fullName,
          phone: GUEST_CHECKOUT_DATA.phone,
          city: GUEST_CHECKOUT_DATA.city,
          area: GUEST_CHECKOUT_DATA.area,
          street: GUEST_CHECKOUT_DATA.street,
        },
        paymentMethod: 'cod',
      },
      failOnStatusCode: false,
    })
    .then((response) => {
      expect(response.status, 'checkout order status').to.eq(201);
      const orderId = response.body?.data?.order?.id as number | undefined;
      expect(orderId, 'created order id').to.be.a('number');
      return orderId!;
    });
}
