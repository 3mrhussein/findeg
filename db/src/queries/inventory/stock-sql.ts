import { sql, type SQLWrapper } from 'drizzle-orm';

/** Persistence equivalent of domain availability, usable with tables or SQL aliases. */
export function sellableUnitsSql(onHand: SQLWrapper, reserved: SQLWrapper, isActive: SQLWrapper) {
  return sql<number>`case when ${isActive} = true then greatest(coalesce(${onHand}, 0) - coalesce(${reserved}, 0), 0) else 0 end`;
}
