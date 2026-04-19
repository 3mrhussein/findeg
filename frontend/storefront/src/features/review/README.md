# Storefront Review Feature

The **Storefront Review Feature** orchestrates User-Generated Content natively via Next.js components preventing hydration layout shifts and preserving PDP integrity.

## 🎯 Technical Responsibilities

- **RSC Aggregation**: Fetching pre-calculated star review breakdowns safely on the server alongside the Product detail load.
- **Progressive Enhancement**: Ensuring the `<form>` wrapping the review submission operates purely on standard web APIs before React hydrates.

---

## 🏗️ UI Architecture

### Presentation Strictness

- **`ReviewList`**: Highly cacheable RSC block utilizing `Suspense` thresholds so massive review sets don't block main product rendering.
- **`SubmitReviewForm`**: Uses `useActionState` connecting directly to `@findeg/backend/features/review` to append UGC data.

---

## 🔐 Boundaries & Constraints

- **Anti-Spam Revalidation**: Upon successful review submission via the Server Action, Next.js MUST `revalidatePath` for the specific product slug to instantly flush the cached review score on Edge nodes.

---

&copy; 2026 FindEg.com
