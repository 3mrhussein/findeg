interface SupplyListFixture {
  publishedUrl: string;
  archivedUrl: string;
}

describe('School Supply List completeness', () => {
  let fixture: SupplyListFixture;

  before(() => {
    cy.task<SupplyListFixture>('createSupplyLists', null, { timeout: 60000 }).then((created) => {
      fixture = created;
    });
  });

  it('opens a published list signed out and updates completeness as the selection changes', () => {
    cy.visit(fixture.publishedUrl);
    cy.contains('1 of 1 required items covered').should('be.visible');

    cy.contains('h2', 'Cypress pen item')
      .closest('li')
      .within(() => {
        cy.get('input[type="number"]').clear().type('1');
      });
    cy.contains('0 of 1 required items covered').should('be.visible');
    cy.contains('[aria-label="Still needed"] li', 'Cypress pen item').should('be.visible');

    cy.contains('h2', 'Cypress pen item')
      .closest('li')
      .within(() => {
        cy.contains('button', 'Change').click();
        cy.contains('button', /12\.00/).click();
        cy.get('input[type="number"]').clear().type('2');
      });
    cy.contains('1 of 1 required items covered').should('be.visible');
    cy.contains('Still needed').should('not.exist');
    cy.contains('a', 'Checkout')
      .should('be.visible')
      .and(
        'have.attr',
        'href',
        `/en/checkout?source=list&publicCode=${fixture.publishedUrl.split('/').at(-1)}`,
      );
  });

  it('shows the archived banner with checkout disabled', () => {
    cy.visit(fixture.archivedUrl);
    cy.get('[role="status"]').should('contain.text', 'no longer current');
    cy.contains('button', 'Checkout').should('be.disabled');
    cy.contains('Checkout is unavailable for an archived list.').should('be.visible');
  });
});
