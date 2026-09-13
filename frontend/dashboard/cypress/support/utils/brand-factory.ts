export interface TestBrandInput {
  slug: string;
  name: string;
  logoUrl: string;
  isActive: boolean;
}

/**
 *
 */
export function buildTestBrand(seed = Date.now()): TestBrandInput {
  const stamp = `E2E-${seed}`;

  return {
    slug: `cypress-brand-${seed}`,
    name: `Cypress Brand ${stamp}`,
    logoUrl: `https://picsum.photos/seed/brand-${seed}/200/200`,
    isActive: true,
  };
}
