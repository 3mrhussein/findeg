/**
 * Authentication-related constants.
 */
export const AUTH_CONSTANTS = {
    JWT_ALGORITHM: "HS256",
    USER_TOKEN_EXPIRY: "7d",
    GUEST_TOKEN_EXPIRY: "30d",
    JWT_SECRET_FALLBACK: "findeg-dev-secret-key",
    GUEST_ID_PREFIX: "guest_",
    GUEST_ROLE: "guest",
};
export const AUTH_SUCCESS_MESSAGES = {
    LOGOUT_SUCCESS: "Logged out successfully",
};
