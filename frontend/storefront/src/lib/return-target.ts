/** Pick the first local return path, preserving the account fallback. */
export function safeReturnTarget(...values: (string | string[] | undefined | null)[]): string {
  const candidates = values.flatMap((value) => (Array.isArray(value) ? value : [value]));
  return (
    candidates.find(
      (value): value is string =>
        typeof value === 'string' &&
        value.startsWith('/') &&
        !value.startsWith('//') &&
        !value.includes('\\') &&
        !Array.from(value).some(
          (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
        ),
    ) ?? '/my-account'
  );
}
