/**
 * Centralized Slugify Utility
 *
 * Correctly processes strings (including Arabic/non-Latin characters) into URL-friendly slugs.
 * - Trims whitespace
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with single hyphens
 * - Removes leading/trailing hyphens
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Keep Arabic characters and numbers
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Specifically for English-only slugs (stripping non-Latin)
 */
export function slugifyEn(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
