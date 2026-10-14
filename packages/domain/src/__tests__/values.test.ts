import { describe, expect, it } from 'vitest';
import * as schema from '@findeg/domain';

/**
 * Pinned domain values. A change here is a business decision: update GLOSSARY.md and the
 * related ADR in the same change, then update these expectations.
 */
describe('pinned business values', () => {
  it('orders', () => {
    expect(schema.ORDER_STATUSES).toEqual([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ]);
    expect(schema.PAYMENT_STATUSES).toEqual(['unpaid', 'paid', 'refunded']);
    expect(schema.PAYMENT_METHOD_TYPES).toEqual(['cod', 'card']);
    expect(schema.ACCEPTED_PAYMENT_TYPES).toEqual(['cod']);
  });

  it('partners', () => {
    expect(schema.BUSINESS_PARTNER_STATUSES).toEqual([
      'onboarding',
      'active',
      'suspended',
      'closed',
    ]);
    expect(schema.PARTNER_MEMBERSHIP_STATUSES).toEqual(['active', 'suspended', 'ended']);
    expect(schema.PARTNER_ROLES).toEqual([
      'partner-administrator',
      'list-manager',
      'collection-staff',
      'report-viewer',
    ]);
    expect(schema.PARTNER_INVITATION_VALID_DAYS).toBe(7);
  });

  it('school supply lists and partner schools', () => {
    expect(schema.SUPPLY_LIST_STATUSES).toEqual(['draft', 'published', 'archived']);
    expect(schema.PUBLIC_SUPPLY_LIST_STATUSES).toEqual(['published', 'archived']);
    expect(schema.SCHOOL_TYPES).toHaveLength(5);
    expect(schema.ACADEMIC_SYSTEMS).toHaveLength(8);
  });

  it('money, locale and offers', () => {
    expect(schema.DEFAULT_CURRENCY).toBe('EGP');
    expect(schema.LOCALES).toEqual(['en', 'ar']);
    expect(schema.LIST_OFFER_MAX_BASIS_POINTS).toBe(10000);
  });
});

describe('transition tables', () => {
  const statuses = schema.ORDER_STATUSES as readonly string[];

  it.each([
    ['order', schema.ORDER_STATUS_TRANSITIONS],
    ['payment', schema.PAYMENT_STATUS_TRANSITIONS],
    ['supply list', schema.SUPPLY_LIST_STATUS_TRANSITIONS],
    ['partner', schema.BUSINESS_PARTNER_STATUS_TRANSITIONS],
    ['membership', schema.PARTNER_MEMBERSHIP_STATUS_TRANSITIONS],
    ['invitation', schema.PARTNER_INVITATION_STATUS_TRANSITIONS],
  ])('%s targets are declared statuses', (_name, table) => {
    const known = Object.keys(table);
    for (const targets of Object.values(table)) {
      for (const target of targets) expect(known).toContain(target);
    }
  });

  it('order status table covers every status', () => {
    expect(Object.keys(schema.ORDER_STATUS_TRANSITIONS).sort()).toEqual([...statuses].sort());
  });

  it('terminal statuses have no outgoing moves', () => {
    expect(schema.ORDER_STATUS_TRANSITIONS.cancelled).toEqual([]);
    expect(schema.ORDER_STATUS_TRANSITIONS.refunded).toEqual([]);
    expect(schema.PAYMENT_STATUS_TRANSITIONS.refunded).toEqual([]);
    expect(schema.SUPPLY_LIST_STATUS_TRANSITIONS.archived).toEqual([]);
    expect(schema.BUSINESS_PARTNER_STATUS_TRANSITIONS.closed).toEqual([]);
    expect(schema.PARTNER_MEMBERSHIP_STATUS_TRANSITIONS.ended).toEqual([]);
    expect(schema.PARTNER_INVITATION_STATUS_TRANSITIONS.accepted).toEqual([]);
  });

  it('a refund follows only delivery (cash on delivery, ADR-0005)', () => {
    const sources = Object.entries(schema.ORDER_STATUS_TRANSITIONS)
      .filter(([, targets]) => targets.includes('refunded'))
      .map(([from]) => from);
    expect(sources).toEqual(['delivered']);
  });
});

describe('order reference', () => {
  it('accepts the ADR example and rejects excluded or wrong-length codes', () => {
    expect(schema.ORDER_REFERENCE_PATTERN.test('FE-7K3Q9M')).toBe(true);
    expect(schema.ORDER_REFERENCE_PATTERN.test('FE-7K3Q9I')).toBe(false); // I is excluded
    expect(schema.ORDER_REFERENCE_PATTERN.test('FE-7K3Q9')).toBe(false);
  });
});

describe('public list projection', () => {
  it('is a subset of the list statuses and never includes draft', () => {
    for (const status of schema.PUBLIC_SUPPLY_LIST_STATUSES) {
      expect(schema.SUPPLY_LIST_STATUSES).toContain(status);
    }
    expect(schema.PUBLIC_SUPPLY_LIST_STATUSES).not.toContain('draft');
  });
});

describe('payment options', () => {
  it('only cash on delivery is accepted; card is defined but not allowed', () => {
    expect(schema.PAYMENT_OPTIONS).toEqual([
      { type: 'cod', allowed: true },
      { type: 'card', allowed: false },
    ]);
  });
});

describe('common values', () => {
  it('lists the 27 governorates of Egypt in the common area', async () => {
    const common = await import('@findeg/domain');
    expect(common.GOVERNORATES).toHaveLength(27);
    expect(new Set(common.GOVERNORATES).size).toBe(27);
    expect(common.GOVERNORATES).toContain('Cairo');
    expect(common.GOVERNORATES).toContain('Kafr El Sheikh');
  });
});

describe('only business domain is exported', () => {
  it.each([
    ['the Outbox', 'OUTBOX_STATUSES'],
    ['portal roles', 'PORTAL_ROLES'],
    ['the money unit constant (Money owns it)', 'PIASTERS_PER_POUND'],
  ])('%s is gone', (_name, exported) => {
    expect(schema).not.toHaveProperty(exported);
  });

  it('the Outbox area has no entry', async () => {
    await expect(import(/* @vite-ignore */ '@findeg/domain/' + 'outbox')).rejects.toThrow();
  });

  it('non-domain entities are not on the map', () => {
    for (const entity of ['OutboxMessage', 'GuestOrderAccess', 'PartnerReport']) {
      expect(Object.keys(schema.ENTITY_DOMAINS)).not.toContain(entity);
    }
  });
});
