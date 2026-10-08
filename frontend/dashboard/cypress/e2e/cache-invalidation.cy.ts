/**
 * Dashboard cache invalidation (read-your-writes).
 *
 * Product and category mutations run through real server actions that call `updateTag()`.
 * The cached list pages must show each write on the very next read (not stale-while-
 * revalidate) and still show it after a reload. Every record is created by the test with a
 * unique token and, where the dashboard offers a delete, removed by the test itself.
 */
import { signInToDashboard } from '../support/actions/dashboard-session.actions';
import {
  CATEGORY_NAME_PLACEHOLDER,
  categoryRow,
  createCategoryFromUi,
  createProductFromUi,
  hydrated,
  renameProductFromUi,
  saveCategoryForm,
  searchProductsBySku,
  uniqueToken,
} from '../support/actions/dashboard-catalog.actions';

for (const locale of ['en', 'ar']) {
  describe(`Dashboard cache invalidation (${locale})`, () => {
    beforeEach(() => {
      signInToDashboard();
    });

    it('reflects category create, update and delete immediately and after reload', () => {
      const token = uniqueToken('cypress-cat');
      const createdName = `Created ${token}`;
      const updatedName = `Updated ${token}`;

      createCategoryFromUi(locale, createdName);
      categoryRow(token).should('contain.text', createdName);
      cy.reload();
      categoryRow(token).should('contain.text', createdName);

      hydrated('div.group button:has(svg.lucide-trash-2)');
      categoryRow(token).find('svg.lucide-pencil').parents('button').first().click();
      cy.get(`input[placeholder="${CATEGORY_NAME_PLACEHOLDER}"]`).clear().type(updatedName);
      saveCategoryForm();
      categoryRow(token).should('contain.text', updatedName).and('not.contain.text', createdName);
      cy.reload();
      categoryRow(token).should('contain.text', updatedName);

      hydrated('div.group button:has(svg.lucide-trash-2)');
      categoryRow(token).find('svg.lucide-trash-2').parents('button').first().click();
      // Forced: the confirm dialog is mounted but laid out below the viewport under Cypress.
      cy.get('[role="dialog"] button[data-variant="destructive"]').click({ force: true });
      cy.contains('p', token).should('not.exist');
      cy.reload();
      cy.get('h1').should('be.visible');
      cy.contains('p', token).should('not.exist');
    });

    it('reflects product create and update immediately and after reload', () => {
      const token = uniqueToken('cypress-prod').toUpperCase();
      const createdName = `Created ${token}`;
      const updatedName = `Updated ${token}`;

      createProductFromUi(locale, createdName, token);
      searchProductsBySku(locale, token);
      cy.contains('tr', token, { timeout: 20000 }).should('contain.text', createdName);

      cy.contains('tr', token).find('a[href*="/edit"]').first().click();
      cy.location('pathname').should('match', /\/products\/\d+\/edit$/);
      renameProductFromUi(updatedName);

      // First read after the mutation: stale-while-revalidate would still show the old name.
      searchProductsBySku(locale, token);
      cy.contains('tr', token, { timeout: 20000 })
        .should('contain.text', updatedName)
        .and('not.contain.text', createdName);
      cy.reload();
      cy.contains('tr', token).should('contain.text', updatedName);
    });
  });
}
