import { describe, expect, it } from 'vitest';
import {
  BUSINESS_PARTNER_STATUSES,
  isListedInPartnerSchoolDirectory,
} from '@findeg/domain/partners';

describe('Partner School directory', () => {
  // Rule change (spec #402, story 45): today the directory lists a school without a published
  // list unless the Storefront asks for `withPublishedLists`.
  it.each(BUSINESS_PARTNER_STATUSES)(
    'change: a %s partner with no published list is not listed',
    (status) => {
      expect(isListedInPartnerSchoolDirectory({ status, publishedLists: 0 })).toBe(false);
    },
  );

  // ADR-0012: the partner status never filters the directory.
  it.each(BUSINESS_PARTNER_STATUSES)('a %s partner with a published list is listed', (status) => {
    expect(isListedInPartnerSchoolDirectory({ status, publishedLists: 1 })).toBe(true);
    expect(isListedInPartnerSchoolDirectory({ status, publishedLists: 4 })).toBe(true);
  });
});
