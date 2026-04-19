# @findeg/dashboard

The **FindEg Dashboard** is the administrative control plane used by staff to manage the marketplace. It is a strictly governed Next.js 16 application that consumes `@findeg/backend` services directly within Server Components and Server Actions.

## 🧭 Application Architecture

The dashboard heavily leverages the **Next.js App Router** `src/app/[locale]/admin/(dashboard)` paradigm. We follow a firm Server/Client boundary execution model.

### Route Inventory

| Route Path                   | Responsibility                                           | Server / Client             |
| ---------------------------- | -------------------------------------------------------- | --------------------------- |
| `/(dashboard)`               | Core shell layout wrapping authenticated routes.         | Server                      |
| `/(dashboard)/products`      | Listing view, utilizing `nuqs` for URL-driven filtering. | Server -> Client Params     |
| `/(dashboard)/products/new`  | Multi-tab complex form construction.                     | Client                      |
| `/(dashboard)/products/[id]` | Product detail view and mutation interface.              | Client Form + Server Action |

---

## 🛠️ Component Map & Form Management

We reject simple CRUD patterns in favor of rich UX using strict data boundaries.

### 1. Form Implementations

All complex forms (`ProductCreateForm`, `VariantMatrix`) are built using:

- `react-hook-form` coupled with `@hookform/resolvers/zod`.
- Zod schemas are provided directly by `@findeg/backend` (e.g., `UpdateProductZodSchema`). The frontend does NOT re-declare validation logic.

### 2. State & Actions

- **Server Actions**: Mutations (e.g., `createProductAction` in `actions.ts`) wrap `@findeg/backend` services. They handle the `ServiceResult` mapping standard.
- **Client Cache**: We utilize `swr` and `nuqs` for client-side data grids, ensuring real-time URL syncing without blowing away local cache.

### 3. Core UI Primitives

Built on [shadcn/ui](https://ui.shadcn.com/) and localized via `@findeg/ui`.

---

## 🎨 RTL & Theming Integrity

The FindEg Dashboard is fully localized into Arabic & English via `next-intl`.

- **RTL Integrity**: All Tailwind classes MUST use logical properties. Instead of `ml-4`, you must use `ms-4` (margin-inline-start). This ensures the dashboard physically mirrors perfectly when switching to Arabic.
- **Dark Mode**: Managed by `next-themes`. Any custom CSS variables must be tracked in the global `globals.css` properly mapped to HSL tokens.

---

## 🧪 Testing Strategy: Cypress E2E

The Dashboard relies on End-to-End browser simulation over unit tests since the business logic lives in the backend.

```bash
# Launch interactive Cypress to test UI interactions
pnpm e2e:open

# Run headless validations natively against the Dashboard UI
pnpm e2e:run:ci
```

**Golden Rule of Tests**: Do NOT select by CSS class (e.g., `.button-blue`). You MUST select elements via `data-cy` attributes (e.g., `[data-cy='submit-product-btn']`).

---

## 🚀 Development Workflow

### Startup

Since the dashboard fetches directly via server actions to the backend runtime, it operates cleanly on port 3001.

```bash
pnpm dev           # Start dashboard in dev mode on :3001
pnpm build         # Production compile
pnpm type-check    # Strict TS structural checks
```

---

&copy; 2026 FindEg.com. All rights reserved.
