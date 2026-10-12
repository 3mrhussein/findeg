import type { BusinessPartnerStatus } from './model';

/**
 * Whether a Partner School appears in the Partner School directory: only with at least one
 * published School Supply List. Its status never matters (ADR-0012).
 */
export function isListedInPartnerSchoolDirectory(partner: {
  status: BusinessPartnerStatus;
  /** The partner's published School Supply Lists. */
  publishedLists: number;
}): boolean {
  return partner.publishedLists >= 1;
}
