import { adminSelectors } from '../selectors/admin.selectors';
import { authSelectors } from '../selectors/auth.selectors';
import { localePath } from '../utils/url';
import { resolveCypressEnv } from '../utils/env';
import { API_ROUTES, UI_ROUTES } from '../constants/routes';
import { ADMIN_MESSAGES } from '../constants/messages';
import type { E2EUser } from '../utils/user-factory';

interface AuthApiResponse {
  success?: boolean;
  data?: {
    token?: string;
    user?: {
      id?: number;
    };
  };
}

/**
 *
 */
export function loginAsAdminThroughUi(): void {
  const adminEmail = resolveCypressEnv('ADMIN_EMAIL', 'admin@findeg.com');
  const adminPassword = resolveCypressEnv('ADMIN_PASSWORD', 'admin');

  cy.get(adminSelectors.emailInput).clear().type(adminEmail);
  cy.get(adminSelectors.passwordInput).clear().type(adminPassword, { log: false });
  cy.get(adminSelectors.loginSubmit).contains(ADMIN_MESSAGES.signInButtonRegex).click();
  cy.location('pathname', { timeout: 15000 }).should((pathname) => {
    const localizedAdmin = localePath(UI_ROUTES.admin);
    const localizedAdminLogin = localePath(UI_ROUTES.adminLogin);

    const isAdminArea =
      pathname === UI_ROUTES.admin ||
      pathname.startsWith(`${UI_ROUTES.admin}/`) ||
      pathname.startsWith(localizedAdmin);
    const isAdminLogin =
      pathname === UI_ROUTES.adminLogin || pathname.startsWith(localizedAdminLogin);

    expect(isAdminArea, `expected admin area path, got ${pathname}`).to.eq(true);
    expect(isAdminLogin, `unexpectedly remained on admin login: ${pathname}`).to.eq(false);
  });
}

/**
 *
 */
export function loginAsAdminSession(): void {
  const adminEmail = resolveCypressEnv('ADMIN_EMAIL', 'admin@findeg.com');

  cy.session(
    adminEmail,
    () => {
      cy.visit(localePath(UI_ROUTES.adminLogin));
      loginAsAdminThroughUi();
    },
    {
      /**
       *
       */
      validate() {
        // Simple validation to ensure we're still logged in (cookie check is implicit with session)
        // We could also do a quick visit to a protected page
        cy.visit(localePath(UI_ROUTES.admin));
        cy.location('pathname').should('not.include', 'admin-login');
      },
      cacheAcrossSpecs: true,
    },
  );
}

/**
 *
 */
export function fetchAdminToken(): Cypress.Chainable<string> {
  const adminEmail = resolveCypressEnv('ADMIN_EMAIL', 'admin@findeg.com');
  const adminPassword = resolveCypressEnv('ADMIN_PASSWORD', 'admin');

  return cy
    .request({
      method: 'POST',
      url: API_ROUTES.authLogin,
      body: {
        email: adminEmail,
        password: adminPassword,
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      const token = response.body?.data?.token as string | undefined;
      expect(token, 'admin JWT token').to.be.a('string').and.not.empty;
      return token!;
    });
}

/**
 * Persists user session token in the app auth cookie.
 */
export function setUserSessionCookie(token: string): void {
  cy.setCookie('admin_session', token);
}

/**
 * Registers a non-admin user through API and returns token + user id.
 */
export function registerUserViaApi(
  user: E2EUser,
): Cypress.Chainable<{ token: string; userId: number }> {
  return cy
    .request({
      method: 'POST',
      url: API_ROUTES.authRegister,
      body: {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      failOnStatusCode: false,
    })
    .then((response) => {
      expect(response.status, 'registration status').to.eq(201);
      const body = response.body as AuthApiResponse;
      const token = body?.data?.token;
      const userId = body?.data?.user?.id;

      expect(token, 'user registration token').to.be.a('string').and.not.empty;
      expect(userId, 'registered user id').to.be.a('number');

      return {
        token: token!,
        userId: userId!,
      };
    });
}

/**
 * Registers a non-admin user through registration UI and asserts account redirect.
 */
export function registerUserThroughUi(user: E2EUser): void {
  cy.visit(localePath(UI_ROUTES.registration), { timeout: 120000 });

  cy.get(authSelectors.registrationNameInput).clear().type(user.fullName);
  cy.get(authSelectors.registrationEmailInput).clear().type(user.email);
  cy.get(authSelectors.registrationPasswordInput).clear().type(user.password, { log: false });
  cy.get(authSelectors.registrationConfirmPasswordInput)
    .clear()
    .type(user.password, { log: false });
  cy.get('button[type="submit"]').click();

  cy.location('pathname', { timeout: 20000 }).should('include', localePath(UI_ROUTES.myAccount));
}
