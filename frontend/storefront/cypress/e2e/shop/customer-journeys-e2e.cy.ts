import {
  fillCheckoutRequiredFields,
  triggerCheckoutValidationBlurWithInvalidInputs,
} from '../../support/actions/checkout.actions';
import { registerUserThroughUi } from '../../support/actions/auth.actions';
import { buildE2EUser } from '../../support/utils/user-factory';

const card = 'main a[href*="/shop/products/"]';
const drawer = '[data-testid="cart-drawer-content"]';
const quantity = '[data-testid^="cart-quantity-"]';

/**
 * Adds an available seeded variant through the same UI a Customer uses. Its own small
 * category keeps the card on the first page whatever other specs add to the catalog.
 */
function addCartItem() {
  cy.visit('/en/shop/holders');
  cy.get('a[href="/en/shop/products/holders-241"]')
    .first()
    .closest('article')
    .contains('button', 'Add to Cart')
    // Clicking before React attaches handlers silently drops the interaction in the production build.
    .should(($button) => {
      const hydrated = Object.keys($button[0]).some((key) => key.startsWith('__reactProps$'));
      expect(hydrated, 'Add to Cart hydrated by React').to.equal(true);
    })
    .click();
  cy.get('[data-testid="header-cart-trigger"]').should('contain.text', '1');
  cy.get(drawer).should('be.visible');
  cy.get(quantity).should('have.text', '1');
}

function visitCheckoutWithItem() {
  addCartItem();
  cy.visit('/en/checkout');
  cy.get('#fullName').should('be.visible');
}

describe('Customer storefront journeys', () => {
  it('redirects the bare entry point and returns a localized not-found page', () => {
    cy.request({ url: '/', followRedirect: false }).then((response) => {
      expect(response.status).to.eq(307);
      expect(response.headers.location).to.match(/\/en\/?$/);
    });
    cy.request({ url: '/en/nonexistent-cypress-route', failOnStatusCode: false })
      .its('status')
      .should('eq', 404);
  });

  for (const locale of ['en', 'ar']) {
    it(`renders the seeded catalog and follows a product slug in ${locale}`, () => {
      cy.visit(`/${locale}/shop`);
      cy.get(card).should('have.length.greaterThan', 0);
      cy.get(card)
        .first()
        .then(($link) => {
          const href = $link.attr('href');
          expect(href).to.match(new RegExp(`^/${locale}/shop/products/`));
          cy.wrap($link).click();
          cy.location('pathname').should('eq', href);
        });
      cy.get('h1').should('be.visible').and('not.be.empty');
      cy.contains('button', /Add to Cart|أضف إلى السلة/).should('be.visible');
    });

    it(`renders categories and school directory in ${locale}`, () => {
      cy.visit(`/${locale}/categories`);
      cy.get('h1').should('be.visible');
      cy.get('a[href*="/categories/"]').should('have.length.greaterThan', 0);
      cy.visit(`/${locale}/schools`);
      cy.get('h1').should('be.visible');
      cy.get('html').should('have.attr', 'dir', locale === 'ar' ? 'rtl' : 'ltr');
    });
  }

  it('adds a variant from the product detail page', () => {
    cy.visit('/en/shop');
    cy.get(card).first().click();
    cy.contains('button', 'Add to Cart').click();
    cy.get('[data-testid="header-cart-trigger"]').should('contain.text', '1');
    cy.get(drawer).should('be.visible');
    cy.get(quantity).should('have.text', '1');
  });

  it('persists a cart item across a full route transition', () => {
    addCartItem();
    cy.get('[data-testid^="cart-item-"]')
      .invoke('attr', 'data-testid')
      .then((itemId) => {
        cy.visit('/en/categories');
        cy.get('[data-testid="header-cart-trigger"]').should('contain.text', '1').click();
        cy.get(`[data-testid="${itemId}"]`).should('be.visible');
        cy.get(quantity).should('have.text', '1');
      });
  });

  it('increments, decrements and removes a cart variant', () => {
    addCartItem();
    cy.get('[data-testid^="cart-increase-"]').click();
    cy.get(quantity).should('have.text', '2');
    cy.get('[data-testid^="cart-decrease-"]').click();
    cy.get(quantity).should('have.text', '1');
    cy.get('[data-testid^="cart-action-"]').click();
    cy.get('[data-testid^="cart-item-"]').should('not.exist');
  });

  it('renders empty checkout for a new guest', () => {
    cy.visit('/en/checkout');
    cy.get('h1').should('be.visible');
    cy.get('#fullName').should('not.exist');
    cy.get('main').should('contain.text', 'empty');
  });

  it('validates required checkout fields before submitting', () => {
    visitCheckoutWithItem();
    triggerCheckoutValidationBlurWithInvalidInputs();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('#fullName').parent().should('contain.text', 'Please enter your full name.');
    cy.get('#city').parent().should('contain.text', 'Please enter your city.');
  });

  it('accepts a real guest COD order after obtaining a Quote', () => {
    cy.intercept('POST', '/api/v1/checkout/validate').as('quote');
    cy.intercept('POST', '/api/v1/checkout/order').as('accept');
    visitCheckoutWithItem();
    fillCheckoutRequiredFields();
    cy.get('button[type="submit"]').click();
    cy.wait('@quote').its('response.statusCode').should('eq', 200);
    cy.wait('@accept').then(({ request, response }) => {
      expect(request.headers['idempotency-key']).to.be.a('string').and.not.empty;
      expect(request.body.confirmation).to.be.a('string').and.not.empty;
      expect(request.body.lines[0].variantId).to.be.a('number');
      expect(response?.statusCode).to.eq(201);
    });
    cy.contains(/FE-[A-Z0-9]+/, { timeout: 30000 }).should('be.visible');
  });

  it('shows acceptance failure and preserves checkout input for retry', () => {
    cy.intercept('POST', '/api/v1/checkout/order', {
      statusCode: 500,
      body: { success: false, error: { message: 'E2E order acceptance unavailable' } },
    }).as('failure');
    visitCheckoutWithItem();
    fillCheckoutRequiredFields();
    cy.get('button[type="submit"]').click();
    cy.wait('@failure');
    cy.get('[role="alert"]').should('contain.text', 'E2E order acceptance unavailable');
    cy.get('#fullName').should('not.have.value', '');
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('registers a Customer and opens their account', () => {
    registerUserThroughUi(buildE2EUser());
    cy.contains('h1', /My Account|حسابي/).should('be.visible');
  });

  it("lists a signed-in Customer's order and keeps it private from other Customers", () => {
    cy.intercept('POST', '/api/v1/checkout/order').as('accept');
    registerUserThroughUi(buildE2EUser());
    visitCheckoutWithItem();
    fillCheckoutRequiredFields();
    cy.get('button[type="submit"]').click();
    cy.wait('@accept')
      .its('response.body.data.order.id')
      .then((orderId) => {
        cy.visit('/en/my-account/orders');
        cy.get(`a[href="/en/my-account/orders/${orderId}"]`)
          .should('contain.text', `#${orderId}`)
          .click();
        cy.get('[data-testid="my-account-order-detail-heading"]').should(
          'contain.text',
          `#${orderId}`,
        );

        cy.clearCookies();
        registerUserThroughUi(buildE2EUser());
        // The account layout streams, so the not-found page arrives with a 200 status.
        cy.visit(`/en/my-account/orders/${orderId}`, { failOnStatusCode: false });
        cy.contains('h1', 'Page not found').should('be.visible');
        cy.get('[data-testid="my-account-order-detail-heading"]').should('not.exist');
      });
  });

  it('redirects a guest account request to login', () => {
    cy.visit('/en/my-account');
    cy.location('pathname').should('eq', '/en/login');
    cy.get('[data-testid="login-email-input"]').should('be.visible');
  });
});
