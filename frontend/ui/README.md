# @ui

The **FindEg UI Library** acts as the foundational design system and component primitive registry across `@findeg/storefront` and `@findeg/dashboard`.

Built on top of [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), and [Tailwind CSS 4](https://tailwindcss.com/).

## 🎨 Theming & Tailwind Map

The global design tokens are driven exclusively by strictly mapping HSL color spaces within `src/styles/globals.css`.

- **Colors**:
  - `--primary`: The base FindEg brand color.
  - `--background`, `--card`, `--popover`: The background shades adjusting per dark mode.
  - `--accent`: The alternate highlight state for hover calls.
- **Typography Strategy**:
  - `English`: Inter/System sans-serif.
  - `Arabic`: Auto-injected **Cairo** font to gracefully handle script legibility.

---

## 🏗️ Shadcn Component Adoption Inventory

| Category           | Components Available via `@findeg/ui`                      |
| ------------------ | ---------------------------------------------------------- |
| Layout & Structure | `Card`, `Separator`, `AspectRatio`, `ScrollArea`           |
| Navigation Flow    | `Tabs`, `Accordion`, `Breadcrumbs`, `DropdownMenu`         |
| Active Forms       | `Button`, `Input`, `Checkbox`, `Select`, `Label`, `Switch` |
| Data & Diagnostics | `Table`, `Badge`, `Progress`                               |
| Feedback overlays  | `Skeleton`, `Toast`, `Dialog`, `Sheet`                     |

---

## 🌍 RTL Compliance Policy

RTL relies purely on the browser's direction interpretation of **Tailwind Logical Properties**.

### DO's and DON'Ts

- ❌ **DON'T**: `pl-4` (padding left)
- ✅ **DO**: `ps-4` (padding inline start)
- ❌ **DON'T**: `mr-2` (margin right)
- ✅ **DO**: `me-2` (margin inline end)
- ❌ **DON'T**: `border-l-2` (border left)
- ✅ **DO**: `border-s-2` (border start)

By adhering to logic bindings, the components effortlessly swap orientations when `dir="rtl"` is provided via `next-intl`.

---

## 🚀 Consumption Guidelines

Directly import these primitives in consumer apps (storefront/dashboard). The build system transpiles the utility merging automatically via `tailwind-merge` and `clsx`.

```typescript
<<<<<<< HEAD
// Import any component
import { Button, Dialog, Container, Price } from "@ui";

function MyComponent() {
  return (
    <Container>
      <Dialog>
        <Button>Click me</Button>
        <Price amount={99.99} currency="EGP" />
      </Dialog>
    </Container>
  );
}
=======
// Good - Imports cleanly from the workspace
import { Button, Card, CardHeader, CardTitle } from "@findeg/ui";
>>>>>>> 006-docs-restructure
```

### Extending UI

Any new component added to `ui` must be tested for strict typescript types and RTL behavior before being consumed by `dashboard` or `storefront`.

---

<<<<<<< HEAD
- BilingualInput, BilingualTextarea (admin forms)
- CascadingCategoryPicker, StatusBadge, TagBadge, TagChips (admin tools)
- WebMCPBadge, HeaderNavClient (admin-specific)

### Storefront-Only (`packages/storefront/src/components/shared/`)

- ErrorPage, AdminAccessForbidden (customer pages)
- QuantitySelector (shopping cart)
- WebMCPInitializer, HeaderNavClient (storefront-specific)
- state/ directory (PageStateError, PageStateLoading, etc.)

### Layouts (Both Apps)

- Navbar, MegaMenuOverlay, MobileNavSheet, SearchBar remain app-specific

## Development

```bash
# Build
pnpm --filter @ui build

# Watch mode
pnpm --filter @ui dev

# Type check
pnpm --filter @ui type-check
```

## Adding Components

**Only add components used by BOTH apps:**

1. Verify actual usage in both dashboard AND storefront
2. Add component to `src/ui/` (shadcn) or `src/shared/` (business)
3. Export from `src/index.ts`
4. Rebuild: `pnpm --filter @ui build`
5. Update imports in both apps

## Analysis Methodology

Components were selected based on **actual import and usage analysis**, not file structure:

- Searched all imports in both apps
- Verified actual usage patterns
- Only shared truly common components
- Kept app-specific logic separate

See `specs/001-separate-admin-project/ui-package-refined-analysis.md` for details.
=======
&copy; 2026 FindEg.com. All rights reserved.
>>>>>>> 006-docs-restructure
