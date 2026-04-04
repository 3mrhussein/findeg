# UI Package Analysis: Shared Component Extraction

**Date**: April 4, 2026  
**Task**: Create `packages/ui/` for truly shared React components

## Analysis Results

### Components to Move to `packages/ui/`

#### 1. UI Primitives (35 components) - ALL IDENTICAL

All shadcn/ui primitives are identical between dashboard and storefront:

- accordion.tsx
- alert-dialog.tsx
- avatar.tsx
- badge.tsx
- button.tsx
- card.tsx
- carousel.tsx
- checkbox.tsx
- collapsible.tsx
- dialog.tsx
- dropdown-menu.tsx
- form.tsx
- IconTooltip.tsx
- input-otp.tsx
- input.tsx
- label.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- rich-text-editor.tsx
- scroll-area.tsx
- select.tsx
- separator.tsx
- sheet.tsx
- sidebar.tsx
- skeleton.tsx
- slider.tsx
- submit-button.tsx
- switch.tsx
- table.tsx
- tabs.tsx
- textarea.tsx
- toast.tsx
- toaster.tsx
- tooltip.tsx

#### 2. Shared Components (28 components) - ALL IDENTICAL except 1

**Move to packages/ui/shared/:**

- AdminAccessForbidden.tsx
- AppSidebar.tsx
- BilingualInput.tsx
- BilingualTextarea.tsx
- CascadingCategoryPicker.tsx
- Container.tsx
- EmptyState.tsx
- ErrorPage.tsx
- Footer.tsx
- Grid.tsx
- Header.tsx
- Icon.tsx
- Logo.tsx
- NotificationBell.tsx
- Pagination.tsx
- Price.tsx
- QuantitySelector.tsx
- RichText.tsx
- SearchOverlay.tsx
- state/ (directory)
- StatusBadge.tsx
- TagBadge.tsx
- TagChips.tsx
- ToggleLanguage.tsx
- ToggleTheme.tsx
- Tooltip.tsx
- WebMCPBadge.tsx
- WebMCPInitializer.tsx

**Keep in each app (app-specific):**

- HeaderNavClient.tsx (differs between apps - dashboard has admin-specific nav)

### Components to Keep in Apps

#### Dashboard-specific (`packages/dashboard/src/components/`)

- layout/Navbar.tsx (admin-specific navigation)
- layout/MegaMenuOverlay.tsx (admin-specific)
- layout/MobileNavSheet.tsx (admin-specific)
- layout/SearchBar.tsx (admin-specific)
- shared/HeaderNavClient.tsx (admin-specific)

#### Storefront-specific (`packages/storefront/src/components/`)

- layout/Navbar.tsx (customer-facing navigation)
- layout/MegaMenuOverlay.tsx (customer-facing)
- layout/MobileNavSheet.tsx (customer-facing)
- layout/SearchBar.tsx (customer-facing)
- shared/HeaderNavClient.tsx (customer-facing)

## Implementation Plan

### Phase 1: Create UI Package Structure

```
packages/ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts (barrel export)
│   ├── ui/ (primitives)
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   └── ... (all 35 primitives)
│   └── shared/ (cross-cutting components)
│       ├── BilingualInput.tsx
│       ├── Container.tsx
│       └── ... (28 shared components)
└── README.md
```

### Phase 2: Package Configuration

- TypeScript config with JSX support
- React & React-DOM as peer dependencies
- Export all components via barrel exports
- Tailwind CSS config inheritance

### Phase 3: Move Components

1. Copy identical components to `packages/ui/`
2. Create barrel exports
3. Update imports in dashboard
4. Update imports in storefront
5. Delete duplicates from apps

### Phase 4: Import Updates

**Before:**

```typescript
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
```

**After:**

```typescript
import { Button, Container } from "@findeg/ui";
```

## Benefits

1. **Single Source of Truth**: UI components maintained in one place
2. **Consistency**: Guaranteed identical components across apps
3. **Bundle Size**: Shared components bundled once
4. **Development Speed**: Changes propagate to both apps
5. **Type Safety**: Shared types across packages

## Migration Impact

- **Files to move**: 63 components (35 UI + 28 shared)
- **Files to keep**: 10 components (5 per app - layout + HeaderNavClient)
- **Import statements to update**: ~300+ across both apps
- **Build time impact**: Minimal (already building 3 packages)

## Verification Checklist

- [ ] UI package builds successfully
- [ ] Dashboard imports from @findeg/ui
- [ ] Storefront imports from @findeg/ui
- [ ] No duplicate components in apps
- [ ] All builds pass
- [ ] E2E tests pass
- [ ] Type checking passes
