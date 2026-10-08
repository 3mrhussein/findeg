const card = '[data-testid^="product-card-title-"]';

describe('Catalog search', () => {
  it('shows seeded products for keyword search', () => {
    cy.visit('/en/search?q=keychains');
    cy.get(card).should('have.length.greaterThan', 0);
    cy.get(card).first().should('contain.text', 'Keychains');
  });

  it('shows an empty result set for an unmatched search', () => {
    const query = 'zzzz-unmatched-cypress-312';
    cy.visit(`/en/search?q=${query}`);
    cy.get('h1').should('be.visible').and('contain.text', query);
    cy.get(card).should('not.exist');
  });
});
