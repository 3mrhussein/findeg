/**
 * Cache Invalidation Strategy
 *
 * This file documents the cache tag usage across the dashboard data layer.
 * Used by Next.js Cache Components for precise cache invalidation on mutations.
 */

export const CACHE_TAGS = {
  // Products
  PRODUCTS: "products",
  PRODUCT_DETAIL: (id: number) => `product-${id}`,

  // Orders
  ORDERS: "orders",
  ORDER_DETAIL: (id: number) => `order-${id}`,

  // Categories
  CATEGORIES: "categories",
  CATEGORY_DETAIL: (id: number) => `category-${id}`,

  // Catalog Resources
  BRANDS: "brands",
  TAGS: "tags",
  TAGS_GROUPED: "tags-grouped",

  // Dashboard
  DASHBOARD_STATS: "dashboard-stats",
  RECENT_ORDERS: "recent-orders",
  RECENT_PRODUCTS: "recent-products",

  // Admin Metrics
  ADMIN_HEALTH: "admin-health",
  ADMIN_DISTRIBUTIONS: "admin-distributions",
  ADMIN_ACTIVITY: "admin-activity",

  // Inventory
  INVENTORY: "inventory",
  INVENTORY_ALERTS: "inventory-alerts",
};

/**
 * Cache Invalidation Pattern by Entity
 *
 * PRODUCTS:
 *   CREATE: updateTag("products")
 *   UPDATE: updateTag("products"), updateTag(`product-${id}`)
 *   DELETE: updateTag("products"), updateTag(`product-${id}`)
 *
 * ORDERS:
 *   UPDATE_STATUS: updateTag("orders"), updateTag(`order-${id}`)
 *   UPDATE_PAYMENT: updateTag("orders"), updateTag(`order-${id}`)
 *
 * CATEGORIES:
 *   CREATE: updateTag("categories")
 *   UPDATE: updateTag("categories"), updateTag(`category-${id}`)
 *   DELETE: updateTag("categories"), updateTag(`category-${id}`)
 *
 * CROSS-ENTITY IMPACTS:
 *   - Product deletion → Invalidate product-specific tags
 *   - Category update → Invalidate product queries (affected by category)
 *   - Tag/Brand changes → Invalidate product lists (filtered/displayed with these)
 */

/**
 * Read-Your-Writes Semantics
 *
 * After any mutation action, the user should see the updated data immediately
 * without page reload. This is achieved via:
 *
 * 1. updateTag() to invalidate Next.js Cache Components
 * 2. revalidatePath() to regenerate pages if needed
 * 3. Immediate client-side state update (via form reset/redirect)
 *
 * Example Flow:
 *   1. User submits product form → createProduct() action
 *   2. Backend processes, returns success
 *   3. updateTag("products") invalidates cache
 *   4. getProducts() queries fresh data on next navigation
 *   5. Product list page refreshes with new product
 */

/**
 * Supported Invalidation Strategies
 *
 * Single Tag Invalidation (Products, Orders):
 *   - Fast: Single cache invalidation
 *   - Use case: Simple list + detail (detail cached separately if needed)
 *
 * Entity-Specific Tags (Categories):
 *   - Precise: Invalidates both list and detail
 *   - Use case: Entities with hierarchies or complex relationships
 *
 * Multi-Tag Invalidation (Future):
 *   - Related caches: Product update → Invalidate product-variants tags too
 *   - Not currently used but documented for future expansion
 */
