/** How much of a variant is left to buy, for warnings and badges. */
export const STOCK_LEVELS = ['out-of-stock', 'low-stock', 'in-stock'] as const;

/** The most available units that still count as low stock. Low stock is 1 to 5 units. */
export const LOW_STOCK_MAX_UNITS = 5;
