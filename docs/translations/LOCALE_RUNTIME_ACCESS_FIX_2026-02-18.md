# Locale Runtime Access Fix Log (2026-02-18)

## Context
During manual storefront navigation, Next.js 16 reported:

1. `Runtime data was accessed outside of <Suspense>`  
2. `used new Date() before accessing either uncached data or Request data`

Primary stack traces pointed to:

- `src/i18n/request.ts` (`requestLocale` resolution path)
- Shop layout shell components (`Header`, `Footer`)

## Goal
Stop implicit request-time locale resolution in layout-level server components and make locale access explicit, so route shells remain stream-friendly and compatible with Next.js blocking-route rules.

## Implicit vs Explicit Locale Access

### Definitions

1. Implicit locale access
   - Locale is inferred from request context at runtime.
   - Typical example: calling `getTranslations()` or `getMessages()` without passing `locale`.
   - Resolution can flow through request-bound config (`requestLocale` in `src/i18n/request.ts`).

2. Explicit locale access
   - Locale is passed directly from route params/context into i18n APIs.
   - Typical example: `getTranslations({ locale })`, `getMessages({ locale })`, provider `locale={typedLocale}`.
   - No hidden locale lookup in lower components.

### How Next.js treats both

1. Implicit (request-bound) path
   - Treated as runtime data usage if request data is needed to resolve locale.
   - In App Router with Cache Components, runtime data outside a proper `<Suspense>` boundary triggers blocking-route warnings.
   - Can reduce pre-render/prefetch effectiveness for route shells.

2. Explicit (param-driven) path
   - Keeps dependency graph clearer: route param -> layout/page -> component.
   - Works better with pre-renderable shells and streaming boundaries.
   - Still dynamic only where truly needed (e.g., `cookies()`/auth/session reads).

### Pros and cons

| Mode | Pros | Cons |
|---|---|---|
| Implicit | Less prop plumbing, quick to write, fine for purely request-scoped leaf components | Hidden runtime dependency, easier to trigger blocking-route warnings, less predictable rendering behavior |
| Explicit | Predictable data flow, safer with Next.js streaming/prerender, easier review/testing/typing | More wiring (passing `locale` through component boundaries), small upfront verbosity |

### When to use each

Use explicit locale access when:

1. Component is in layout shell (`layout`, header, footer, nav).
2. Component is reused across routes and should stay prefetch/prerender friendly.
3. You want stable behavior in production and E2E under streaming.
4. You are using awaitable `next-intl/server` APIs and already have route `params.locale`.

Use implicit locale access when:

1. Component is intentionally request-bound (depends on per-request runtime context).
2. It is inside a deeper boundary where streaming fallback is acceptable.
3. You are prototyping and consciously accepting temporary runtime coupling.

### Team rule applied in this patch

1. Layout shell components must use explicit locale.
2. Request-only concerns (auth/cart/session) may remain runtime-bound, but should stay in clearly isolated boundaries.

## What was changed

### 1) Root locale layout now passes explicit locale into i18n message loading
File:

- `src/app/[locale]/layout.tsx`

Changes:

1. `getMessages()` -> `getMessages({ locale: typedLocale })`
2. `<NextIntlClientProvider messages={messages}>` -> `<NextIntlClientProvider locale={typedLocale} messages={messages}>`

Why:
Avoid relying on implicit locale fallback that can trigger `requestLocale` access paths at runtime.

---

### 2) Shop layout passes locale explicitly to async shell components
File:

- `src/app/[locale]/(shop)/layout.tsx`

Changes:

1. Read `params.locale` and cast once to `typedLocale`.
2. Pass `typedLocale` to:
   - `<Header locale={typedLocale} />`
   - `<CategoryQuickNav locale={typedLocale} />`
   - `<Footer locale={typedLocale} />`
3. Keep shell pieces wrapped in `<Suspense>` fallbacks.

Why:
Prevents those server components from inferring locale from request internals and keeps runtime-data boundaries explicit.

---

### 3) Header and CategoryQuickNav locale contracts tightened
Files:

- `src/components/layout/Header.tsx`
- `src/components/layout/CategoryQuickNav.tsx`

Changes:

1. `locale` prop changed from `string` to `Locale` type.
2. Component logic now uses passed locale only.

Why:
Type-safe contract that avoids accidental reintroduction of implicit locale reads.

---

### 4) Footer translation lookup now uses explicit locale
File:

- `src/components/layout/Footer.tsx`

Changes:

1. Added prop interface: `{ locale: Locale }`
2. `getTranslations()` -> `getTranslations({ locale })`

Why:
Stops implicit locale resolution in the footer server component.

## Validation

Command run:

```bash
npm run type-check
```

Result: passed.

## Behavioral intent (review checklist)

Expected outcome after these changes:

1. Fewer/no blocking-route warnings originating from locale resolution in the layout shell.
2. No functional locale change for end users (EN/AR behavior should remain the same).
3. Safer future refactors because locale dependency is explicit in component APIs.

## Rollback options

### Option A: Full rollback of this locale-runtime patch set

Revert only these files:

1. `src/app/[locale]/layout.tsx`
2. `src/app/[locale]/(shop)/layout.tsx`
3. `src/components/layout/Footer.tsx`
4. `src/components/layout/Header.tsx`
5. `src/components/layout/CategoryQuickNav.tsx`

---

### Option B: Partial rollback (if you want mixed behavior)

1. Keep `getMessages({ locale: typedLocale })` in root layout (recommended to keep).
2. Revert only shop shell prop changes (`Header`, `Footer`, `CategoryQuickNav`) if needed for compatibility checks.

## Notes

1. `params` in Next layout remains typed as `Promise<{ locale: string }>` for compatibility with generated Next types.
2. The cast to `Locale` is localized in shop layout to keep type-check stable.
3. Root layout still guards locale validity via `hasLocale(...)` + `notFound()`.

## References

1. Next.js blocking-route warning: https://nextjs.org/docs/messages/blocking-route
2. Next.js prerender current-time warning: https://nextjs.org/docs/messages/next-prerender-current-time
3. Next.js dynamic/runtime data model (cookies/headers/searchParams): https://nextjs.org/docs/app/building-your-application/data-fetching
4. next-intl request config (`requestLocale`) and locale resolution: https://next-intl.dev/docs/usage/configuration
5. next-intl explicit locale usage with awaitable server APIs: https://next-intl.dev/docs/environments/actions-metadata-route-handlers
