export {};

interface PlpCatalog {
  listingUrl: string;
  pagedUrl: string;
  alpha: { id: number; name: string };
  beta: { id: number; name: string };
}

const card = 'main article';

/** Product names in render order; fixture names are a letter and a zero-padded price. */
function listedNames(): Cypress.Chainable<string[]> {
  return cy
    .get(card)
    .then(($cards) =>
      [...$cards].map(
        (element) => element.querySelector('a[href*="/shop/products/"]')?.textContent?.trim() ?? '',
      ),
    );
}

/** Clicking before React attaches handlers silently drops the interaction in the production build. */
function hydrated(selector: string, text?: string | RegExp) {
  const subject = text === undefined ? cy.get(selector).first() : cy.contains(selector, text);
  return subject.should(($element) => {
    const attached = Object.keys($element[0]).some((key) => key.startsWith('__reactProps$'));
    expect(attached, `${selector} hydrated by React`).to.equal(true);
  });
}

function shouldShow(range: string, names: string[]) {
  cy.contains(`Showing ${range} products`).should('be.visible');
  listedNames().should('deep.equal', names);
}

describe('Product listing page', () => {
  let catalog: PlpCatalog;

  before(() => {
    cy.task<PlpCatalog>('createPlpCatalog').then((created) => {
      catalog = created;
    });
  });

  it('lists only active products of the category, newest first', () => {
    cy.visit(catalog.listingUrl);
    shouldShow('1–6 of 6', ['N60', 'A50', 'B40', 'A30', 'B20', 'A10']);
  });

  it('filters by brand from the filter panel and by several brands from the URL', () => {
    cy.visit(catalog.listingUrl);
    hydrated('aside label', catalog.alpha.name).click();
    cy.location('search').should('contain', `brandId=${catalog.alpha.id}`);
    shouldShow('1–3 of 3', ['A50', 'A30', 'A10']);

    cy.visit(`${catalog.listingUrl}?brandId=${catalog.alpha.id}&brandId=${catalog.beta.id}`);
    shouldShow('1–5 of 5', ['A50', 'B40', 'A30', 'B20', 'A10']);
  });

  it('filters by an inclusive price range', () => {
    cy.visit(`${catalog.listingUrl}?minPrice=20&maxPrice=40&sort=price-low-high`);
    shouldShow('1–3 of 3', ['B20', 'A30', 'B40']);
  });

  it('sorts by price from the sort control', () => {
    cy.visit(catalog.listingUrl);
    hydrated('main [role="combobox"]').click();
    cy.contains('[role="option"]', 'Price Low-High').click();
    cy.location('search').should('contain', 'sort=price-low-high');
    shouldShow('1–6 of 6', ['A10', 'B20', 'A30', 'B40', 'A50', 'N60']);

    cy.visit(`${catalog.listingUrl}?sort=price-high-low`);
    shouldShow('1–6 of 6', ['N60', 'A50', 'B40', 'A30', 'B20', 'A10']);
  });

  it('paginates with the pagination controls', () => {
    cy.visit(`${catalog.pagedUrl}?sort=price-low-high`);
    cy.contains('Showing 1–24 of 25 products').should('be.visible');
    cy.get(card).should('have.length', 24);
    listedNames().its(0).should('eq', 'P01');

    hydrated('main button', /^2$/).click();
    cy.location('search').should('contain', 'page=2');
    shouldShow('25–25 of 25', ['P25']);
  });

  it('shows the empty state when filters match nothing', () => {
    cy.visit(`${catalog.listingUrl}?minPrice=900`);
    cy.contains('h2', 'No products found').should('be.visible');
    cy.get(card).should('not.exist');
  });
});
