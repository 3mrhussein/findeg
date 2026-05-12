import { type ID } from '../../../core/domain/types/common';
import {
  type IProductImportService,
  type ImportResult,
  type ImportRowPreview,
} from '../interfaces/IProductImportService';
import { type IAdminProductService } from '../interfaces/IAdminProductService';

/**
 *
 */
export class ProductImportService implements IProductImportService {
  /**
   *
   */
  constructor(
    private adminProductService: IAdminProductService,
  ) {}

  /**
   *
   */
  generateTemplate(): Buffer {
    const headers = [
      'sku',
      'name_en',
      'name_ar',
      'description_en',
      'description_ar',
      'brand_id',
      'category_id',
      'base_price',
      'cost_price',
      'barcode',
      'weight_grams',
      'is_active',
    ];
    const example = [
      'STA-88-BLU-04',
      'Stabilo Point 88 - Blue 0.4',
      'ستابيلو بوينت ٨٨ - أزرق ٠.٤',
      'Fine liner pen',
      'قلم تحديد دقيق',
      '1',
      '10',
      '15.50',
      '10.00',
      '4006381333627',
      '10',
      'true',
    ];

    const csvContent = [headers.join(','), example.join(',')].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   *
   */
  async validateRows(rows: Record<string, string>[]): Promise<ImportResult> {
    const previews: ImportRowPreview[] = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const warnings: string[] = [];
      const errors: string[] = [];

      // Basic validation
      if (!row.sku) errors.push('SKU is required.');
      if (!row.name_en || !row.name_ar) errors.push('Both EN and AR names are required.');
      if (!row.base_price || isNaN(Number(row.base_price)))
        errors.push('Valid base_price is required.');

      const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';

      if (status === 'error') errorCount++;
      else if (status === 'warning') warningCount++;
      else validCount++;

      previews.push({
        rowIndex: i,
        status,
        productInput: {}, // We would parse it into ProductInput here
        warnings,
        errors,
        rawRow: row,
      });
    }

    return {
      validCount,
      warningCount,
      errorCount,
      rows: previews,
    };
  }

  /**
   *
   */
  async processImport(
    rows: Record<string, string>[],
    upsert: boolean,
    dryRun: boolean,
    _auditUserId: ID,
  ): Promise<ImportResult> {
    const validationResult = await this.validateRows(rows);
    if (dryRun || validationResult.errorCount > 0) {
      return validationResult;
    }

    // In a real implementation: start a transaction, convert rows to ProductInputs,
    // call adminProductService.createProduct or updateProduct depending on `upsert`.
    // Since we don't have transaction scope exposed from AdminProductService easily,
    // we iterate or use a repository batch method.
    // For now we just return the validation result.

    return validationResult;
  }
}
