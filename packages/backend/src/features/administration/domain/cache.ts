/**
 * Administration Feature Cache Path Builders
 *
 * Returns cache paths that should be invalidated when admin data changes.
 * App-layer uses these paths to execute revalidatePath() calls.
 */

/**
 * Get all cache paths affected by tag changes (create/update/delete)
 *
 * @param tagId - Optional tag ID for specific tag invalidation
 * @returns Array of cache paths to invalidate
 */
export function getTagCachePaths(tagId?: number): string[] {
  const paths = [
    "/admin/tags", // Tags list
  ];

  if (tagId) {
    paths.push(`/admin/tags/${tagId}`); // Tag detail
  }

  return paths;
}

/**
 * Get all cache tags affected by tag changes
 *
 * @param tagId - Optional tag ID for specific tag invalidation
 * @returns Array of cache tags to invalidate
 */
export function getTagCacheTags(tagId?: number): string[] {
  const tags = [
    "tags", // All tags
    "admin:tags", // Admin tags
  ];

  if (tagId) {
    tags.push(`tag-${tagId}`); // Specific tag
  }

  return tags;
}

/**
 * Get all cache paths affected by collection changes (create/update/delete)
 *
 * @param collectionId - Optional collection ID for specific collection invalidation
 * @returns Array of cache paths to invalidate
 */
export function getCollectionCachePaths(collectionId?: number): string[] {
  const paths = [
    "/admin/collections", // Collections list
  ];

  if (collectionId) {
    paths.push(`/admin/collections/${collectionId}`); // Collection detail
  }

  return paths;
}

/**
 * Get all cache tags affected by collection changes
 *
 * @param collectionId - Optional collection ID
 * @returns Array of cache tags to invalidate
 */
export function getCollectionCacheTags(collectionId?: number): string[] {
  const tags = [
    "collections", // All collections
    "admin:collections", // Admin collections
    "products", // Collections affect product listings
  ];

  if (collectionId) {
    tags.push(`collection-${collectionId}`); // Specific collection
  }

  return tags;
}

/**
 * Get all cache paths affected by product admin changes
 * (Different from catalog product changes - admin-specific operations)
 *
 * @param productId - Optional product ID
 * @returns Array of cache paths to invalidate
 */
export function getAdminProductCachePaths(productId?: number): string[] {
  const paths = [
    "/admin/products", // Products list
  ];

  if (productId) {
    paths.push(`/admin/products/${productId}`); // Product detail
  }

  return paths;
}

/**
 * Get all cache tags affected by product admin changes
 *
 * @param productId - Optional product ID
 * @returns Array of cache tags to invalidate
 */
export function getAdminProductCacheTags(productId?: number): string[] {
  const tags = [
    "products", // All products
    "admin:products", // Admin products
  ];

  if (productId) {
    tags.push(`product-${productId}`); // Specific product
  }

  return tags;
}

/**
 * Get all cache paths affected by inventory changes
 *
 * @param inventoryId - Optional inventory ID
 * @returns Array of cache paths to invalidate
 */
export function getInventoryCachePaths(inventoryId?: number): string[] {
  const paths = [
    "/admin/inventory", // Inventory list
  ];

  if (inventoryId) {
    paths.push(`/admin/inventory/${inventoryId}`); // Inventory detail
  }

  return paths;
}

/**
 * Get all cache tags affected by inventory changes
 *
 * @param inventoryId - Optional inventory ID
 * @returns Array of cache tags to invalidate
 */
export function getInventoryCacheTags(inventoryId?: number): string[] {
  const tags = [
    "inventory", // All inventory
    "admin:inventory", // Admin inventory
    "products", // Inventory affects product pages
  ];

  if (inventoryId) {
    tags.push(`inventory-${inventoryId}`); // Specific inventory
  }

  return tags;
}
