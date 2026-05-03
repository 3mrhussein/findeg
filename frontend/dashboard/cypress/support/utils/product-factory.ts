export interface TestProductInput {
  sku: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  stockQuantity: string;
  lowStockThreshold: string;
  imageUrl: string;
}

/**
 *
 */
export function buildTestProduct(seed = Date.now()): TestProductInput {
  const stamp = `E2E-${seed}`;
  return {
    sku: `SKU-${stamp}`,
    nameEn: `Cypress Product ${stamp}`,
    nameAr: `منتج ${stamp}`,
    descriptionEn: `Cypress generated product ${stamp} for category reflection flow.`,
    descriptionAr: `منتج مولد من سايبريس ${stamp} لاختبار تدفق الفئات.`,
    price: '49.99',
    stockQuantity: '25',
    lowStockThreshold: '5',
    imageUrl: `https://picsum.photos/seed/${stamp}/900/900`,
  };
}
