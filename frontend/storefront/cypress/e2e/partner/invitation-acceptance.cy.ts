interface InvitationFixture {
  email: string;
  code: string;
  url: string;
}

describe('Partner Invitation acceptance', () => {
  it('registers with the invited email, explicitly accepts, and opens the workspace', () => {
    cy.task<InvitationFixture>('createPartnerInvitation').then(({ email, code, url }) => {
      cy.visit(url);
      cy.contains('Cypress Partner School').should('be.visible');
      cy.contains('partner-administrator').should('be.visible');
      cy.contains('a', 'Register').click();

      cy.get('[data-testid="registration-email-input"]')
        .should('have.value', email)
        .and('have.attr', 'readonly');
      cy.get('[data-testid="registration-name-input"]').type('Partner Administrator');
      cy.get('[data-testid="registration-password-input"]').type('correct-horse-battery-staple', {
        log: false,
      });
      cy.get('[data-testid="registration-confirm-password-input"]').type(
        'correct-horse-battery-staple',
        { log: false },
      );
      cy.get('button[type="submit"]').click();

      cy.location('pathname', { timeout: 20000 }).should('include', '/partner/invitations/');
      cy.contains('button', 'Accept invitation').click();
      cy.location('pathname', { timeout: 20000 }).should('eq', `/en/partner/${code}`);
      cy.contains('Cypress Partner School').should('be.visible');
      cy.contains('partner-administrator').should('be.visible');
    });
  });
});
