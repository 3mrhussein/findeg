import { z } from "zod";
import { PartialTranslationMapSchema } from "./Locale";
/**
 * Common media variant keys for responsive/product rendering.
 */
export const MediaVariantKeySchema = z.enum(["thumbnail", "card", "pdp", "zoom", "original"]);
export type MediaVariantKey = z.infer<typeof MediaVariantKeySchema>;

/**
 * Single media asset descriptor.
 */
export const MediaAssetSchema = z.object({
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  alt: PartialTranslationMapSchema.optional(),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;

/**
 * Responsive media payload keyed by variant role.
 */
export const ResponsiveMediaSetSchema = z
  .object({
    thumbnail: MediaAssetSchema.optional(),
    card: MediaAssetSchema.optional(),
    pdp: MediaAssetSchema.optional(),
    zoom: MediaAssetSchema.optional(),
    original: MediaAssetSchema.optional(),
  })
  .partial();
export type ResponsiveMediaSet = z.infer<typeof ResponsiveMediaSetSchema>;
