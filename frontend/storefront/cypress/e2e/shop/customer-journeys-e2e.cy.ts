import {
  fillCheckoutRequiredFields,
  triggerCheckoutValidationBlurWithInvalidInputs,
} from '../../support/actions/checkout.actions';
import { registerUserThroughUi } from '../../support/actions/auth.actions';
import { buildE2EUser } from '../../support/utils/user-factory';
import { GUEST_CHECKOUT_DATA } from '../../support/constants/test-data';

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
      expect(request.headers['idempotency-key']).to.be.a('string').and.to.have.length.greaterThan(0);
      expect(request.body.confirmation).to.be.a('string').and.to.have.length.greaterThan(0);
      expect(request.body.lines[0].variantId).to.be.a('number');
      expect(response?.statusCode).to.eq(201);
    });
    cy.contains(/FE-[A-Z0-9]+/, { timeout: 30000 }).should('be.visible');
  });

  it('triggers reconfirmation after a real price change and accepts updated terms without stubbing', () => {
    cy.task<{ id: number; basePrice: string }>('getVariantByProductSlug', 'holders-241').then(
      (variant) => {
        expect(Boolean(variant)).to.equal(true);
        const originalPrice = variant.basePrice;
        visitCheckoutWithItem();
        fillCheckoutRequiredFields();

        // Change price in the database before submitting acceptance
        const newPrice = (Number(originalPrice) + 10).toFixed(2);
        cy.task('setVariantPrice', { variantId: variant.id, price: newPrice });

        cy.get('button[type="submit"]').click();

        // Reconfirmation notice should appear
        cy.contains('h2', /Review changes|مراجعة التغييرات/).should('be.visible');
        cy.contains('button', /Confirm new total|تأكيد الإجمالي الجديد/).click();

        // Order accepts with the updated confirmation
        cy.contains(/FE-[A-Z0-9]+/, { timeout: 30000 }).should('be.visible');

        // Restore price
        cy.task('setVariantPrice', { variantId: variant.id, price: originalPrice });
      },
    );
  });

  it('refuses checkout when stock is insufficient on the real database without stubbing', () => {
    cy.task<{ id: number }>('getVariantByProductSlug', 'holders-241').then((variant) => {
      expect(Boolean(variant)).to.equal(true);
      // Set stock to 0
      cy.task('setVariantStock', { variantId: variant.id, onHand: 0 });

      visitCheckoutWithItem();
      fillCheckoutRequiredFields();
      cy.get('button[type="submit"]').click();

      // Insufficient stock alert appears with available quantity 0
      cy.contains('h2', /Insufficient stock|الكمية المتوفرة غير كافية/).should('be.visible');
      cy.contains(/0/).should('be.visible');
      cy.get('#fullName').should('not.have.value', '');

      // Restore stock
      cy.task('setVariantStock', { variantId: variant.id, onHand: 100 });
    });
  });

  it('looks up a guest order by reference and verification code through all three steps', () => {
    visitCheckoutWithItem();
    fillCheckoutRequiredFields();
    cy.get('button[type="submit"]').click();
    cy.contains(/FE-[A-Z0-9]+/, { timeout: 30000 })
      .invoke('text')
      .then((headingText) => {
        const match = headingText.match(/FE-[A-Z0-9]+/);
        expect(Boolean(match)).to.equal(true);
        const reference = match![0];

        // Step 1: visit /order-lookup and request code
        cy.visit('/en/order-lookup');
        cy.get('#order-reference').clear().type(reference);
        cy.get('#order-email').clear().type(GUEST_CHECKOUT_DATA.email);
        cy.get('button[type="submit"]').click();

        // Step 2: enter code
        cy.location('pathname', { timeout: 15000 }).should('eq', '/en/order-lookup/code');
        cy.task<string>('getGuestAccessCode', reference).then((code) => {
          expect(code).to.have.length(6);
          cy.get('#order-code').type(code);
          cy.get('button[type="submit"]').click();

          // Step 3: guest order page
          cy.location('pathname', { timeout: 15000 }).should('eq', `/en/guest-orders/${reference}`);
          cy.get('[data-testid="guest-order-heading"]').should('contain.text', reference);
          cy.contains(/Status|الحالة/).should('be.visible');
        });
      });
  });

  it('registers a Customer and opens their account', () => {
    registerUserThroughUi(buildE2EUser());
    cy.contains('h1', /My Account|حسابي/).should('be.visible');
  });

  it('shows My Account when signed in, and signing out from Arabic preserves the Arabic locale', () => {
    const user = buildE2EUser();
    registerUserThroughUi(user);
    cy.contains('h1', /My Account|حسابي/).should('be.visible');

    // Switch to Arabic
    cy.visit('/ar/my-account');
    cy.get('h1').should('contain.text', 'حسابي');

    // Click logout
    cy.contains('button', 'تسجيل الخروج').click();

    // Verify redirected to Arabic login page
    cy.location('pathname', { timeout: 15000 }).should('eq', '/ar/login');
    cy.get('[data-testid="login-email-input"]').should('be.visible');
  });

  it('persists updated customer name and phone across reloads', () => {
    const user = buildE2EUser();
    registerUserThroughUi(user);

    cy.visit('/en/my-account/settings');
    cy.get('#name').clear().type('Updated Cypress Name');
    cy.get('#phone').clear().type('+20 10 9999 8888');
    cy.contains('button', 'Save').click();

    cy.reload();
    cy.get('#name').should('have.value', 'Updated Cypress Name');
    cy.get('#phone').should('have.value', '+20 10 9999 8888');
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

  it('resolves canonical navigation and footer routes without dead links', () => {
    const routes = [
      '/en',
      '/en/schools',
      '/en/categories',
      '/en/collections',
      '/en/order-lookup',
      '/en/about',
    ];
    for (const route of routes) {
      cy.request({ url: route, failOnStatusCode: false }).its('status').should('eq', 200);
    }
  });
});
