import { ShippingAddressSchema } from '@findeg/db/types';
import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  PORTAL_ROLE_VALUES,
  ACTOR_TYPE_VALUES,
} from '@findeg/db/types/enum-values';
import { expect, it } from 'vitest';
import { PgDialect, getTableConfig } from 'drizzle-orm/pg-core';
import { ORDER_REFERENCE_PATTERN, orderReference } from '@findeg/domain';
import {
  orders,
  generateOrderReference,
  businessPartners,
  partnerInvitations,
  partnerMemberships,
  schoolSupplyLists,
  schoolSupplyListItems,
  listOffers,
  outbox,
} from '../schema';

it('database Order References use the domain format', () => {
  for (let i = 0; i < 32; i += 1) {
    const reference = generateOrderReference();
    expect(reference).toMatch(ORDER_REFERENCE_PATTERN);
    expect(orderReference(reference)).toBe(reference);
  }
});

it('domain-derived CHECKs retain the existing PostgreSQL SQL including the list status constraint', () => {
  const dialect = new PgDialect();
  const checks = [
    orders,
    businessPartners,
    partnerInvitations,
    partnerMemberships,
    schoolSupplyLists,
    schoolSupplyListItems,
    listOffers,
    outbox,
  ]
    .flatMap((table) => getTableConfig(table).checks)
    .map((check) => [check.name, dialect.sqlToQuery(check.value).sql]);
  expect(Object.fromEntries(checks)).toMatchObject({
    ck_orders_order_reference:
      '"sales"."orders"."order_reference" ~ \'^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$\'',
    ck_business_partners_status:
      "\"identity\".\"business_partners\".\"status\" in ('onboarding', 'active', 'suspended', 'closed')",
    ck_partner_invitations_status:
      '"identity"."partner_invitations"."status" in (\'pending\', \'accepted\', \'revoked\')',
    ck_partner_memberships_status:
      '"identity"."partner_memberships"."status" in (\'active\', \'suspended\', \'ended\')',
    ck_supply_list_status:
      '"school_engine"."school_supply_lists"."status" in (\'draft\', \'published\', \'archived\')',
    ck_supply_list_item_quantity:
      '"school_engine"."school_supply_list_items"."quantity" between 1 and 999',
    ck_list_offers_basis_points: '"sales"."list_offers"."basis_points" between 0 and 10000',
    ck_outbox_status:
      "\"system\".\"outbox\".\"status\" in ('pending', 'processing', 'delivered', 'exhausted', 'expired')",
  });
});

it('retains the browser-safe legacy value import path until consumer migration', () => {
  expect(ORDER_STATUS_VALUES).toEqual([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]);
  expect(PAYMENT_STATUS_VALUES).toEqual(['unpaid', 'paid', 'refunded']);
  expect(PAYMENT_METHOD_VALUES).toEqual(['cod', 'card']);
  expect(PORTAL_ROLE_VALUES).toEqual(['customer', 'staff']);
  expect(ACTOR_TYPE_VALUES).toEqual(['guest', 'user', 'service']);
});

it('accepts Egyptian mobile forms from the domain and rejects the old doubled zero prefix', () => {
  expect(ShippingAddressSchema.shape.phone.safeParse('01012345678').success).toBe(true);
  expect(ShippingAddressSchema.shape.phone.safeParse('+201012345678').success).toBe(true);
  expect(ShippingAddressSchema.shape.phone.safeParse('+2001012345678').success).toBe(false);
});
