import { buildE2EUser } from '../../support/utils/user-factory';

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

  it('rejects acceptance when signed in with an email mismatch', () => {
    cy.task<InvitationFixture>('createPartnerInvitation').then(({ url }) => {
      // Register with a different email first
      const otherUser = buildE2EUser();
      cy.visit('/en/registration');
      cy.get('[data-testid="registration-name-input"]').type(otherUser.fullName);
      cy.get('[data-testid="registration-email-input"]').type(otherUser.email);
      cy.get('[data-testid="registration-password-input"]').type(otherUser.password, { log: false });
      cy.get('[data-testid="registration-confirm-password-input"]').type(otherUser.password, { log: false });
      cy.get('button[type="submit"]').click();
      cy.location('pathname', { timeout: 20000 }).should('not.include', '/registration');

      // Visit the invitation URL with mismatched email
      cy.visit(url);
      cy.contains('p', /invitation is for|هذه الدعوة مخصصة/i).should('be.visible');
      cy.contains('button', /Accept invitation|قبول الدعوة/).should('not.exist');
    });
  });

  it('shows expired status and refuses acceptance for an expired invitation', () => {
    cy.task<InvitationFixture>('createPartnerInvitation', { expired: true }).then(({ url }) => {
      cy.visit(url);
      cy.get('[role="status"]').should('contain.text', 'expired');
      cy.contains('button', /Accept invitation|قبول الدعوة/).should('not.exist');
    });
  });
});
