/** Identity-owned user-facing auth messages. Error definitions are consumed by the shared error catalog. */
export const AUTH_SUCCESS_MESSAGES = {
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;

export const AUTH_ERROR_CATALOG = {
  AUTH_INVALID_CREDENTIALS: {
    message: 'Invalid email or password.',
    httpStatus: 401,
  },
  AUTH_ACCOUNT_NO_PASSWORD: {
    message: 'Account has no password set.',
    httpStatus: 401,
  },
  AUTH_EMAIL_ALREADY_REGISTERED: {
    message: 'Email already registered.',
    httpStatus: 409,
  },
  AUTH_REGISTER_FAILED: {
    message: 'Registration failed.',
    httpStatus: 500,
  },
} as const;
