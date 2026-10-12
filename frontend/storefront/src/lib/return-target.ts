/** Pick the first local return path, preserving the account fallback. */
export function safeReturnTarget(...values: (string | undefined)[]): string {
  return (
    values.find(
      (value) =>
        value?.startsWith('/') &&
        !value.startsWith('//') &&
        !value.includes('\\') &&
        !Array.from(value).some(
          (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
        ),
    ) ?? '/my-account'
  );
}
