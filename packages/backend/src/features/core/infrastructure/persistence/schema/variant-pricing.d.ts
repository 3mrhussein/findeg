/**
 * Variant Pricing & Sellable UoM Schema
 *
 * Pricing and UOM definitions that attach directly to product_variants (SKU level).
 */
/**
 * Variant Sellable Units of Measure (UOM)
 */
export declare const variantSellableUoms: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "variant_sellable_uoms";
    schema: "catalog";
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "variant_sellable_uoms";
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
            tableName: "variant_sellable_uoms";
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
        uomCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "uom_code";
            tableName: "variant_sellable_uoms";
            dataType: "string";
            columnType: "PgText";
            data: "pcs" | "pack" | "carton";
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
        }, {}, {
            $type: "pcs" | "pack" | "carton";
        }>;
        factorToBase: import("drizzle-orm/pg-core").PgColumn<{
            name: "factor_to_base";
            tableName: "variant_sellable_uoms";
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
        localizedLabel: import("drizzle-orm/pg-core").PgColumn<{
            name: "localized_label";
            tableName: "variant_sellable_uoms";
            dataType: "json";
            columnType: "PgJsonb";
            data: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
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
            $type: Partial<import("@/features/core/domain/value-objects").LocalizedString<"en" | "ar">>;
        }>;
        barcode: import("drizzle-orm/pg-core").PgColumn<{
            name: "barcode";
            tableName: "variant_sellable_uoms";
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
        isEnabled: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_enabled";
            tableName: "variant_sellable_uoms";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "variant_sellable_uoms";
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
            tableName: "variant_sellable_uoms";
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
 * Variant Price Lists
 */
export declare const variantPriceLists: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "variant_price_lists";
    schema: "catalog";
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "variant_price_lists";
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
            tableName: "variant_price_lists";
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
        customerGroup: import("drizzle-orm/pg-core").PgColumn<{
            name: "customer_group";
            tableName: "variant_price_lists";
            dataType: "string";
            columnType: "PgText";
            data: "public_b2c" | "school_b2b" | "wholesale";
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
        }, {}, {
            $type: "public_b2c" | "school_b2b" | "wholesale";
        }>;
        uomCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "uom_code";
            tableName: "variant_price_lists";
            dataType: "string";
            columnType: "PgText";
            data: "pcs" | "pack" | "carton";
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
        }, {}, {
            $type: "pcs" | "pack" | "carton";
        }>;
        currency: import("drizzle-orm/pg-core").PgColumn<{
            name: "currency";
            tableName: "variant_price_lists";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: string;
        }>;
        unitPrice: import("drizzle-orm/pg-core").PgColumn<{
            name: "unit_price";
            tableName: "variant_price_lists";
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
        minQty: import("drizzle-orm/pg-core").PgColumn<{
            name: "min_qty";
            tableName: "variant_price_lists";
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
        isSellable: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_sellable";
            tableName: "variant_price_lists";
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
        startsAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "starts_at";
            tableName: "variant_price_lists";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
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
        endsAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "ends_at";
            tableName: "variant_price_lists";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "variant_price_lists";
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
            tableName: "variant_price_lists";
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
export declare const variantSellableUomsRelations: import("drizzle-orm").Relations<"variant_sellable_uoms", {
    variant: import("drizzle-orm").One<"product_variants", true>;
}>;
export declare const variantPriceListsRelations: import("drizzle-orm").Relations<"variant_price_lists", {
    variant: import("drizzle-orm").One<"product_variants", true>;
}>;
export type VariantSellableUom = typeof variantSellableUoms.$inferSelect;
export type NewVariantSellableUom = typeof variantSellableUoms.$inferInsert;
export type VariantPriceList = typeof variantPriceLists.$inferSelect;
export type NewVariantPriceList = typeof variantPriceLists.$inferInsert;
