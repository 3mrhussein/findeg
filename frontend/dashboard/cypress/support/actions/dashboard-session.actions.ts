/** Sign in through the production dashboard using configured seeded credentials. */
export function signInToDashboard(): void {
  cy.visit('/en/login');
  cy.env(['ADMIN_EMAIL', 'ADMIN_PASSWORD'], { log: false }).then(
    ({ ADMIN_EMAIL, ADMIN_PASSWORD }) => {
      cy.get('input[name="email"]').type(ADMIN_EMAIL);
      cy.get('input[name="password"]').type(ADMIN_PASSWORD, { log: false });
    },
  );
  cy.contains('button', 'Sign In').click();
  cy.location('pathname', { timeout: 20000 }).should('eq', '/en');
  cy.getCookie('admin_session').should('exist');
}

/**
 * Sign in as a seeded Staff member who can read Orders but not write them
 * (the Customer Support role). Seeded Staff share the seeded default password.
 */
export function signInToDashboardAsReadOnlyStaff(): void {
  cy.visit('/en/login');
  cy.env(['ADMIN_PASSWORD'], { log: false }).then(({ ADMIN_PASSWORD }) => {
    cy.get('input[name="email"]').type('support@findeg.com');
    cy.get('input[name="password"]').type(ADMIN_PASSWORD, { log: false });
  });
  cy.contains('button', 'Sign In').click();
  cy.location('pathname', { timeout: 20000 }).should('eq', '/en');
  cy.getCookie('admin_session').should('exist');
}
