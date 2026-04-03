import { z } from "zod";
/**
 * Common media variant keys for responsive/product rendering.
 */
export declare const MediaVariantKeySchema: z.ZodEnum<{
    thumbnail: "thumbnail";
    card: "card";
    pdp: "pdp";
    zoom: "zoom";
    original: "original";
}>;
export type MediaVariantKey = z.infer<typeof MediaVariantKeySchema>;
/**
 * Single media asset descriptor.
 */
export declare const MediaAssetSchema: z.ZodObject<{
    url: z.ZodString;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    mimeType: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodObject<{
        en: z.ZodOptional<z.ZodString>;
        ar: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
/**
 * Responsive media payload keyed by variant role.
 */
export declare const ResponsiveMediaSetSchema: z.ZodObject<{
    thumbnail: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodObject<{
            en: z.ZodOptional<z.ZodString>;
            ar: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    card: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodObject<{
            en: z.ZodOptional<z.ZodString>;
            ar: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    pdp: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodObject<{
            en: z.ZodOptional<z.ZodString>;
            ar: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    zoom: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodObject<{
            en: z.ZodOptional<z.ZodString>;
            ar: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    original: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodObject<{
            en: z.ZodOptional<z.ZodString>;
            ar: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ResponsiveMediaSet = z.infer<typeof ResponsiveMediaSetSchema>;
