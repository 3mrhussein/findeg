import { z } from "zod";
import { LocalizedStringDraftSchema } from "./Translation";
/**
 * Common media variant keys for responsive/product rendering.
 */
export const MediaVariantKeySchema = z.enum(["thumbnail", "card", "pdp", "zoom", "original"]);
/**
 * Single media asset descriptor.
 */
export const MediaAssetSchema = z.object({
    url: z.string().url(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    mimeType: z.string().optional(),
    alt: LocalizedStringDraftSchema.optional(),
});
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
