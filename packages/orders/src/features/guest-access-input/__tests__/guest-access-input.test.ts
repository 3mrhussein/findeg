import { describe, expect, it } from 'vitest';
import {
  GuestAccessRequestSchema as guestAccessRequestSchema,
  GuestAccessVerifySchema as guestAccessVerifySchema,
} from '../index';

describe('guest access input', () => {
  it('trims the reference and requires a well-formed email to request access', () => {
    const parsed = guestAccessRequestSchema.safeParse({
      reference: '  FE-1001 ',
      email: 'guest@example.com',
    });
    expect(parsed.success && parsed.data.reference).toBe('FE-1001');
    expect(
      guestAccessRequestSchema.safeParse({ reference: 'FE-1', email: 'not-an-email' }).success,
    ).toBe(false);
  });

  it('accepts only a six-digit code to verify access', () => {
    expect(guestAccessVerifySchema.safeParse({ reference: 'FE-1', code: '004821' }).success).toBe(
      true,
    );
    expect(guestAccessVerifySchema.safeParse({ reference: 'FE-1', code: '12345' }).success).toBe(
      false,
    );
    expect(guestAccessVerifySchema.safeParse({ reference: 'FE-1', code: 'abcdef' }).success).toBe(
      false,
    );
  });
});
