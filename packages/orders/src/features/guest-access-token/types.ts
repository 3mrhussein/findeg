/**
 * Signs and verifies the token that unlocks one Order for a guest. Backend infrastructure supplies
 * the implementation (JWT with the configured secret); verification returns the Order Reference
 * the token names, or null when it is missing, forged, expired or fails closed.
 */
export interface GuestAccessTokens {
  sign(orderReference: string): Promise<string>;
  verify(token: string | undefined): Promise<string | null>;
}
