import { describe, expect, it } from 'vitest';
import permissions from '../../seeds/data/permissions.json';
import { PERMISSION_CODES, PermissionCodeSchema } from '../types/identity';

const seedCodes = permissions.map(({ code }) => code);

describe('Permission codes', () => {
  it.each(seedCodes)('seed permission code %s matches PermissionCodeSchema', (code) => {
    expect(PermissionCodeSchema.safeParse(code).success).toBe(true);
  });

  it.each(Object.entries(PERMISSION_CODES))(
    'PERMISSION_CODES.%s (%s) matches PermissionCodeSchema',
    (_key, code) => {
      expect(PermissionCodeSchema.safeParse(code).success).toBe(true);
    },
  );

  it('seeds each permission code exactly once', () => {
    const duplicates = seedCodes.filter((code, index) => seedCodes.indexOf(code) !== index);
    expect(duplicates).toEqual([]);
  });
});
