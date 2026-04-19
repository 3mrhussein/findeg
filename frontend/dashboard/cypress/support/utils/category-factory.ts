export interface TestCategoryInput {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sortOrder: number;
}

/**
 *
 */
export function buildTestCategory(seed = Date.now()): TestCategoryInput {
  const stamp = `E2E-${seed}`;
  const slug = `cypress-category-${seed}`;

  return {
    slug,
    nameEn: `Cypress Category ${stamp}`,
    nameAr: `تصنيف سايبريس ${stamp}`,
    descriptionEn: `Cypress generated category ${stamp}.`,
    descriptionAr: `تصنيف مولد من سايبريس ${stamp}.`,
    sortOrder: 0,
  };
}
