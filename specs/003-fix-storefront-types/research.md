# Research & Prototyping

No specific research paths or deep technical evaluations were required because the dependencies to be added (`drizzle-orm`, `resend`, `swr`, `@react-email/components`) are standard and already utilized heavily in other packages (`@backend`). The `@ui` export issue requires a routine diagnostic of `tsconfig.json` paths and includes.

## Decisions

- **Decision**: Propagate `ProductDetailPageData | null` up to the page caller.
- **Rationale**: Propagating `null` keeps the cached data fetcher pure from UI-layer Next.js specific throwing functions (`notFound()`), allowing callers more flexibility (e.g., custom empty state vs standard 404).
- **Alternatives considered**: Directly invoking `notFound()` inside the cached query. Rejected due to separation of concerns.
