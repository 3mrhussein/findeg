// PROTOTYPE: exercise actual schema decoders and transaction contracts, then roll back.
import assert from 'node:assert/strict';
import { eq, sql } from 'drizzle-orm';
import { db, connection } from '../src/connection';
import { orders } from '../src/schema';
import { mapOrderRow } from '../src/mapping';

const instant = new Date('2026-10-24T12:34:56.123Z');
const rollback = new Error('PROTOTYPE intentional outer rollback');
const reference = 'FE-PG0001';
const underlying = (error: unknown): { code?: string; constraint_name?: string } => {
  if (error instanceof Error && error.cause) return underlying(error.cause);
  return error as { code?: string; constraint_name?: string };
};

try {
  await assert.rejects(
    db.transaction(async (tx) => {
      const [stored] = await tx
        .insert(orders)
        .values({
          orderReference: reference,
          subtotal: '0.30',
          totalAmount: '0.30',
          createdAt: instant,
        })
        .returning();
      const [loaded] = await tx.select().from(orders).where(eq(orders.id, stored.id));
      assert.equal(loaded.createdAt.toISOString(), instant.toISOString());
      assert.equal(loaded.subtotal, '0.30');
      assert.equal(mapOrderRow(loaded).subtotal, 30n);
      await assert.rejects(
        tx.transaction(async (savepoint) => {
          await savepoint.insert(orders).values({ orderReference: reference, totalAmount: '0.30' });
        }),
        (error) => {
          const detail = underlying(error);
          return detail.code === '23505' && detail.constraint_name === 'uq_orders_order_reference';
        },
      );
      await assert.rejects(
        tx.transaction(async (savepoint) => {
          await savepoint.update(orders).set({ subtotal: '0.31' }).where(eq(orders.id, stored.id));
        }),
        (error) => underlying(error).code === '23514',
      );
      const [{ usable }] = await tx.execute(sql`select 1 as usable`);
      assert.equal(usable, 1);
      throw rollback;
    }),
    (error) => error === rollback,
  );
  assert.equal(
    (await db.select().from(orders).where(eq(orders.orderReference, reference))).length,
    0,
  );
  const columns = await db.execute(sql`
    select table_schema as schema, table_name as "table", column_name as "column",
      pg_get_serial_sequence(format('%I.%I', table_schema, table_name), column_name) as sequence
    from information_schema.columns
    where table_schema in ('identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system')`);
  let sequences = 0;
  for (const column of columns) {
    if (!column.sequence) continue;
    const [{ maximum }] = await db.execute(sql`
      select max(${sql.identifier(String(column.column))}) as maximum
      from ${sql.identifier(String(column.schema))}.${sql.identifier(String(column.table))}`);
    const [{ next }] = await db.execute(
      sql`select nextval(${column.sequence}::regclass)::int as next`,
    );
    assert.ok(Number(next) > Number(maximum ?? 0));
    if (maximum === null) assert.equal(next, 1);
    sequences++;
  }
  assert.ok(sequences > 20);
  console.log(
    JSON.stringify({
      schemaDate: true,
      canonicalMoney: '30n',
      uniqueConstraint: true,
      frozenSnapshot: true,
      savepoints: true,
      outerRollback: true,
    }),
  );
} finally {
  await connection.end({ timeout: 1 });
}
