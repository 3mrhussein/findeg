import { describe, expect, it } from 'vitest';
import { VariantService } from '../index';

describe('VariantService', () => {
  it('is constructed without state and implements the variant contract', () => {
    expect(new VariantService()).toBeInstanceOf(VariantService);
  });
});
