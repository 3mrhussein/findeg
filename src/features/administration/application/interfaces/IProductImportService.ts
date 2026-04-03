import { type ID } from "@/features/core/domain/types/common";
import { type ProductInput } from "@/features/administration/domain/types/ProductInput";

export interface ImportResult {
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: ImportRowPreview[];
}

export interface ImportRowPreview {
  rowIndex: number;
  status: "valid" | "warning" | "error";
  productInput: Partial<ProductInput>;
  warnings: string[];
  errors: string[];
  rawRow: Record<string, string>;
}

export interface IProductImportService {
  /**
   * Generates a CSV template containing headers, example row, and description row.
   */
  generateTemplate(): Buffer;

  /**
   * Validates a batch of rows from a CSV.
   * @param rows - Array of CSV row objects (keyed by header)
   */
  validateRows(rows: Record<string, string>[]): Promise<ImportResult>;

  /**
   * Processes the validated rows, either in a dry run or for actual insertion.
   * @param rows - Array of CSV row objects
   * @param upsert - If true, existing products (matched by SKU) are updated
   * @param dryRun - If true, the transaction is rolled back at the end
   * @param auditUserId - ID of the admin importing the file
   */
  processImport(
    rows: Record<string, string>[],
    upsert: boolean,
    dryRun: boolean,
    auditUserId: ID,
  ): Promise<ImportResult>;
}
