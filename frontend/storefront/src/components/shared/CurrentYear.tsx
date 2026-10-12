'use client';

/**
 * Client component to display current year without triggering Next.js
 * prerendering unstable date restrictions on server components.
 */
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}
