/**
 * Sku: the one catalogue SKU helper the admin features need. The SKU rule itself (non-empty text
 * with no surrounding whitespace) is the domain's `sku`; FindEg has no SKU format.
 */
const sku = {
  /**
   * Suggest a variant SKU from a product SKU prefix and attribute values.
   * e.g. suggestVariantSku("FC-GRIP", ["blue", "0.7"]) → "FC-GRIP-BLUE-07"
   */
  suggestVariantSku(prefix: string, attributeValues: string[]): string {
    const parts = [prefix, ...attributeValues];
    return parts
      .map((p) =>
        p
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '-')
          .replace(/-+/g, '-'),
      )
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },
};

export { sku as Sku };
