/** Browser-safe Identity & Access vocabulary. Credentials never belong in Current Session. */
export type Portal = 'storefront' | 'partner' | 'back-office';
export type StaffRole =
  'access-administrator' | 'catalog-manager' | 'fulfillment-operator' | 'finance-manager';
export type StaffPermission =
  | 'back-office.enter'
  | 'staff-access.manage'
  | 'catalog.manage'
  | 'fulfillment.manage'
  | 'finance.manage';
export interface CurrentSession {
  readonly userId: number;
  readonly email: string;
  readonly activePortal: Portal;
  readonly authorizationVersion: number;
  readonly staffRoles: readonly StaffRole[];
  readonly permissions: readonly StaffPermission[];
}
export type SessionResolution =
  | { readonly status: 'authenticated'; readonly session: CurrentSession }
  | { readonly status: 'authentication-required' }
  | { readonly status: 'authorization-denied'; readonly session: CurrentSession };
