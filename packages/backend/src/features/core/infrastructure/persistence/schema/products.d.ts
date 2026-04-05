/**
 * Product Database Schema (SPU Layer)
 *
 * Products are now Standard Product Units (SPUs) — the conceptual item.
 * Purchasable details (price, stock, images) live on product_variants (SKUs).
 */
/**
 * Products Table (SPU)
 *
 * Stores the conceptual product — brand, category, localized content, flags.
 * All pricing, inventory, and images are on product_variants.
 */
export declare const products: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "products";
    schema: "catalog";
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "products";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        sku: import("drizzle-orm/pg-core").PgColumn<{
            name: "sku";
            tableName: "products";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        skuPrefix: import("drizzle-orm/pg-core").PgColumn<{
            name: "sku_prefix";
            tableName: "products";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        localizedSlug: import("drizzle-orm/pg-core").PgColumn<{
            name: "localized_slug";
            tableName: "products";
            dataType: "json";
            columnType: "PgJsonb";
            data: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
            driverParam: unknown;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
        }>;
        localizedName: import("drizzle-orm/pg-core").PgColumn<{
            name: "localized_name";
            tableName: "products";
            dataType: "json";
            columnType: "PgJsonb";
            data: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
            driverParam: unknown;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
        }>;
        localizedDescription: import("drizzle-orm/pg-core").PgColumn<{
            name: "localized_description";
            tableName: "products";
            dataType: "json";
            columnType: "PgJsonb";
            data: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
            driverParam: unknown;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
        }>;
        localizedLongDescription: import("drizzle-orm/pg-core").PgColumn<{
            name: "localized_long_description";
            tableName: "products";
            dataType: "json";
            columnType: "PgJsonb";
            data: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
            driverParam: unknown;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
        }>;
        categoryId: import("drizzle-orm/pg-core").PgColumn<{
            name: "category_id";
            tableName: "products";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        brandId: import("drizzle-orm/pg-core").PgColumn<{
            name: "brand_id";
            tableName: "products";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        mediaSet: import("drizzle-orm/pg-core").PgColumn<{
            name: "media_set";
            tableName: "products";
            dataType: "json";
            columnType: "PgJsonb";
            data: {
                thumbnail?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                card?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                pdp?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                zoom?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                original?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
            };
            driverParam: unknown;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
                thumbnail?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                card?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                pdp?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                zoom?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
                original?: {
                    url: string;
                    width?: number | undefined;
                    height?: number | undefined;
                    mimeType?: string | undefined;
                    alt?: {
                        en?: string | undefined;
                        ar?: string | undefined;
                    } | undefined;
                } | undefined;
            };
        }>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "products";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        rating: import("drizzle-orm/pg-core").PgColumn<{
            name: "rating";
            tableName: "products";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        reviewsCount: import("drizzle-orm/pg-core").PgColumn<{
            name: "reviews_count";
            tableName: "products";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "products";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "products";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Product Relations
 */
export declare const productsRelations: import("drizzle-orm").Relations<"products", {
    variants: import("drizzle-orm").Many<"product_variants">;
    category: import("drizzle-orm").One<"categories", false>;
    brand: import("drizzle-orm").One<"brands", false>;
    tags: import("drizzle-orm").Many<"product_tags">;
    attributes: import("drizzle-orm").Many<"product_attributes">;
}>;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
