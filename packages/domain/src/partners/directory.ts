/**
 * Whether a Partner School appears in the Partner School directory (PA-18): only with at least
 * one published School Supply List. Its Business Partner Status is not an input: ADR-0012 keeps
 * the directory the same in every status, closed included, so Staff archive a closed partner's
 * lists when they should stop selling.
 */
export function isListedInPartnerSchoolDirectory(partner: {
  /** The partner's published School Supply Lists. */
  publishedLists: number;
}): boolean {
  return partner.publishedLists >= 1;
}
