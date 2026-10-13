import {
  signInToDashboard,
  signInToDashboardAsReadOnlyStaff,
} from '../../support/actions/dashboard-session.actions';

describe('Dashboard Current Session and Permission Guards', () => {
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

  it('shows translated error on login failure in English and Arabic', () => {
    // English
    cy.visit('/en/login');
    cy.get('input[name="email"]').type('admin@findeg.com');
    cy.get('input[name="password"]').type('wrongpassword', { log: false });
    cy.contains('button', 'Sign In').click();
    cy.get('[role="alert"]').should('be.visible').and('contain.text', 'Invalid email or password');

    // Arabic
    cy.visit('/ar/login');
    cy.get('input[name="email"]').type('admin@findeg.com');
    cy.get('input[name="password"]').type('wrongpassword', { log: false });
    cy.contains('button', 'تسجيل الدخول').click();
    cy.get('[role="alert"]')
      .should('be.visible')
      .and('contain.text', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
  });

  for (const route of ['/en', '/en/account', '/ar/orders']) {
    it(`redirects unauthenticated access to ${route} to localized login`, () => {
      cy.visit(route);
      cy.location('pathname').should('eq', route.startsWith('/ar') ? '/ar/login' : '/en/login');
      cy.contains(/Admin Login|تسجيل دخول المشرف/).should('be.visible');
    });
  }

  it('rejects an invalid Current Session cookie', () => {
    cy.setCookie('admin_session', 'invalid-signature');
    cy.visit('/en/products');
    cy.location('pathname').should('eq', '/en/login');
    cy.contains('Admin Login').should('be.visible');
  });

  it('submits logout from the header dropdown and invalidates the Current Session', () => {
    signInToDashboard();
    cy.get('header button[aria-haspopup="menu"]').click();
    cy.contains('[role="menuitem"]', 'Logout')
      .should('be.visible')
      .and('have.attr', 'type', 'submit')
      .click();
    cy.location('pathname').should('eq', '/en/login');
    cy.getCookie('admin_session').should('not.exist');
    cy.visit('/en/account');
    cy.location('pathname').should('eq', '/en/login');
  });

  it('logs out and denies subsequent protected navigation', () => {
    signInToDashboard();
    cy.contains('button', 'Logout').click();
    cy.location('pathname').should('eq', '/en/login');
    cy.getCookie('admin_session').should('not.exist');
    cy.visit('/en/account');
    cy.location('pathname').should('eq', '/en/login');
  });

  describe('Sidebar entries for two different permission sets', () => {
    it('shows full sidebar for system administrator and excludes removed screens', () => {
      signInToDashboard();

      // Working screens present
      cy.get('aside a[href*="/products"]').should('exist');
      cy.get('aside a[href*="/categories"]').should('exist');
      cy.get('aside a[href*="/brands"]').should('exist');
      cy.get('aside a[href*="/orders"]').should('exist');
      cy.get('aside a[href*="/inventory"]').should('exist');
      cy.get('aside a[href*="/school-lists"]').should('exist');
      cy.get('aside a[href*="/partners"]').should('exist');
      cy.get('aside a[href*="/audit-log"]').should('exist');

      // Removed screens and badges are NOT present
      cy.get('aside a[href*="/media"]').should('not.exist');
      cy.get('aside a[href*="/editorial/search-analytics"]').should('not.exist');
      cy.get('aside a[href*="/notifications"]').should('not.exist');
      cy.get('aside a[href*="/users/roles"]').should('not.exist');
      cy.contains('WebMCP').should('not.exist');
    });

    it('shows restricted sidebar for read-only Customer Support role', () => {
      signInToDashboardAsReadOnlyStaff();

      // Accessible screens
      cy.get('aside a[href*="/products"]').should('exist');
      cy.get('aside a[href*="/orders"]').should('exist');

      // Screens requiring permissions support staff lacks
      cy.get('aside a[href*="/categories"]').should('not.exist');
      cy.get('aside a[href*="/brands"]').should('not.exist');
      cy.get('aside a[href*="/inventory"]').should('not.exist');
      cy.get('aside a[href*="/school-lists"]').should('not.exist');
      cy.get('aside a[href*="/partners"]').should('not.exist');
      cy.get('aside a[href*="/audit-log"]').should('not.exist');
    });
  });

  describe('Permission gating and removed routes', () => {
    it('redirects unauthorized Customer Support direct URL navigation to home', () => {
      signInToDashboardAsReadOnlyStaff();

      cy.visit('/en/inventory');
      cy.location('pathname').should('eq', '/en');

      cy.visit('/en/categories');
      cy.location('pathname').should('eq', '/en');

      cy.visit('/en/partners');
      cy.location('pathname').should('eq', '/en');

      cy.visit('/en/audit-log');
      cy.location('pathname').should('eq', '/en');
    });

    it('returns 404 for removed routes', () => {
      signInToDashboard();

      cy.request({ url: '/en/media', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });

      cy.request({ url: '/en/editorial/search-analytics', failOnStatusCode: false }).then(
        (response) => {
          expect(response.status).to.eq(404);
        },
      );

      cy.request({ url: '/en/notifications', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
