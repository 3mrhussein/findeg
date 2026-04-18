import type { Product } from "@backend/features/catalog/domain/entities/Product";

interface ScoredProduct {
  product: Product;
  score: number;
}

const MIN_FUZZY_SCORE = 8;

/**
 * Normalizes free text for fuzzy comparisons.
 */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Calculates Levenshtein distance between two tokens.
 */
function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let col = 0; col < cols; col += 1) matrix[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

/**
 * Determines if two tokens are close enough for typo-tolerant matching.
 */
function isCloseTokenMatch(token: string, candidate: string): boolean {
  if (token.length < 3 || candidate.length < 3) return false;
  const maxDistance = token.length <= 4 ? 1 : 2;
  if (Math.abs(token.length - candidate.length) > maxDistance) return false;

  return levenshteinDistance(token, candidate) <= maxDistance;
}

/**
 * Scores a product against a normalized query.
 */
function scoreProduct(product: Product, normalizedQuery: string): number {
  const fields = [
    product.name,
    product.description,
    product.longDescription,
    product.skuPrefix || "",
    ...(product.variants || []).map((v) => v.sku),
    product.brandName || "",
    product.categoryName || "",
  ]
    .map(normalizeText)
    .filter(Boolean);

  if (fields.length === 0) return 0;

  const haystack = fields.join(" ");
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const searchableTokens = new Set(haystack.split(" ").filter(Boolean));

  let score = 0;
  let matchedTokens = 0;

  if (haystack.includes(normalizedQuery)) {
    score += 90;
  }

  for (const token of queryTokens) {
    let tokenMatched = false;

    if (searchableTokens.has(token)) {
      score += 30;
      tokenMatched = true;
    } else if (Array.from(searchableTokens).some((candidate) => candidate.startsWith(token))) {
      score += 20;
      tokenMatched = true;
    } else if (haystack.includes(token)) {
      score += 14;
      tokenMatched = true;
    } else if (
      Array.from(searchableTokens).some((candidate) => isCloseTokenMatch(token, candidate))
    ) {
      score += 12;
      tokenMatched = true;
    }

    if (tokenMatched) matchedTokens += 1;
  }

  if (queryTokens.length > 0 && matchedTokens === queryTokens.length) {
    score += 15;
  }

  return score;
}

/**
 * Returns scored typo-tolerant matches sorted by score and product id.
 */
export function fuzzySearchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const scored: ScoredProduct[] = products
    .map((product) => ({
      product,
      score: scoreProduct(product, normalizedQuery),
    }))
    .filter((entry) => entry.score >= MIN_FUZZY_SCORE);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.product.id - b.product.id;
  });

  return scored.map((entry) => entry.product);
}
