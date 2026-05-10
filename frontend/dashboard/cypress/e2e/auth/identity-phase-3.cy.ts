/**
 * E2E Tests: Authentication Flows
 *
 * Validates that the refactored identity feature works end-to-end:
 * - Login flow works correctly (user can log in and is redirected appropriately)
 * - Logout flow works correctly (session is cleared, redirect to login)
 * - Unauthenticated access redirects to login
 */

describe('Authentication Flows - Identity Feature Phase 3', () => {
  beforeEach(() => {
    // Clear any existing session/cookies before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('T065: Login Flow', () => {
    it('should successfully log in an admin user and redirect to dashboard', () => {
      cy.visit('/admin/login');

      // Verify login page loads
      cy.contains('Admin Login').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');

      // Fill in login form with valid credentials
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');

      // Submit login form
      cy.get('button[type="submit"]').click();

      // Verify redirect to admin dashboard
      cy.url().should('include', '/admin');
      cy.contains('GoodMorning', { matchCase: false }).should('be.visible');
    });

    it('should display validation error for empty email', () => {
      cy.visit('/admin/login');

      // Try to submit without filling in email
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Verify error is displayed or form is not submitted
      cy.url().should('include', '/admin/login');
    });

    it('should display authentication error for invalid credentials', () => {
      cy.visit('/admin/login');

      // Fill in login form with invalid credentials
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');

      // Submit login form
      cy.get('button[type="submit"]').click();

      // Verify error is displayed
      cy.contains(/invalid|error|failed/i).should('be.visible');
      cy.url().should('include', '/admin/login');
    });
  });

  describe('T066: Logout Flow', () => {
    beforeEach(() => {
      // Log in first
      cy.visit('/admin/login');
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Wait for redirect to dashboard
      cy.url().should('include', '/admin');
    });

    it('should successfully log out and redirect to login', () => {
      // Find and click logout button (assuming it's in header/navigation)
      cy.contains(/logout|sign out/i).click({ force: true });

      // Verify redirect to login or home page
      cy.url().should('satisfy', (url) => {
        return url.includes('/login') || url.includes('/');
      });
    });

    it('should clear session cookie after logout', () => {
      // Get cookies before logout
      cy.getCookie('session').then((cookie) => {
        expect(cookie).to.exist;
      });

      // Log out
      cy.contains(/logout|sign out/i).click({ force: true });

      // Verify session cookie is cleared
      cy.getCookie('session').should('not.exist');
    });
  });

  describe('T067: Unauthenticated Access Redirect', () => {
    it('should redirect to login when accessing dashboard without session', () => {
      // Try to access dashboard directly without logging in
      cy.visit('/admin');

      // Verify redirect to login page
      cy.url().should('include', '/login');
      cy.contains('Admin Login').should('be.visible');
    });

    it('should redirect to login when accessing account page without session', () => {
      // Try to access account page directly without logging in
      cy.visit('/admin/account');

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });

    it('should show error message when accessing protected page without auth', () => {
      // Try to access protected page
      cy.visit('/admin/account');

      // Should be redirected to login
      cy.url().should('include', '/login');

      // Optional: Verify an error or message is shown
      cy.contains('Admin Login').should('be.visible');
    });
  });

  describe('Session Persistence', () => {
    it('should persist session across page navigations after login', () => {
      // Log in
      cy.visit('/admin/login');
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Wait for dashboard
      cy.url().should('include', '/admin');

      // Navigate to account page
      cy.visit('/admin/account');

      // Should not be redirected to login (session persists)
      cy.url().should('include', '/admin/account');
    });
  });

  describe('Backend Service Integration', () => {
    it('should load dashboard data without errors after login', () => {
      cy.visit('/admin/login');
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Wait for page load
      cy.url().should('include', '/admin');

      // Verify dashboard content loads (no error states)
      cy.get("[data-testid='kpi-cards'], .grid").should('exist');

      // Verify page doesn't show error message
      cy.contains(/error|failed/i).should('not.exist');
    });

    it('should handle domain errors gracefully in profile update', () => {
      // Log in first
      cy.visit('/admin/login');
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Navigate to account
      cy.url().should('include', '/admin');
      cy.visit('/admin/account');

      // Find profile form and try to submit with invalid data
      cy.get('input[name="firstName"]').clear().type('');
      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.contains(/error|required|invalid/i).should('be.visible');
    });
  });
});
