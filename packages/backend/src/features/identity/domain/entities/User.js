/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */
/**
 * Derives a full name from a user's `firstName` and `lastName`.
 * Falls back to an empty string if neither is provided.
 */
export const getUserFullName = (user) => {
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
};
