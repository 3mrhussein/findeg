import { API_ROUTES } from '../constants/routes';
import { API_QUERY_DEFAULTS, buildApiUrl } from '../constants/api-query';

const GUEST_ID_KEY = 'findeg_guest_id';

export function createGuestId(seed = Date.now()): string {
  return `guest_cypress_${seed}`;
}

export function setGuestIdInBrowser(guestId: string): void {
  cy.window().then((win) => {
    win.localStorage.setItem(GUEST_ID_KEY, guestId);
  });
}

export function visitWithGuest(path: string, guestId: string): void {
  cy.visit(path, {
    timeout: 120000,
    onBeforeLoad(win) {
      win.localStorage.setItem(GUEST_ID_KEY, guestId);
    },
  });
}

export function getGuestCart(guestId: string): Cypress.Chainable<any> {
  return cy
    .request({
      method: 'GET',
      url: API_ROUTES.cart,
      headers: { 'X-Guest-Id': guestId },
    })
    .then((response) => response.body?.data?.cart);
}

export function clearGuestCart(guestId: string): Cypress.Chainable<void> {
  return getGuestCart(guestId)
    .then((cart) => {
      const items = (cart?.items || []) as Array<{
        id: number;
        variantKey?: string;
        uomCode?: string;
        customerGroup?: string;
      }>;

      let chain: Cypress.Chainable = cy.wrap(null, { log: false });
      items.forEach((item) => {
        chain = chain.then(() => {
          const qs = new URLSearchParams();
          if (item.variantKey) qs.set('variantKey', item.variantKey);
          if (item.uomCode) qs.set('uomCode', item.uomCode);
          if (item.customerGroup) qs.set('customerGroup', item.customerGroup);
          const suffix = qs.toString();

          return cy.request({
            method: 'DELETE',
            url: `${API_ROUTES.cartItemById(item.id)}${suffix ? `?${suffix}` : ''}`,
            headers: { 'X-Guest-Id': guestId },
            failOnStatusCode: false,
          });
        });
      });

      return chain;
    })
    .then(() =>
      getGuestCart(guestId).then((cart) => {
        const items = (cart?.items || []) as unknown[];
        expect(items.length, `cart should be empty for guest ${guestId}`).to.eq(0);
      }),
    );
}

export function addProductToGuestCart(
  guestId: string,
  productId: number,
  quantity = 1,
): Cypress.Chainable<number> {
  return addProductToGuestCartRequest(guestId, productId, quantity).then((response) => {
    expect(response.status).to.eq(201);
    return response.status;
  });
}

export function addProductToGuestCartRequest(
  guestId: string,
  productId: number,
  quantity = 1,
  failOnStatusCode = true,
): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    method: 'POST',
    url: API_ROUTES.cartItems,
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Id': guestId,
    },
    body: {
      productId,
      quantity,
      variantKey: 'default',
      uomCode: 'pcs',
      customerGroup: 'public_b2c',
    },
    failOnStatusCode,
  });
}

export function addProductToGuestCartExpectStatus(
  guestId: string,
  productId: number,
  expectedStatus: number,
  quantity = 1,
): Cypress.Chainable<number> {
  return addProductToGuestCartRequest(guestId, productId, quantity, false).then((response) => {
    expect(response.status).to.eq(expectedStatus);
    return response.status;
  });
}

export function addProductToUserCart(
  token: string,
  productId: number,
  quantity = 1,
): Cypress.Chainable<number> {
  return cy
    .request({
      method: 'POST',
      url: API_ROUTES.cartItems,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: {
        productId,
        quantity,
        variantKey: 'default',
        uomCode: 'pcs',
        customerGroup: 'public_b2c',
      },
    })
    .then((response) => {
      expect(response.status).to.eq(201);
      return response.status;
    });
}

export function getFirstProductId(): Cypress.Chainable<number> {
  return cy
    .request(
      buildApiUrl(API_ROUTES.products, {
        lang: API_QUERY_DEFAULTS.language,
        limit: API_QUERY_DEFAULTS.singleItemLimit,
      }),
    )
    .then((response) => {
      const products = response.body.products as Array<{ id: number }>;
      expect(products.length).to.eq(1);
      return products[0].id;
    });
}
