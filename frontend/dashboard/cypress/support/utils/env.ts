/**
 * Reads a Cypress env value through config-safe access.
 */
export function resolveCypressEnv(key: string, fallback = ''): string {
  const env = Cypress.config('env') as Record<string, unknown> | undefined;
  const value = env?.[key];
  if (typeof value === 'string' && value.length > 0) return value;
  return fallback;
}

/**
 * Parses or resolves the locale used for route helpers.
 */
export function parse(explicitLocale?: string): string {
  if (explicitLocale && explicitLocale.length > 0) return explicitLocale;
  return resolveCypressEnv('LOCALE', 'en');
}
