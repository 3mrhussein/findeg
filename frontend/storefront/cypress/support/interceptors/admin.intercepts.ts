/**
 * Reusable interceptors for the Admin Dashboard.
 *
 * NOTE: Initial page loads in Next.js App Router are server-rendered.
 * Interceptors should be used for client-side actions (Server Actions, router.push, etc).
 */
export const adminIntercepts = {
  /**
   * Intercept product creation regardless of implementation style
   * (Server Action postback or direct API request).
   */
  interceptProductCreation: () => {
    cy.intercept('POST', '**/admin/products/new').as('createProductDetails');
    return cy.intercept('POST', '**/api/v1/admin/products').as('createProductDetails');
  },

  /**
   * Wait for product creation to complete.
   */
  waitForProductCreation: () => {
    return cy.wait('@createProductDetails', { timeout: 20000 });
  },

  /**
   * Intercept product list updates (filtering, search, pagination).
   * These are GET requests with query parameters triggered by router.push.
   */
  interceptProductListUpdate: () => {
    return cy.intercept('GET', '**/admin/products?*').as('adminProductListUpdate');
  },

  /**
   * Wait for product list update to complete.
   */
  waitForProductListUpdate: () => {
    return cy.wait('@adminProductListUpdate', { timeout: 15000 });
  },
};
