import { db } from "@findeg/db";
import { eq, InferSelectModel, InferInsertModel } from "drizzle-orm";
import { PgTable, TableConfig } from "drizzle-orm/pg-core";

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
  TTable extends PgTable<TableConfig>,
  TDomain,
  TID = number,
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
    // @ts-ignore - Assuming most tables have an 'id' column
    const result = await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToDomain(result[0] as InferSelectModel<TTable>);
  }

  /**
   * Creates a new record.
   */
  async create(data: InferInsertModel<TTable>): Promise<TDomain> {
    const result = await this.db
      .insert(this.table)
      .values(data as any)
      .returning();
    return this.mapToDomain(result[0] as InferSelectModel<TTable>);
  }

  /**
   * Updates an existing record and automatically refreshes 'updatedAt' if present.
   */
  async update(id: TID, data: Partial<InferInsertModel<TTable>>): Promise<TDomain> {
    const payload = { ...data };

    // Auto-update updatedAt if it exists in the schema
    if ("updatedAt" in this.table) {
      (payload as any).updatedAt = new Date();
    }

    const result = await this.db
      .update(this.table)
      // @ts-ignore
      .set(payload)
      // @ts-ignore
      .where(eq(this.table.id, id))
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
    // @ts-ignore
    await this.db.delete(this.table).where(eq(this.table.id, id));
  }
}
