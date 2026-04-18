# @findeg/storefront

The **FindEg Storefront** is the flagship B2C and B2B customer-facing application. Built strictly strictly on the Next.js 16 App Router, it heavily utilizes React Server Components (RSC) to bypass client-side fetching overhead and optimize for SEO and performance boundaries.

## 🧭 Application Architecture & Route Tree

The Storefront routes are scoped directly mapped to B2C shopping and B2B school list procurement flows.

### Page Inventory & Rendering Strategy

| Route Path        | Responsibility                                            | Fetching Strategy                 |
| ----------------- | --------------------------------------------------------- | --------------------------------- |
| `/`               | Landing page showcasing hero banners and top collections. | Static (ISR refreshed)            |
| `/search`         | Main listing catalog.                                     | Server (PPR enabled for grid)     |
| `/product/[slug]` | Product details and variant selector.                     | Static generation + ISR           |
| `/cart`           | Shopping basket.                                          | Dynamic Server + Client mutations |
| `/checkout`       | Stepped fulfillment flow.                                 | Strict Dynamic                    |
| `/schools/[slug]` | Secure access for B2B lists via tokens.                   | Dynamic + Middleware guarded      |

## 📦 Feature Map

The storefront application orchestrates React components grouped into features that wrap backend data fetching.

| Feature Module                                            | Business Action                    | Key Components                      |
| --------------------------------------------------------- | ---------------------------------- | ----------------------------------- |
| [**Catalog**](src/features/catalog/README.md)             | Browsing and searching items.      | `ProductCard`, `SearchFilters`      |
| [**Cart**](src/features/cart/README.md)                   | Assembling order intents.          | `CartSidebar`, `CartSummary`        |
| [**Order**](src/features/order/README.md)                 | Checkout and post-purchase ledger. | `CheckoutFlow`, `OrderHistoryTable` |
| [**Review**](src/features/review/README.md)               | Displaying UGC ratings.            | `StarRating`, `ReviewList`          |
| [**School**](src/features/school/README.md)               | B2B bundled procurement flows.     | `SchoolKitBundle`, `AccessGateway`  |
| [**Notifications**](src/features/notifications/README.md) | Client-side toasts/websockets.     | `ToastProvider`, `InboxDropdown`    |

---

## 🛠️ Data Hydration & Server Components

- **Rule #1: Server First**: Components must default to server components (`async function ComponentName()`).
- **Rule #2: Push Client Margins**: Only wrap deep leaves with `"use client"` when interactivity is strictly required (e.g., `<VariantSelector>`).
- **Rule #3: Server Actions for Mutations**: Form submissions and state changes MUST hit `@findeg/backend` services via a Next.js Server Action (`'use server'`).

---

## 🎨 Styling, RTL & i18n

- **Arabic Layouts Natively**: Storefront is built completely RTL-aware using `next-intl` configuration.
- Do NOT use physical layout strings (`ml-4`). Use **logical parameters** (`ms-4`) enforced via `@findeg/ui` standards.
- **Translations Structure**: `src/features/core/infrastructure/cms/messages/`
  - English (`en.json`), Arabic (`ar.json`).

---

## 🧪 Testing Strategy

Given the Storefront depends on server actions, logic testing is handled via backend Vitest, while Storefront relies heavily on **UI flow validation** via Cypress.

```bash
# E2E runs covering 'AddToCart', 'Checkout', 'Login'
pnpm e2e:run
```

---

## 🚀 Development Workflow

```bash
pnpm dev           # Start on :3000
pnpm type-check    # Strict TS structural checks across standard boundaries
pnpm build         # Next.js export production compilation
```

---

&copy; 2026 FindEg.com. All rights reserved.
