# @ui

Shared UI components library for FindEg dashboard and storefront applications.

## What's Included

### UI Primitives (35 components)

shadcn/ui components built on Radix UI - stored in `src/ui/`:

- **Form Controls**: Button, Input, Checkbox, Radio, Select, Switch, Slider, Textarea, Label
- **Data Display**: Badge, Avatar, Card, Table, Progress, Skeleton
- **Overlays**: Dialog, Sheet, Popover, Tooltip, Dropdown Menu, Accordion
- **Navigation**: Tabs, Sidebar
- **Feedback**: Toast, Alert Dialog
- **Utilities**: Form, Scroll Area, Separator, Collapsible, Carousel

### Shared Business Components (12 components)

Cross-app components - stored in `src/shared/`:

- **Layout**: Container, Grid, Header, Footer
- **UI Elements**: Icon, Logo, Price, Pagination
- **State**: EmptyState
- **Settings**: ToggleLanguage, ToggleTheme, NotificationBell

## Usage

```typescript
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
```

## What's NOT Included

**App-Specific Components** stay in their respective packages:

### Dashboard-Only (`packages/dashboard/src/components/shared/`)

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
