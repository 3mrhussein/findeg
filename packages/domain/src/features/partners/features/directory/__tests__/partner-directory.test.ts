import { describe, expect, it } from 'vitest';
import { isListedInPartnerSchoolDirectory } from '@findeg/domain';

describe('Partner School directory', () => {
  // Rule change (spec #402, story 45): today the directory lists a school without a published
  // list unless the Storefront asks for `withPublishedLists`.
  it('change: a partner with no published list is not listed', () => {
    expect(isListedInPartnerSchoolDirectory({ publishedLists: 0 })).toBe(false);
  });

  // ADR-0012: the directory behaves the same in every partner status, so status is no input.
  it('a partner with a published list is listed', () => {
    expect(isListedInPartnerSchoolDirectory({ publishedLists: 1 })).toBe(true);
    expect(isListedInPartnerSchoolDirectory({ publishedLists: 4 })).toBe(true);
  });
});
