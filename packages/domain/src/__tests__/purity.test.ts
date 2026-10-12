import { describe, expect, it } from 'vitest';
import manifest from '../../package.json';
import * as domain from '@findeg/domain';

describe('the domain stays a pure leaf', () => {
  it('depends at runtime on zod only', () => {
    expect(Object.keys(manifest.dependencies)).toEqual(['zod']);
    expect(manifest).not.toHaveProperty('peerDependencies');
    expect(manifest).not.toHaveProperty('optionalDependencies');
  });

  it('is published as @findeg/domain', () => {
    expect(manifest.name).toBe('@findeg/domain');
    expect(domain).toBeTypeOf('object');
  });
});
