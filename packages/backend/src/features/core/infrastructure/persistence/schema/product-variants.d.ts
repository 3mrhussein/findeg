/**
 * Product Variants Database Schema
 *
 * Normalized variant (SKU) tables:
 * - product_variants: Each row = one purchasable SKU
 * - variant_images: SKU-level image gallery
 * - variant_attributes: SKU-level filterable specs (color, tip_size, etc.)
 *
 * Design:
 * - Products are SPUs (conceptual); variants are SKUs (purchasable).
 * - Simple products get one "default" variant row.
 * - Pricing, inventory, and images all attach at the variant level.
 */
/**
 * Product Variants Table (SKU)
 *
 * Stores the actual purchasable unit with its unique SKU, pricing, and key features.
 */
export declare const productVariants: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "product_variants";
    schema: "catalog";
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "product_variants";
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
        productId: import("drizzle-orm/pg-core").PgColumn<{
            name: "product_id";
            tableName: "product_variants";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        sku: import("drizzle-orm/pg-core").PgColumn<{
            name: "sku";
            tableName: "product_variants";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        variantKey: import("drizzle-orm/pg-core").PgColumn<{
            name: "variant_key";
            tableName: "product_variants";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        localizedLabel: import("drizzle-orm/pg-core").PgColumn<{
            name: "localized_label";
            tableName: "product_variants";
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
        displayOrder: import("drizzle-orm/pg-core").PgColumn<{
            name: "display_order";
            tableName: "product_variants";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "product_variants";
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
        basePrice: import("drizzle-orm/pg-core").PgColumn<{
            name: "base_price";
            tableName: "product_variants";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        strikePrice: import("drizzle-orm/pg-core").PgColumn<{
            name: "strike_price";
            tableName: "product_variants";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
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
        costPrice: import("drizzle-orm/pg-core").PgColumn<{
            name: "cost_price";
            tableName: "product_variants";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
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
        weightGrams: import("drizzle-orm/pg-core").PgColumn<{
            name: "weight_grams";
            tableName: "product_variants";
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
        barcode: import("drizzle-orm/pg-core").PgColumn<{
            name: "barcode";
            tableName: "product_variants";
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
        lowStockThreshold: import("drizzle-orm/pg-core").PgColumn<{
            name: "low_stock_threshold";
            tableName: "product_variants";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "product_variants";
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
            tableName: "product_variants";
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
 * Variant Images Table
 */
export declare const variantImages: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "variant_images";
    schema: "catalog";
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "variant_images";
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
        variantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "variant_id";
            tableName: "variant_images";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        url: import("drizzle-orm/pg-core").PgColumn<{
            name: "url";
            tableName: "variant_images";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        alt: import("drizzle-orm/pg-core").PgColumn<{
            name: "alt";
            tableName: "variant_images";
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
        displayOrder: import("drizzle-orm/pg-core").PgColumn<{
            name: "display_order";
            tableName: "variant_images";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "variant_images";
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
 * variant_attributes
 *
 * SKU-level typed attribute values for filtering and school-list matching.
 * E.g., variantId=10 + attribute "ink_color" → value_text = "blue"
 */
export declare const variantAttributes: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "variant_attributes";
    schema: "catalog";
    columns: {
        variantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "variant_id";
            tableName: "variant_attributes";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        attributeId: import("drizzle-orm/pg-core").PgColumn<{
            name: "attribute_id";
            tableName: "variant_attributes";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        valueText: import("drizzle-orm/pg-core").PgColumn<{
            name: "value_text";
            tableName: "variant_attributes";
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
        valueNum: import("drizzle-orm/pg-core").PgColumn<{
            name: "value_num";
            tableName: "variant_attributes";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
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
        valueBool: import("drizzle-orm/pg-core").PgColumn<{
            name: "value_bool";
            tableName: "variant_attributes";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
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
    };
    dialect: "pg";
}>;
export declare const productVariantsRelations: import("drizzle-orm").Relations<"product_variants", {
    product: import("drizzle-orm").One<"products", true>;
    images: import("drizzle-orm").Many<"variant_images">;
    attributes: import("drizzle-orm").Many<"variant_attributes">;
    sellableUoms: import("drizzle-orm").Many<"variant_sellable_uoms">;
    priceLists: import("drizzle-orm").Many<"variant_price_lists">;
}>;
export declare const variantImagesRelations: import("drizzle-orm").Relations<"variant_images", {
    variant: import("drizzle-orm").One<"product_variants", true>;
}>;
export declare const variantAttributesRelations: import("drizzle-orm").Relations<"variant_attributes", {
    variant: import("drizzle-orm").One<"product_variants", true>;
    definition: import("drizzle-orm").One<"attribute_definitions", true>;
}>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type VariantImage = typeof variantImages.$inferSelect;
export type NewVariantImage = typeof variantImages.$inferInsert;
export type VariantAttribute = typeof variantAttributes.$inferSelect;
export type NewVariantAttribute = typeof variantAttributes.$inferInsert;
