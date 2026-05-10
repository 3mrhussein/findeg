/**
 * Shared API query defaults/builders for Cypress tests.
 */
export const API_QUERY_DEFAULTS = {
  language: 'en',
  largeListLimit: 500,
  singleItemLimit: 1,
  rootsType: 'roots',
} as const;

type QueryValue = string | number | boolean | undefined | null;

export function buildApiUrl(basePath: string, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
