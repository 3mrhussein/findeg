import { signInToDashboard } from '../../support/actions/dashboard-session.actions';

describe('Dashboard Current Session', () => {
  it('signs in with the seeded staff identity and preserves the Current Session across navigation', () => {
    signInToDashboard();
    cy.contains('h1', /Good morning|Good afternoon|Good evening/i).should('be.visible');
    cy.visit('/en/account');
    cy.location('pathname').should('eq', '/en/account');
    cy.get('input[name="firstName"]').should('have.value', 'Amr');
    cy.reload();
    cy.location('pathname').should('eq', '/en/account');
    cy.getCookie('admin_session').should('exist');
  });

  it('keeps the login form open when required email is missing', () => {
    cy.visit('/en/login');
    cy.get('input[name="password"]').type('password123', { log: false });
    cy.contains('button', 'Sign In').click();
    cy.get('input[name="email"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valueMissing).to.eq(true);
    });
    cy.location('pathname').should('eq', '/en/login');
    cy.getCookie('admin_session').should('not.exist');
  });

  for (const route of ['/en', '/en/account', '/ar/orders']) {
    it(`redirects unauthenticated access to ${route} to localized login`, () => {
      cy.visit(route);
      cy.location('pathname').should('eq', route.startsWith('/ar') ? '/ar/login' : '/en/login');
      cy.contains('Admin Login').should('be.visible');
    });
  }

  it('rejects an invalid Current Session cookie', () => {
    cy.setCookie('admin_session', 'invalid-signature');
    cy.visit('/en/products');
    cy.location('pathname').should('eq', '/en/login');
    cy.contains('Admin Login').should('be.visible');
  });

  it('logs out and denies subsequent protected navigation', () => {
    signInToDashboard();
    cy.contains('button', 'Logout').click();
    cy.location('pathname').should('eq', '/en/login');
    cy.getCookie('admin_session').should('not.exist');
    cy.visit('/en/account');
    cy.location('pathname').should('eq', '/en/login');
  });

  it('submits logout from the header menu and invalidates the Current Session', () => {
    signInToDashboard();
    cy.get('header button[aria-haspopup="menu"]').click();
    cy.contains('[role="menuitem"]', 'Logout').should('have.attr', 'type', 'submit').click();
    cy.location('pathname').should('eq', '/en/login');
    cy.getCookie('admin_session').should('not.exist');
    cy.visit('/en/account');
    cy.location('pathname').should('eq', '/en/login');
  });
});
