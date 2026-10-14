import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import { egyptianMobile, guestBuyer, shippingAddress } from '@findeg/domain';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

describe('Egyptian mobile phone', () => {
  it.each(['01012345678', '01112345678', '01212345678', '01512345678'])(
    'accepts the local mobile %s',
    (phone) => {
      expect(egyptianMobile(phone)).toBe(phone);
    },
  );

  it('change: accepts the international form +2010…, which the old pattern rejected', () => {
    expect(egyptianMobile('+201012345678')).toBe('+201012345678');
    expect(egyptianMobile('+201512345678')).toBe('+201512345678');
  });

  it('change: rejects +2001…, which the old pattern accepted', () => {
    expect(codeOf(() => egyptianMobile('+2001012345678'))).toBe('INVALID_PHONE');
  });

  it.each([
    ['an unknown operator', '01312345678'],
    ['a short number', '0101234567'],
    ['a long number', '010123456789'],
    ['a short international number', '+20101234567'],
    ['a country code without +', '201012345678'],
    ['padding', ' 01012345678'],
    ['a landline', '0223456789'],
    ['nothing', ''],
  ])('rejects %s', (_name, phone) => {
    expect(codeOf(() => egyptianMobile(phone))).toBe('INVALID_PHONE');
  });
});

describe('shipping address', () => {
  const address = {
    fullName: 'Mona Adel',
    governorate: 'Giza',
    city: 'Sheikh Zayed',
    area: 'District 9',
    street: 'Street 12',
  };

  it('accepts an address in one of the 27 governorates, with optional details', () => {
    expect(shippingAddress(address)).toEqual(address);
    const detailed = { ...address, building: '4', floor: '2', apartment: '7', notes: 'Ring twice' };
    expect(shippingAddress(detailed)).toEqual(detailed);
  });

  it('change: needs a governorate, one of the 27', () => {
    const withoutGovernorate = { ...address, governorate: undefined };
    expect(codeOf(() => shippingAddress(withoutGovernorate as never))).toBe(
      'INVALID_SHIPPING_ADDRESS',
    );
    expect(codeOf(() => shippingAddress({ ...address, governorate: 'Atlantis' }))).toBe(
      'INVALID_SHIPPING_ADDRESS',
    );
  });

  // Today's checkout address rule: name, city, area and street of at least two characters.
  it.each(['fullName', 'city', 'area', 'street'] as const)(
    'needs a %s of at least two characters',
    (field) => {
      expect(codeOf(() => shippingAddress({ ...address, [field]: 'A' }))).toBe(
        'INVALID_SHIPPING_ADDRESS',
      );
    },
  );
});

describe('guest buyer', () => {
  it('is a guest with an email', () => {
    expect(guestBuyer('mona@example.com')).toEqual({ kind: 'guest', email: 'mona@example.com' });
  });

  // Ported from checkout, which trims and lower-cases a guest's email.
  it('trims and lower-cases the email', () => {
    expect(guestBuyer('  Mona@Example.COM ')).toEqual({ kind: 'guest', email: 'mona@example.com' });
  });

  it.each([[''], ['   '], ['not-an-email'], ['mona@']])(
    'change: a guest always has a valid email (refuses %j)',
    (email) => {
      expect(codeOf(() => guestBuyer(email))).toBe('INVALID_GUEST_EMAIL');
    },
  );
});
