import { signInToDashboard } from '../support/actions/dashboard-session.actions';

for (const locale of ['en', 'ar']) {
  describe(`Dashboard seeded journeys (${locale})`, () => {
    beforeEach(() => {
      signInToDashboard();
    });

    it('renders seeded catalog records and applies server search filters', () => {
      cy.visit(`/${locale}/products`);
      cy.get('input[placeholder*="SKU"]').filter(':visible').should('be.visible');
      cy.get('tbody a[href*="/products/"]:visible').should('have.length.greaterThan', 0);
      cy.get('input[placeholder*="SKU"]').filter(':visible').type('NO-SUCH-SKU-CYPRESS');
      cy.location('search').should('include', 'NO-SUCH-SKU-CYPRESS');
      cy.get('tbody a[href*="/products/"]:visible').should('not.exist');
    });

    it('renders seeded orders and applies server search filters', () => {
      cy.visit(`/${locale}/orders`);
      cy.contains('h1', 'Orders').should('be.visible');
      cy.get('tbody a[href*="/orders/"]:visible').should('have.length.greaterThan', 0);
      cy.get('[data-testid="admin-orders-filter-search"]')
        .filter(':visible')
        .should('not.be.disabled')
        .type('NO-SUCH-ORDER-CYPRESS', { delay: 0 });
      cy.location('search').should('include', 'NO-SUCH-ORDER-CYPRESS');
      cy.get('tbody a[href*="/orders/"]:visible').should('not.exist');
    });
  });
}
