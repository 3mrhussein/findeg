/**
 * Authentication-related constants.
 */
export declare const AUTH_CONSTANTS: {
    readonly JWT_ALGORITHM: "HS256";
    readonly USER_TOKEN_EXPIRY: "7d";
    readonly GUEST_TOKEN_EXPIRY: "30d";
    readonly JWT_SECRET_FALLBACK: "findeg-dev-secret-key";
    readonly GUEST_ID_PREFIX: "guest_";
    readonly GUEST_ROLE: "guest";
};
export declare const AUTH_SUCCESS_MESSAGES: {
    readonly LOGOUT_SUCCESS: "Logged out successfully";
};
