/**
 * Shared message constants for non-error API payload fields.
 */

export const API_SUCCESS_MESSAGES = {
  VARIANT_UOMS_UPDATED: "Variant UoMs updated successfully",
  VARIANT_PRICING_UPDATED: "Variant pricing updated successfully",
  ORDER_CREATED: "Order created successfully",
} as const;

export const DOMAIN_DEFAULTS = {
  CURRENCY: "EGP",
  PRODUCT_NAME_FALLBACK: "Unknown Product",
  VARIANT_KEY: "default",
  UOM_CODE: "pcs",
  CUSTOMER_GROUP: "public_b2c",
} as const;
