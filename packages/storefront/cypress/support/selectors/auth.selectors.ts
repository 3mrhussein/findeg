export const authSelectors = {
  registrationNameInput: '[data-testid="registration-name-input"]',
  registrationEmailInput: '[data-testid="registration-email-input"]',
  registrationPasswordInput: '[data-testid="registration-password-input"]',
  registrationConfirmPasswordInput: '[data-testid="registration-confirm-password-input"]',
  registrationSubmitLabel: '[data-testid="registration-submit-label"]',
  registrationServerError: '[data-testid="registration-server-error"]',
  switchToSignIn: '[data-testid="switch-to-signin"]',
  switchToSignUp: '[data-testid="switch-to-signup"]',
  loginEmailInput: '[data-testid="login-email-input"]',
  loginPasswordInput: '[data-testid="login-password-input"]',
  loginSubmitLabel: '[data-testid="login-submit-label"]',
  loginServerError: '[data-testid="login-server-error"]',
} as const;
