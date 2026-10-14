import { describe, expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db';
import { canReadSupplyLists, canWriteSupplyLists } from '../index';

const staff = (permissionCodes: string[] = []) => ({
  kind: 'staff' as const,
  userId: 1,
  permissionCodes,
});

describe('school list permissions', () => {
  it('lets a Staff member with write permission read and write', () => {
    const actor = staff([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE]);
    expect(canWriteSupplyLists(actor)).toBe(true);
    expect(canReadSupplyLists(actor)).toBe(true);
  });

  it('lets a read-only Staff member read but not write', () => {
    const actor = staff([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ]);
    expect(canReadSupplyLists(actor)).toBe(true);
    expect(canWriteSupplyLists(actor)).toBe(false);
  });

  it('refuses actors without Staff kind or permissions', () => {
    expect(canReadSupplyLists({ kind: 'partner' } as never)).toBe(false);
    expect(canWriteSupplyLists(staff([]))).toBe(false);
  });
});
