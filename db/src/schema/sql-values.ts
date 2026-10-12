import { sql } from 'drizzle-orm';

/** Trusted schema constants only; never interpolate user input. */
export const inList = (values: readonly string[]) =>
  sql.raw(values.map((value) => `'${value.replaceAll("'", "''")}'`).join(', '));
export const sqlLiteral = (value: string | number) =>
  typeof value === 'number' ? sql.raw(String(value)) : inList([value]);
