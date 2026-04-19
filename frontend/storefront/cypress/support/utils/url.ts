import { resolveLocale } from "./env";

/**
 * Returns locale-prefixed route path for E2E navigation.
 */
export function localePath(pathname: string, locale?: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${resolveLocale(locale)}${normalized}`;
}
