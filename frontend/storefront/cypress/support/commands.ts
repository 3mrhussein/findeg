import { loginAsAdminSession, loginAsAdminThroughUi } from './actions/auth.actions';
import {
  createProductFromUi,
  createProductViaApi,
  deleteProductBySku,
  visitNewProductForm,
} from './actions/admin-product.actions';
import type { TestProductInput } from './utils/product-factory';
import { SHOP_MESSAGES } from './constants/messages';

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdminUi(): Chainable<void>;
      loginAsAdminSession(): Chainable<void>;
      visitAdminNewProductForm(): Chainable<void>;
      createAdminProductUi(input: TestProductInput, categoryName?: string): Chainable<void>;
      createAdminProductApi(input: TestProductInput, categoryName?: string): Chainable<any>;
      cleanupProductBySku(sku: string): Chainable<void>;
      disableAnimations(): Chainable<void>;
      shouldBeVisible(visible: boolean): Chainable<JQuery<HTMLElement>>;
      shouldExist(exists: boolean): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('loginAsAdminUi', () => {
  loginAsAdminThroughUi();
});

Cypress.Commands.add('loginAsAdminSession', () => {
  loginAsAdminSession();
});

Cypress.Commands.add('visitAdminNewProductForm', () => {
  visitNewProductForm();
});

Cypress.Commands.add(
  'createAdminProductUi',
  (input: TestProductInput, categoryName: string = SHOP_MESSAGES.keychainsLabel) => {
    createProductFromUi(input, categoryName);
  },
);

Cypress.Commands.add(
  'createAdminProductApi',
  (input: TestProductInput, categoryName: string = SHOP_MESSAGES.keychainsLabel) => {
    return createProductViaApi(input, categoryName);
  },
);

Cypress.Commands.add('cleanupProductBySku', (sku: string) => {
  deleteProductBySku(sku);
});

Cypress.Commands.add(
  'shouldBeVisible',
  { prevSubject: 'element' },
  (subject: JQuery<HTMLElement>, visible: boolean) => {
    return cy.wrap(subject).should(visible ? 'be.visible' : 'not.be.visible');
  },
);

Cypress.Commands.add(
  'shouldExist',
  { prevSubject: 'element' },
  (subject: JQuery<HTMLElement>, exists: boolean) => {
    return cy.wrap(subject).should(exists ? 'exist' : 'not.exist');
  },
);

export {};
