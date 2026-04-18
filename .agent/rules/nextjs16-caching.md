# Next.js 16: Next-Gen Caching and Prerendering Guide

This reference outlines the modern caching capabilities introduced in Next.js 15/16 (specifically the `cacheComponents` experimental flag and `'use cache'` directive) and how to resolve the common **"Uncached data was accessed outside of `<Suspense>`"** build errors.

## 1. The Caching Paradigm Shift

Next.js 15+ has moved away from implicit, aggressive caching to an **opt-in** model.
When `experimental.cacheComponents: true` is enabled in `next.config.ts`, the framework attempts to aggressively prerender the application shell ahead-of-time (Partial Prerendering / PPR).

Because of this, any access to **runtime data** (uncached data) during the HTML generation phase will cause Next.js to abort the static prerender for that route or throw an error.

## 2. The "Uncached data" Error

### Error Signature

`Error: Route "/path": Uncached data was accessed outside of <Suspense>. This delays the entire page from rendering, resulting in a slow user experience.`

### What Triggers It?

During the prerender phase at build time, Next.js executes the Server Components to generate a static HTML shell. If the code accesses any of the following APIs outside of a localized boundary, the build fails:

1. `cookies()` or `headers()`
2. Awaiting `searchParams` in a Server Component.
3. `useSearchParams()` inside a Client Component.
4. Third-party packages (like `next-intl`'s `getLocale()`) that internally call `headers()` or `cookies()`.

## 3. How to Resolve Prerender Blockage

### Solution A: Wrap dynamic access in `<Suspense>`

If a Component (Server or Client) awaits `searchParams` or calls `useSearchParams()`, it **must** be rendered inside a `<Suspense>` boundary.

```tsx
// ❌ WRONG: Awaiting searchParams at the root page level
export default async function Page({ searchParams }) {
  const query = await searchParams; // Throws error!
  return <div>{query.q}</div>;
}

// ✅ RIGHT: Wrap the dynamic part in Suspense
export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<Spinner />}>
      <DynamicContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DynamicContent({ searchParams }) {
  const query = await searchParams; // OK! Safely suspended.
  return <div>{query.q}</div>;
}
```

### Solution B: Fix Unintended Layout Violations

Sometimes the error occurs in a `layout.tsx` (like the global `app/layout.tsx`).

- **Problem:** `app/layout.tsx` runs for _all_ routes, including `_not-found`. If it calls `getLocale()` (which reads headers), it will block static generation.
- **Fix:** Ensure layouts do not read headers if they are meant to support static `not-found` pages. Use fallback values (e.g., `routing.defaultLocale`).

## 4. The `'use cache'` Directive

To cache expensive data access (e.g., Database calls or external APIs) so it can be safely used without dynamic suspension, use `'use cache'`.

```typescript
import { cacheLife, cacheTag } from "next/cache";

export async function getSchoolListData(locale: string, code: string) {
  "use cache";
  cacheTag(`school-list-${code}`);
  cacheLife("hours");
  return await getBackendData(locale, code); // ✅ Safe!
}
```

### Critical Limitations of `'use cache'`

You **cannot** call dynamic APIs (`cookies()`, `headers()`) inside a function marked with `'use cache'`. Pass dynamic values (like `userId`) into the cached function as arguments.

## Summary Checklist for Outdated Agents:

1. **Never** use `export const dynamic = "force-dynamic"` if `cacheComponents` is enabled. It causes build failures.
2. Check all `layout.tsx` files. Avoid using `getLocale()` or `cookies()` natively in `app/layout.tsx`.
3. Separate dynamic queries (like reading `searchParams`) cleanly into a sub-component surrounded by `<Suspense>`.
4. Define standard abstraction layers in `/data/` directories using the `'use cache'` directive instead of implicit fetch caching.
