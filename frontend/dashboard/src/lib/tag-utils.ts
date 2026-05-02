/**
 * Utility to get the display name of a tag based on its key and locale.
 * This is a placeholder for the logic that was likely in the missing feature path.
 */
export function getTagDisplayName(key: string, locale: "en" | "ar"): string {
  // Simple title case for English, just return key for Arabic for now
  // In a real scenario, this might look up translations or handle specific keys
  if (locale === "en") {
    return key
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // For Arabic, we'd ideally have a mapping or the key would be translated
  return key;
}
