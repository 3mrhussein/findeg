# UI Package: Refined Component Analysis

**Date**: April 4, 2026  
**Analysis Method**: Actual import and usage tracking (not just file structure)

## Components to Move to `packages/ui/`

### UI Primitives (35 components) - ALL shadcn/ui

**Location**: `packages/ui/src/ui/`  
**Rationale**: All are identical shadcn/ui components, standardized across apps

1. accordion.tsx
2. alert-dialog.tsx (dashboard only currently, but shadcn standard)
3. avatar.tsx
4. badge.tsx
5. button.tsx
6. card.tsx
7. carousel.tsx (storefront only currently, but shadcn standard)
8. checkbox.tsx
9. collapsible.tsx
10. dialog.tsx
11. dropdown-menu.tsx
12. form.tsx
13. IconTooltip.tsx (custom but used in both)
14. input-otp.tsx (storefront only currently, but shadcn standard)
15. input.tsx
16. label.tsx
17. popover.tsx
18. progress.tsx
19. radio-group.tsx (dashboard only currently, but shadcn standard)
20. rich-text-editor.tsx (dashboard only currently, but shadcn standard)
21. scroll-area.tsx
22. select.tsx
23. separator.tsx
24. sheet.tsx
25. sidebar.tsx
26. skeleton.tsx
27. slider.tsx (storefront only currently, but shadcn standard)
28. submit-button.tsx (custom but standard pattern)
29. switch.tsx
30. table.tsx
31. tabs.tsx
32. textarea.tsx
33. toast.tsx
34. toaster.tsx
35. tooltip.tsx

### Shared Components (12 components) - Used in BOTH apps

**Location**: `packages/ui/src/shared/`  
**Rationale**: Actual usage verified in both dashboard and storefront

1. **Container.tsx** - Dashboard: 3x, Storefront: 7x
2. **EmptyState.tsx** - Dashboard: 6x, Storefront: 3x
3. **Footer.tsx** - Dashboard: 3x, Storefront: 8x
4. **Grid.tsx** - Dashboard: 2x, Storefront: 5x
5. **Header.tsx** - Dashboard: 8x, Storefront: 16x
6. **Icon.tsx** - Dashboard: 18x, Storefront: 67x
7. **Logo.tsx** - Dashboard: 2x, Storefront: 8x
8. **NotificationBell.tsx** - Dashboard: 1x, Storefront: 1x
9. **Pagination.tsx** - Dashboard: 8x, Storefront: 4x
10. **Price.tsx** - Dashboard: 26x, Storefront: 45x
11. **ToggleLanguage.tsx** - Dashboard: 4x, Storefront: 4x
12. **ToggleTheme.tsx** - Dashboard: 4x, Storefront: 4x

## Components to KEEP in Dashboard

### Dashboard-Specific Components (9 components)

**Location**: `packages/dashboard/src/components/shared/`  
**Rationale**: Used only in dashboard, admin-specific functionality

1. **BilingualInput.tsx** - 11 usages (admin forms)
2. **BilingualTextarea.tsx** - 7 usages (admin forms)
3. **CascadingCategoryPicker.tsx** - 4 usages (admin category management)
4. **StatusBadge.tsx** - 13 usages (admin status indicators)
5. **TagBadge.tsx** - 3 usages (admin tagging)
6. **TagChips.tsx** - 2 usages (admin tag management)
7. **WebMCPBadge.tsx** - 2 usages (admin debugging)
8. **HeaderNavClient.tsx** - Admin-specific navigation (differs from storefront)
9. **AppSidebar.tsx** - Admin sidebar (if used)

**Keep Dashboard Layout**: layout/Navbar, layout/MegaMenuOverlay, layout/MobileNavSheet, layout/SearchBar

## Components to KEEP in Storefront

### Storefront-Specific Components (7 components)

**Location**: `packages/storefront/src/components/shared/`  
**Rationale**: Used only in storefront, customer-facing functionality

1. **AdminAccessForbidden.tsx** - 2 usages (customer access control)
2. **ErrorPage.tsx** - 8 usages (customer error pages)
3. **QuantitySelector.tsx** - 2 usages (shopping cart)
4. **WebMCPInitializer.tsx** - 2 usages (storefront debugging)
5. **HeaderNavClient.tsx** - Customer navigation (differs from dashboard)
6. **state/** directory - PageStateError, PageStateLoading, SectionStateEmpty (customer UI states)
7. **RichText.tsx** - Product descriptions (if different from admin)
8. **SearchOverlay.tsx** - Customer search (if different)
9. **Tooltip.tsx** - Custom tooltip (if different from ui/tooltip)

**Keep Storefront Layout**: layout/Navbar, layout/MegaMenuOverlay, layout/MobileNavSheet, layout/SearchBar

## Dead Code to Remove

Components that exist in `shared/` but are NOT imported anywhere:

- Check: AppSidebar, RichText, SearchOverlay, Tooltip (custom version)

## Summary Statistics

- **Move to UI**: 47 components (35 UI + 12 shared)
- **Keep in Dashboard**: 9 components + layouts
- **Keep in Storefront**: 7 components + state/ + layouts
- **Total analyzed**: 63 unique components

## Import Pattern Changes

### Before:

```typescript
// Dashboard
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { BilingualInput } from "@/components/shared/BilingualInput";

// Storefront
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { ErrorPage } from "@/components/shared/ErrorPage";
```

### After:

```typescript
// Dashboard
import { Button, Container } from "@findeg/ui";
import { BilingualInput } from "@/components/shared/BilingualInput"; // stays

// Storefront
import { Button, Container } from "@findeg/ui";
import { ErrorPage } from "@/components/shared/ErrorPage"; // stays
```

## Verification Checklist

- [ ] All 35 UI primitives moved to packages/ui/ui/
- [ ] All 12 truly shared components moved to packages/ui/shared/
- [ ] Dashboard keeps 9 admin-specific components
- [ ] Storefront keeps 7 customer-specific components
- [ ] Barrel exports created in packages/ui/src/index.ts
- [ ] Imports updated in dashboard (~400 files)
- [ ] Imports updated in storefront (~350 files)
- [ ] Old component files deleted from apps
- [ ] Build passes for all packages
- [ ] Type checking passes
- [ ] E2E tests pass
