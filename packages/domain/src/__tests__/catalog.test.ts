import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import { sku } from '@findeg/domain/catalog';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

describe('SKU', () => {
  it.each(['PEN-BLUE-01', 'a', 'any format at all', 'قلم-1'])('accepts %j as written', (text) => {
    expect(sku(text)).toBe(text);
  });

  it.each(['', '   ', ' PEN-1', 'PEN-1 ', '\tPEN-1\n'])('refuses blank or padded %j', (text) => {
    expect(codeOf(() => sku(text))).toBe('INVALID_SKU');
  });
});
