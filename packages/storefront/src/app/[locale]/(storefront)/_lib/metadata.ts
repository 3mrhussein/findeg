import type { Metadata } from "next";

const SEO_DESCRIPTION_MAX_LENGTH = 160;

interface BuildPageMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  robots?: Metadata["robots"];
}

/**
 * Creates route-level metadata with a shared structure for public storefront pages.
 */
export function buildPageMetadata({
  title,
  description,
  keywords,
  robots,
}: BuildPageMetadataParams): Metadata {
  return {
    title,
    description: toMetaDescription(description),
    keywords,
    robots,
    openGraph: {
      title,
      description: toMetaDescription(description),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: toMetaDescription(description),
    },
  };
}

/**
 * Keeps metadata descriptions concise for search snippets.
 */
function toMetaDescription(value: string): string {
  if (value.length <= SEO_DESCRIPTION_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, SEO_DESCRIPTION_MAX_LENGTH - 1)}...`;
}
