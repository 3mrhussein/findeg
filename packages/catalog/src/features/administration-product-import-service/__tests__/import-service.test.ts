import { describe, expect, it, vi } from 'vitest';
import { ProductImportService } from '../index';

const adminProductService = { createProduct: vi.fn() };

describe('ProductImportService', () => {
  const service = new ProductImportService(adminProductService as never);

  it('generates a CSV template with headers and one example row', () => {
    const csv = service.generateTemplate().toString('utf-8').split('\n');
    expect(csv).toHaveLength(2);
    expect(csv[0].split(',')[0]).toBe('sku');
    expect(csv[1].startsWith('STA-88-BLU-04,')).toBe(true);
  });

  it('classifies rows as errors when required fields are missing or invalid', async () => {
    const result = await service.validateRows([
      { sku: 'A', name_en: 'Pen', name_ar: 'قلم', base_price: '5' },
      { name_en: 'Pen', name_ar: '', base_price: 'abc' },
    ]);
    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.warningCount).toBe(0);
    expect(result.rows[1].errors).toEqual([
      'SKU is required.',
      'Both EN and AR names are required.',
      'Valid base_price is required.',
    ]);
  });

  it('returns the validation result for a dry run or when rows have errors', async () => {
    const good = [{ sku: 'A', name_en: 'Pen', name_ar: 'قلم', base_price: '5' }];
    const dry = await service.processImport(good, false, true, 1);
    expect(dry.validCount).toBe(1);
    const bad = await service.processImport([{}], false, false, 1);
    expect(bad.errorCount).toBe(1);
  });

  it('returns the validation result for a live import', async () => {
    const result = await service.processImport(
      [{ sku: 'A', name_en: 'Pen', name_ar: 'قلم', base_price: '5' }],
      true,
      false,
      1,
    );
    expect(result.rows[0].status).toBe('valid');
  });
});
