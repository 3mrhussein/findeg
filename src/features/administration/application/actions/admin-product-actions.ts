"use server";

import { z } from "zod";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { revalidatePath, revalidateTag } from "next/cache";
import { resolveErrorMessage } from "@/features/core/domain/errors/error-catalog";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { isSystemAdmin } from "@/features/core/domain/auth/authorization";
import { type ProductFormValues } from "@/features/administration/presentation/forms/product-form";

// ─── Auth helper ──────────────────────────────────────────────────────────────

/**
 *
 */
async function requireCatalogRole() {
  const session = await container.authService.validateAdmin();
  const ok = isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
  if (!ok) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");
  return { session, adminUserId: Number(session.userId) };
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

/**
 *
 */
function invalidateProductCache(id?: number) {
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}/edit`);
  revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max" as never);
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const LocalizedStringSchema = z.object({ en: z.string(), ar: z.string() });

const UoMInputSchema = z.object({
  uomCode: z.string().min(1),
  factorToBase: z.number().int().positive(),
  localizedLabel: LocalizedStringSchema,
  barcode: z.string().optional(),
  isEnabled: z.boolean().default(true),
  priceLists: z
    .array(
      z.object({
        customerGroup: z.enum(["public_b2c", "school_b2b"]),
        uomCode: z.string(),
        unitPrice: z.number().nonnegative(),
        minQty: z.number().int().positive().default(1),
        isSellable: z.boolean().default(true),
        startsAt: z.coerce.date().nullable().optional(),
        endsAt: z.coerce.date().nullable().optional(),
      }),
    )
    .default([]),
});

const ImageInputSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  displayOrder: z.number().int().nonnegative().default(0),
});

const VariantAttributeInputSchema = z.object({
  attributeKey: z.string().min(1),
  value: z.string().min(1),
  isVariantDefining: z.boolean().default(false),
});

const CreateVariantSchema = z.object({
  sku: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[A-Z0-9-]+$/, "SKU must be uppercase, digits, or hyphens only"),
  localizedLabel: LocalizedStringSchema.default({ en: "", ar: "" }),
  displayOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  basePrice: z.number().nonnegative(),
  strikePrice: z.number().nonnegative().nullable().optional(),
  costPrice: z.number().nonnegative().nullable().optional(),
  weightGrams: z.number().int().nonnegative().nullable().optional(),
  barcode: z.string().nullable().optional(),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  images: z.array(ImageInputSchema).default([]),
  attributes: z.array(VariantAttributeInputSchema).default([]),
  uoms: z.array(UoMInputSchema).default([]),
});

const CreateProductSchema = z.object({
  localizedName: LocalizedStringSchema,
  localizedDescription: LocalizedStringSchema.optional(),
  localizedLongDescription: LocalizedStringSchema.optional(),
  localizedSlug: LocalizedStringSchema.optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  brandId: z.number().int().positive().nullable().optional(),
  tagIds: z.array(z.number().int().positive()).default([]),
  isActive: z.boolean().default(true),
  sku: z.string().optional(),
  pricingMode: z.enum(["shared", "per-variant"]).default("per-variant"),
  uomSharingMode: z.enum(["shared", "per-variant"]).default("shared"),
  sharedBasePrice: z.number().nonnegative().optional(),
  sharedStrikePrice: z.number().nonnegative().nullable().optional(),
  sharedCostPrice: z.number().nonnegative().nullable().optional(),
  sharedUoMs: z.array(UoMInputSchema).optional(),
  variants: z.array(CreateVariantSchema).min(1, "At least one variant is required"),
});

const UpdateVariantSchema = CreateVariantSchema.partial().extend({
  id: z.number().int().positive(),
  displayOrder: z.number().int().nonnegative().optional(),
});

const UpdateProductSchema = z.object({
  localizedName: LocalizedStringSchema.optional(),
  localizedDescription: LocalizedStringSchema.optional(),
  localizedLongDescription: LocalizedStringSchema.optional(),
  localizedSlug: LocalizedStringSchema.optional(),
  categoryId: z.number().nullable().optional(),
  brandId: z.number().nullable().optional(),
  tagIds: z.array(z.number()).optional(),
  isActive: z.boolean().optional(),
  sku: z.string().optional(),
  pricingMode: z.enum(["shared", "per-variant"]).optional(),
  uomSharingMode: z.enum(["shared", "per-variant"]).optional(),
  sharedBasePrice: z.number().nonnegative().optional(),
  sharedStrikePrice: z.number().nonnegative().nullable().optional(),
  sharedCostPrice: z.number().nonnegative().nullable().optional(),
  sharedUoMs: z.array(UoMInputSchema).optional(),
  variants: z.array(UpdateVariantSchema).optional(),
  variantsToDelete: z.array(z.number().int().positive()).optional(),
  variantsToDeactivate: z.array(z.number().int().positive()).optional(),
});

// ─── Create Product Action ────────────────────────────────────────────────────

/**
 *
 */
export async function createProductAction(rawInput: unknown) {
  try {
    const { adminUserId } = await requireCatalogRole();
    const input = CreateProductSchema.parse(rawInput);

    const { productId } = await container.adminProductService.createProduct(input, adminUserId);

    invalidateProductCache();

    return { success: true as const, productId };
  } catch (error) {
    console.error("[createProductAction]", error);
    if (error instanceof z.ZodError) {
      return { success: false as const, error: "Invalid input", issues: error.issues };
    }
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_CREATE_FAILED"),
    };
  }
}

// ─── Update Product Action ────────────────────────────────────────────────────

/**
 *
 */
export async function updateProductAction(id: number, rawInput: unknown) {
  try {
    const { adminUserId } = await requireCatalogRole();
    const input = UpdateProductSchema.parse(
      rawInput,
    ) as import("@/features/administration/domain/types/VariantInput").UpdateProductWithVariantsInput;

    await container.adminProductService.updateProduct(id, input, adminUserId);

    invalidateProductCache(id);

    return { success: true as const };
  } catch (error) {
    console.error("[updateProductAction]", error);
    if (error instanceof z.ZodError) {
      return { success: false as const, error: "Invalid input", issues: error.issues };
    }
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Delete Product Action ────────────────────────────────────────────────────

/**
 *
 */
export async function deleteProductAction(id: number) {
  try {
    const { adminUserId } = await requireCatalogRole();
    await container.adminProductService.deleteProduct(id, adminUserId);
    invalidateProductCache(id);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_DELETE_FAILED"),
    };
  }
}

// ─── Set Product Status Action ────────────────────────────────────────────────

/**
 *
 */
export async function setProductStatusAction(id: number, isActive: boolean) {
  try {
    const { adminUserId } = await requireCatalogRole();
    await container.adminProductService.updateProduct(id, { isActive }, adminUserId);
    invalidateProductCache(id);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Deactivate Variant Action ────────────────────────────────────────────────

/**
 *
 */
export async function deactivateVariantAction(variantId: number) {
  try {
    const { adminUserId } = await requireCatalogRole();
    await container.adminProductService.deactivateVariant(variantId, adminUserId);
    revalidatePath("/admin/products");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Generate Variants Action ─────────────────────────────────────────────────

const GenerateVariantsSchema = z.object({
  productId: z.number().int().positive(),
  dimensions: z.array(
    z.object({
      attributeKey: z.string().min(1),
      label: LocalizedStringSchema,
      options: z.array(z.string().min(1)).min(1),
      isVariantDefining: z.literal(true),
    }),
  ),
  defaults: CreateVariantSchema.partial(),
});

/**
 *
 */
export async function generateVariantsAction(rawInput: unknown) {
  try {
    const { adminUserId } = await requireCatalogRole();
    const { productId, dimensions, defaults } = GenerateVariantsSchema.parse(rawInput);

    const newIds = await container.adminProductService.generateVariants(
      productId,
      dimensions,
      defaults,
      adminUserId,
    );

    invalidateProductCache(productId);

    return { success: true as const, variantIds: newIds };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: "Invalid input", issues: error.issues };
    }
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Rebuild Variant Keys Action ──────────────────────────────────────────────

/**
 *
 */
export async function rebuildVariantKeysAction(productId: number) {
  try {
    const { adminUserId } = await requireCatalogRole();
    await container.adminProductService.rebuildVariantKeys(productId, adminUserId);
    invalidateProductCache(productId);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Check SKU Availability ───────────────────────────────────────────────────

/**
 *
 */
export async function checkSkuAction(sku: string, excludeVariantId?: number) {
  try {
    await requireCatalogRole();
    const available = await container.adminProductService.checkSkuAvailable(sku, excludeVariantId);
    return { success: true as const, available };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "SYSTEM_UNEXPECTED_ERROR"),
    };
  }
}

// ─── Upsert Variant UoMs ──────────────────────────────────────────────────────

/**
 *
 */
export async function upsertVariantUoMsAction(variantId: number, uoms: unknown) {
  try {
    const { adminUserId } = await requireCatalogRole();
    const parsed = z.array(UoMInputSchema).parse(uoms);
    await container.adminProductService.upsertVariantUoMs(variantId, parsed, adminUserId);
    revalidatePath("/admin/products");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Upsert Variant Images ────────────────────────────────────────────────────

/**
 *
 */
export async function upsertVariantImagesAction(variantId: number, images: unknown) {
  try {
    const { adminUserId } = await requireCatalogRole();
    const parsed = z.array(ImageInputSchema).parse(images);
    await container.adminProductService.upsertVariantImages(variantId, parsed, adminUserId);
    revalidatePath("/admin/products");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED"),
    };
  }
}

// ─── Import Actions (unchanged) ────────────────────────────────────────────────

/**
 *
 */
export async function adminValidateProductImportAction(rows: Record<string, string>[]) {
  try {
    const session = await container.authService.validateAdmin();
    const ok = isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!ok) throw new Error("Forbidden");
    const result = await container.productImportService.validateRows(rows);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Validation failed." };
  }
}

/**
 *
 */
export async function adminProcessProductImportAction(rows: Record<string, string>[]) {
  try {
    const session = await container.authService.validateAdmin();
    const ok = isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
    if (!ok) throw new Error("Forbidden");
    const result = await container.productImportService.processImport(
      rows,
      true,
      false,
      Number(session.userId),
    );
    revalidatePath("/admin/products");
    revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max");
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Import failed." };
  }
}

// ─── Legacy aliases (preserve compatibility with any existing callers) ────────

export const adminCreateProductAction = createProductAction;
/**
 *
 */
export const adminUpdateProductAction = async (id: number, input: unknown) =>
  updateProductAction(id, input);
export const adminDeleteProductAction = deleteProductAction;
/**
 *
 */
export const adminArchiveProductAction = async (id: number) => setProductStatusAction(id, false);
export const adminSetProductStatusAction = setProductStatusAction;

// ─── Real-time Checks ────────────────────────────────────────────────────────

/**
 * Server action to check if a product slug is available.
 */
export async function checkSlugAction(slug: string, excludeId?: number) {
  try {
    await requireCatalogRole();
    const adminProductService = container.adminProductService;
    const available = await adminProductService.checkSlugAvailable(slug, excludeId);
    return { success: true, available };
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED") };
  }
}

/**
 * Server action to check if a product SKU prefix is available.
 */
export async function checkSkuPrefixAction(prefix: string, excludeId?: number) {
  try {
    await requireCatalogRole();
    const adminProductService = container.adminProductService;
    const available = await adminProductService.checkSkuPrefixAvailable(prefix, excludeId);
    return { success: true, available };
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error, "ACTION_PRODUCT_UPDATE_FAILED") };
  }
}
