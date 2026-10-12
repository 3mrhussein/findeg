import type { Id, Locale } from '../common';

export type CustomerId = Id<'Customer'>;

/**
 * A person who shops on the storefront, browsing generally or fulfilling a School Supply List.
 * Partner access comes only from Partner Membership (ADR-0003).
 */
export interface Customer {
  id: CustomerId;
  locale: Locale;
}
