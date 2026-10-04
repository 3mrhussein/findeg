import type { PartnerStatus } from '@findeg/db/schema';

/** What a lifecycle operation does to the owning Business Partner's lists. */
export type ListAuthoringAction = 'edit-draft' | 'publish';

/**
 * Which Business Partner statuses allow each list authoring action (ADR-0012).
 * `publish` covers replacement; `edit-draft` covers creating, cloning and
 * editing a draft. Archiving and reading never depend on the status, and nothing
 * Customer-facing does either.
 */
const ALLOWED_STATUSES: Record<ListAuthoringAction, readonly PartnerStatus[]> = {
  publish: ['onboarding', 'active'],
  'edit-draft': ['onboarding', 'active', 'suspended'],
};

export function partnerStatusAllows(status: PartnerStatus, action: ListAuthoringAction): boolean {
  return ALLOWED_STATUSES[action].includes(status);
}
