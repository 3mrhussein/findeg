import { z } from "zod";
import {
  IdSchema,
  PriceSchema,
  SkuSchema,
  QuantitySchema,
} from "@/features/core/domain/types/common";

const ProductTranslationSchema = z.object({
  language: z.string().min(2),
  name: z.string().min(2),
  description: z.string(),
  longDescription: z.string(),
});

export const ProductInputSchema = z.object({
  sku: SkuSchema,
  price: PriceSchema,
  strikePrice: PriceSchema.optional(),
  categoryId: IdSchema.optional(),
  category: z.string().optional(),
  brandId: IdSchema.optional(),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional().default(true),
  stockQuantity: QuantitySchema.optional().default(0),
  lowStockThreshold: QuantitySchema.optional().default(10),
  isNew: z.boolean().optional().default(false),
  variants: z.record(z.string(), z.unknown()).optional(),
  translations: z.array(ProductTranslationSchema).min(1, "At least one translation is required"),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;
