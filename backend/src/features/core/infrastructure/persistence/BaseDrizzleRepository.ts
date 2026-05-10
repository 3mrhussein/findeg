import { db } from '@findeg/db/connection';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { PgTable, AnyPgColumn, TableConfig } from 'drizzle-orm/pg-core';

/**
 * Base Drizzle Repository
 *
 * Provides generic CRUD operations and standardizes repository behavior.
 * Reduces boilerplate across all feature-based repositories.
 *
 * @template TTable - The Drizzle table model
 * @template TDomain - The corresponding Domain Entity
 * @template TID - The ID type (defaults to number)
 */
export abstract class BaseDrizzleRepository<
  TTable extends PgTable<TableConfig> & { id: AnyPgColumn },
  TDomain,
  TID = number,
  TInsert = InferInsertModel<TTable>,
> {
  protected readonly db = db;

  constructor(protected readonly table: TTable) {}

  /**
   * Maps a database record to a domain entity.
   * To be implemented by specific repositories.
   */
  protected abstract mapToDomain(record: InferSelectModel<TTable>): TDomain;

  /**
   * Retrieves a record by its unique ID.
   */
  async getById(id: TID): Promise<TDomain | null> {
    // We cast to 'any' for the from() and where() clauses to satisfy Drizzle's internal type complexity
    // while maintaining the public API type safety of TTable and TID.
    const result = await this.db
      .select()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(this.table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((this.table as any).id, id as any))
      .limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0] as InferSelectModel<TTable>);
  }

  /**
   * Creates a new record.
   */
  async create(data: TInsert): Promise<TDomain> {
    const result = await this.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(this.table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values(data as any)
      .returning();
    return this.mapToDomain(result[0] as InferSelectModel<TTable>);
  }

  /**
   * Updates an existing record and automatically refreshes 'updatedAt' if present.
   */
  async update(id: TID, data: Partial<TInsert>): Promise<TDomain> {
    const payload = { ...data };

    // Auto-update updatedAt if it exists in the schema
    if ('updatedAt' in this.table) {
      (payload as Record<string, unknown>).updatedAt = new Date();
    }

    const result = await this.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(this.table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(payload as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((this.table as any).id, id as any))
      .returning();

    if (result.length === 0) {
      throw new Error(`Failed to update: Record with ID ${id} not found.`);
    }

    return this.mapToDomain(result[0] as InferSelectModel<TTable>);
  }

  /**
   * Deletes a record by its ID.
   */
  async delete(id: TID): Promise<void> {
    await this.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .delete(this.table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((this.table as any).id, id as any));
  }
}


