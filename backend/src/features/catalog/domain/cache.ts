/**
 * Catalog Feature Cache Path Builders
 *
 * Returns cache paths that should be invalidated when catalog data changes.
 * App-layer uses these paths to execute revalidatePath() calls.
 */

/**
 * Get all cache paths affected by product changes (create/update/delete)
 *
 * @param productId - Optional product ID for specific product invalidation
 * @returns Array of cache paths to invalidate
 */
export function getProductCachePaths(productId?: number): string[] {
  const paths = [
    '/admin/products', // Products list
  ];

  if (productId) {
    paths.push(`/admin/products/${productId}`); // Product detail
  }

  return paths;
}

/**
 * Get all cache tags affected by product changes
 * (Can be extended for tag-based revalidation)
 *
 * @param productId - Optional product ID for specific product invalidation
 * @returns Array of cache tags to invalidate
 */
export function getProductCacheTags(productId?: number): string[] {
  const tags = [
    'products', // All products
    'catalog:products', // Catalog products
    'shop', // Shop pages affected
  ];

  if (productId) {
    tags.push(`product-${productId}`); // Specific product
  }

  return tags;
}

/**
 * Get all cache paths affected by brand changes (create/update/delete)
 *
 * @param brandId - Optional brand ID for specific brand invalidation
 * @returns Array of cache paths to invalidate
 */
export function getBrandCachePaths(brandId?: number): string[] {
  const paths = [
    '/admin/brands', // Brands list
  ];

  if (brandId) {
    paths.push(`/admin/brands/${brandId}`); // Brand detail
  }

  return paths;
}

/**
 * Get all cache tags affected by brand changes
 * (Can be extended for tag-based revalidation)
 *
 * @param brandId - Optional brand ID for specific brand invalidation
 * @returns Array of cache tags to invalidate
 */
export function getBrandCacheTags(brandId?: number): string[] {
  const tags = [
    'brands', // All brands
    'catalog:brands', // Catalog brands
    'products', // Products affected (brands filter products)
    'shop', // Shop pages affected
  ];

  if (brandId) {
    tags.push(`brand-${brandId}`); // Specific brand
  }

  return tags;
}

/**
 * Get all cache paths affected by category changes (create/update/delete/reorder)
 *
 * @param categoryId - Optional category ID for specific category invalidation
 * @returns Array of cache paths to invalidate
 */
export function getCategoryCachePaths(categoryId?: number): string[] {
  const paths = [
    '/admin/categories', // Categories list
  ];

  if (categoryId) {
    paths.push(`/admin/categories/${categoryId}`); // Category detail
  }

  return paths;
}

/**
 * Get all cache tags affected by category changes
 * (Can be extended for tag-based revalidation)
 *
 * @param categoryId - Optional category ID for specific category invalidation
 * @returns Array of cache tags to invalidate
 */
export function getCategoryCacheTags(categoryId?: number): string[] {
  const tags = [
    'categories', // All categories
    'catalog:categories', // Catalog categories
    'products', // Products affected (categories filter products)
    'shop', // Shop pages affected
  ];

  if (categoryId) {
    tags.push(`category-${categoryId}`); // Specific category
  }

  return tags;
}
