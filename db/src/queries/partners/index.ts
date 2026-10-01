import { asc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../schema';

/**
 * Partner Membership queries.
 *
 * Unlike most query modules these never import `connection.ts`: callers pass the
 * executor (a database or an open transaction), so the module is usable with any
 * connection, including the integration-test database.
 */

export type PartnerDatabase = PostgresJsDatabase<typeof schema>;
export type PartnerTransaction = Parameters<Parameters<PartnerDatabase['transaction']>[0]>[0];
export type PartnerExecutor = PartnerDatabase | PartnerTransaction;

const { businessPartners, partnerAccessHistory } = schema;

export type BusinessPartnerRow = typeof businessPartners.$inferSelect;
export type NewBusinessPartnerRow = Pick<
  typeof businessPartners.$inferInsert,
  'code' | 'nameEn' | 'nameAr'
>;
export type BusinessPartnerPatch = Partial<Pick<BusinessPartnerRow, 'code' | 'nameEn' | 'nameAr'>>;
export type NewPartnerAccessHistoryRow = typeof partnerAccessHistory.$inferInsert;

const BUSINESS_PARTNER_CODE_CONSTRAINT = 'business_partners_code_unique';

/** True when `error` is the unique-violation on `business_partners.code`. */
export function isPartnerCodeTakenError(error: unknown): boolean {
  for (let current = error; current && typeof current === 'object';) {
    const { code, constraint_name, cause } = current as {
      code?: string;
      constraint_name?: string;
      cause?: unknown;
    };
    if (code === '23505' && constraint_name === BUSINESS_PARTNER_CODE_CONSTRAINT) return true;
    current = cause;
  }
  return false;
}

export async function listBusinessPartners(executor: PartnerExecutor) {
  return executor.select().from(businessPartners).orderBy(asc(businessPartners.code));
}

export async function getBusinessPartnerById(
  executor: PartnerExecutor,
  id: number,
): Promise<BusinessPartnerRow | undefined> {
  const [row] = await executor.select().from(businessPartners).where(eq(businessPartners.id, id));
  return row;
}

/** Locks the row (`SELECT … FOR UPDATE`) so changes to one partner run one at a time. */
export async function lockBusinessPartnerById(
  executor: PartnerTransaction,
  id: number,
): Promise<BusinessPartnerRow | undefined> {
  const [row] = await executor
    .select()
    .from(businessPartners)
    .where(eq(businessPartners.id, id))
    .for('update');
  return row;
}

export async function insertBusinessPartner(
  executor: PartnerTransaction,
  values: NewBusinessPartnerRow,
): Promise<BusinessPartnerRow> {
  const [row] = await executor.insert(businessPartners).values(values).returning();
  return row;
}

export async function updateBusinessPartner(
  executor: PartnerTransaction,
  id: number,
  patch: BusinessPartnerPatch,
): Promise<BusinessPartnerRow> {
  const [row] = await executor
    .update(businessPartners)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(businessPartners.id, id))
    .returning();
  return row;
}

export async function insertPartnerAccessHistory(
  executor: PartnerTransaction,
  row: NewPartnerAccessHistoryRow,
): Promise<void> {
  await executor.insert(partnerAccessHistory).values(row);
}
