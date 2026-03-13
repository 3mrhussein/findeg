/**
 * Schema Index File
 *
 * Exports all database tables and relations to be used by Drizzle Kit and the app.
 * Import order matters — tables with no FK dependencies come first.
 */

export * from "./schemas";
export * from "./users";
export * from "./identity-access";
export * from "./brands";
export * from "./categories";
export * from "./products";
export * from "./product-variants";
export * from "./orders";
export * from "./reviews";
export * from "./addresses";
export * from "./audit-log";
export * from "./server-logs";
export * from "./variant-pricing";
export * from "./tags";
export * from "./product-attributes";
export * from "./translations";
export * from "./collections";
export * from "./inventory";
export * from "./discount-rules";
export * from "./school-lists";
export * from "./school-lists";
export * from "./school-list-sessions";
export * from "./school-access";
export * from "./cart-kits";
export * from "./search-logs";
export * from "./notifications";
