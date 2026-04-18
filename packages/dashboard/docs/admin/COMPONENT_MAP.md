# Admin UI Component Map

**Last Updated:** March 14, 2026

This document provides a complete map of all admin UI components, their locations, purposes, and relationships.

---

## Component Directory Structure

```
src/app/[locale]/admin/
├── _components/
│   ├── shell/           # Admin shell & navigation
│   ├── shared/          # Admin-wide reusable components
│   ├── table/           # Enriched table pattern base
│   └── dashboard/       # Dashboard widgets & charts
├── (dashboard)/         # Route group for authenticated pages
│   ├── page.tsx         # Dashboard page
│   ├── products/        # Products section
│   ├── categories/      # Categories section
│   └── orders/          # Orders section
└── layout.tsx           # Admin layout wrapper
```

---

## Shell Components (Navigation & Layout)

### Location: `src/app/[locale]/admin/_components/shell/`

| Component | Purpose | Client/Server | Key Features |
|-----------|---------|---------------|--------------|
| **AdminShell.tsx** | Main layout container | Server | Sidebar + main content area, responsive |
| **AdminSidebar.tsx** | Left sidebar navigation | Server | Permission-based filtering, active states |
| **AdminHeader.tsx** | Top header bar | Server | Search, notifications, profile menu |
| **AdminBreadcrumb.tsx** | Breadcrumb trail | Server | Auto-generated from nav-config |
| **NavGroup.tsx** | Navigation group | Server | Collapsible group with icon |
| **NavItem.tsx** | Single navigation link | Server | Active state detection, permission check |
| **AdminShellWrapper.tsx** | Client wrapper | Client | Session provider integration |
| **nav-config.ts** | Navigation structure | Config | Permission-based nav tree |
| **useAdminPermissions.ts** | Permission hook | Client Hook | canView, canEdit, canDelete |

**Dependencies:**
- `nav-config.ts` → All nav components
- `useAdminPermissions` → Nav filtering
- `SessionProvider` → Permission checks

---

## Shared Components (Admin-Wide)

### Location: `src/app/[locale]/admin/_components/shared/`

| Component | Purpose | Client/Server | Props |
|-----------|---------|---------------|-------|
| **PageHeader.tsx** | Page title section | Client | title, description, count, actions |
| **EmptyState.tsx** | No data placeholder | Client | title, description, action |
| **ConfirmDialog.tsx** | Confirmation modal | Client | title, description, onConfirm, variant |
| **SlideOver.tsx** | Right panel drawer | Client | open, title, description, children |
| **TagChips.tsx** | Tag display | Client | tags, onClick |
| **StatusBadge.tsx** | Status indicator | Client | status, label, size |
| **RichText.tsx** | Rich text display | Client | content |
| **BulkActionsBar.tsx** | Bulk selection actions | Client | selectedCount, actions, onClear |
| **StockHealthBar.tsx** | Stock level indicator | Client | current, lowThreshold, maxThreshold |
| **MediaUpload.tsx** | Image upload component | Client | onUpload, maxFiles |
| **CollectionSelect.tsx** | Collection picker | Client | value, onChange, collections |

**Common Pattern:**
```typescript
<PageHeader
  title="Products"
  description="Manage your product catalog"
  count={totalProducts}
  actions={<Button>Create Product</Button>}
/>
```

---

## Table Components (Enriched Pattern Base)

### Location: `src/app/[locale]/admin/_components/table/`

| Component | Purpose | Client/Server | Description |
|-----------|---------|---------------|-------------|
| **EnrichedTable.tsx** | Table wrapper | Client | Consistent header, checkbox column |
| **EnrichedTableRow.tsx** | Base row component | Client | Compact/expanded states, selection |
| **TableFilters.tsx** | Filter controls | Client | Search, category, brand, status filters |
| **TablePagination.tsx** | Pagination controls | Client | Page navigation, rows per page |

**Usage Pattern:**
```typescript
<EnrichedTable
  columns={[
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ]}
  showCheckbox
  showExpand
>
  {items.map((item) => (
    <CustomRow key={item.id} item={item} />
  ))}
</EnrichedTable>
```

---

## Dashboard Components

### Location: `src/app/[locale]/admin/_components/dashboard/`

| Component | Purpose | Data Source | Chart Library |
|-----------|---------|-------------|---------------|
| **KpiCard.tsx** | Metric card | Props | - |
| **RevenueChart.tsx** | Revenue line chart | Props | Recharts |
| **OrderStatusChart.tsx** | Status pie chart | Props | Recharts |
| **RecentOrdersWidget.tsx** | Recent orders table | Props | - |
| **ActionRequiredWidget.tsx** | Alert widget | Props | - |
| **TopProductsWidget.tsx** | Top products list | Props | - |

**Dashboard Layout:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KpiCard title="Revenue" value="$12,345" change="+12%" />
  {/* ... more KPI cards */}
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <RevenueChart data={revenueData} />
  <OrderStatusChart data={statusData} />
</div>
```

---

## Products Section

### Location: `src/app/[locale]/admin/(dashboard)/products/`

#### List View Components (`_components/`)

| Component | Purpose | Type | Key Features |
|-----------|---------|------|--------------|
| **ProductsTable.tsx** | Main table wrapper | Container | Selection, bulk actions |
| **ProductRow.tsx** | Row orchestrator | Container | Manages compact/expanded state |
| **ProductCompact.tsx** | Compact row content | Presentation | Thumbnail, name, SKU, stock, status |
| **ProductExpanded.tsx** | Expanded row content | Presentation | Variants, tags, stock health, pricing |
| **ProductQuickActions.tsx** | Action menu | Client | Edit, duplicate, preview, copy SKU |

#### Edit Form Components (`[id]/edit/_components/`)

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| **ProductEditForm.tsx** | Two-column layout | All tabs + sidebar |
| **ProductFormSidebar.tsx** | Sticky sidebar | Status, category, brand |
| **ProductStatusBar.tsx** | Live/Draft indicator | - |
| **ProductFormTabs.tsx** | Tab navigation | URL sync |
| **InfoTab.tsx** | Basic info form | Bilingual inputs |
| **VariantsTab.tsx** | Variants management | Variant CRUD |
| **MediaTab.tsx** | Image upload | Media library |
| **PricingTab.tsx** | Pricing settings | Price inputs |
| **SeoTab.tsx** | SEO metadata | Meta tags |

**Component Flow:**
```
ProductsTable
  ├─→ ProductRow (per product)
  │     ├─→ ProductCompact (when collapsed)
  │     ├─→ ProductExpanded (when expanded)
  │     └─→ ProductQuickActions (hover menu)
  └─→ BulkActionsBar (when selection > 0)
```

---

## Categories Section

### Location: `src/app/[locale]/admin/(dashboard)/categories/`

| Component | Purpose | Pattern | Dependencies |
|-----------|---------|---------|--------------|
| **CategoryTree.tsx** | Hierarchical tree | Tree | @dnd-kit for drag-to-reorder |
| **CategoryRow.tsx** | Tree row item | Tree Node | Expand icon, drag handle, actions |
| **CategoryDrawer.tsx** | Create/edit form | Slide-Over | Bilingual form, parent select, icon picker |

**Tree Structure:**
```
CategoryTree
  ├─→ CategoryRow (root categories)
  │     ├─→ CategoryRow (children, recursive)
  │     └─→ Quick Actions (Edit, Add Child, Delete)
  └─→ CategoryDrawer (when creating/editing)
```

---

## Orders Section

### Location: `src/app/[locale]/admin/(dashboard)/orders/`

| Component | Purpose | Pattern | Key Features |
|-----------|---------|---------|--------------|
| **OrdersTable.tsx** | Main table wrapper | Enriched Table | Status tabs, bulk actions |
| **OrderStatusTabs.tsx** | Status filter tabs | Tab Navigation | URL sync, counts |
| **OrderRow.tsx** | Row orchestrator | Enriched Row | Compact/expanded states |
| **OrderTimeline.tsx** | Status visualization | Timeline | Vertical progress indicator |
| **OrderDetailDrawer.tsx** | Full order details | Slide-Over | Items, customer, shipping, notes |

**Component Flow:**
```
OrdersTable
  ├─→ OrderStatusTabs (filter by status)
  ├─→ OrderRow (per order)
  │     ├─→ Compact: Order #, customer, total, status
  │     └─→ Expanded: Items + OrderTimeline + actions
  ├─→ OrderDetailDrawer (when clicking "View Details")
  │     ├─→ Order items list
  │     ├─→ OrderTimeline
  │     ├─→ Shipping address
  │     └─→ Admin notes
  └─→ BulkActionsBar (Export, Cancel)
```

---

## Cross-Cutting Components

### Location: `src/components/shared/`

| Component | Purpose | Used In |
|-----------|---------|---------|
| **StatusBadge.tsx** | Status indicator | Products, Orders, Dashboard |
| **EmptyState.tsx** | No data state | All list views |

### Location: `src/components/ui/` (shadcn/ui primitives)

| Component | Description |
|-----------|-------------|
| **button.tsx** | Button variants |
| **dialog.tsx** | Modal/alert dialog |
| **sheet.tsx** | Slide-over panel (basis for SlideOver) |
| **tabs.tsx** | Tab navigation |
| **table.tsx** | Table primitives |
| **badge.tsx** | Small status indicators |
| **select.tsx** | Dropdown select |
| **input.tsx** | Text input |
| **checkbox.tsx** | Checkbox input |
| **tooltip.tsx** | Hover tooltips |

---

## Data Flow Patterns

### Products List
```
page.tsx (Server Component)
  ↓ fetch products
ProductsTable (Client Component)
  ↓ manage selection state
ProductRow (Client Component)
  ↓ manage expanded state
ProductCompact / ProductExpanded (Presentation)
```

### Categories Tree
```
page.tsx (Server Component)
  ↓ fetch categories
CategoryTree (Client Component)
  ↓ manage expanded IDs, drag state
CategoryRow (Client Component)
  ↓ recursive rendering
CategoryDrawer (Client Component)
  ↓ form state, server actions
```

### Orders List
```
page.tsx (Server Component)
  ↓ fetch orders
OrdersTable (Client Component)
  ↓ manage selection, drawer state
  ├─→ OrderStatusTabs (filter state → URL)
  ├─→ OrderRow (Client Component)
  │     ↓ manage expanded state
  └─→ OrderDetailDrawer (modal state)
```

---

## Server Actions Integration

Each section has corresponding server actions:

| Section | Location | Actions |
|---------|----------|---------|
| Products | `features/catalog/application/actions/product.ts` | create, update, delete, bulkUpdate |
| Categories | `features/catalog/application/actions/category.ts` | create, update, delete, reorder |
| Orders | `features/order/application/actions/order.ts` | updateStatus, updatePaymentStatus, addNote |

**Usage Pattern:**
```typescript
import { updateProductAction } from "@features/catalog/application/actions/product";

async function handleSave(data: ProductInput) {
  const result = await updateProductAction(productId, data);
  if (result.success) {
    toast.success("Product updated");
  }
}
```

---

## State Management Patterns

### Local Component State
- Expand/collapse states → `useState<boolean>`
- Selection sets → `useState<Set<string>>`
- Modal open states → `useState<boolean>`

### URL State (Search Params)
- Filters → `?category=X&status=Y`
- Tabs → `?tab=variants`
- Page → `?page=2`
- Status → `?status=pending`

### Form State
- React Hook Form for all forms
- Zod schemas for validation
- useFormState for submission states

---

## Performance Optimizations

| Component | Optimization | Reason |
|-----------|-------------|--------|
| EnrichedTable | Virtualization (future) | Large lists (>100 items) |
| ProductsTable | useMemo for filtered data | Avoid re-filtering on every render |
| OrdersTable | useMemo for status counts | Expensive calculation |
| All Forms | useCallback for handlers | Prevent child re-renders |
| All Lists | key={item.id} | React reconciliation |

---

## Testing Considerations

### Unit Tests
- Presentation components (Compact, Expanded) → snapshot tests
- Utility functions → jest tests
- Permission hooks → React Testing Library

### Integration Tests
- Enriched table expand/collapse → Cypress
- Bulk selection flow → Cypress
- Form submission → Cypress
- Drag-to-reorder → Cypress

### E2E Tests
- Create product flow → Cypress
- Edit category → Cypress
- Update order status → Cypress

---

## Component Dependencies Graph

```
AdminShell
  ├── AdminSidebar
  │     ├── NavGroup
  │     └── NavItem
  ├── AdminHeader
  └── AdminBreadcrumb

ProductsTable
  ├── EnrichedTable
  ├── ProductRow
  │     ├── ProductCompact
  │     ├── ProductExpanded
  │     └── ProductQuickActions
  └── BulkActionsBar

CategoryTree
  ├── CategoryRow (recursive)
  └── CategoryDrawer
        ├── BilingualInput
        └── IconPicker

OrdersTable
  ├── OrderStatusTabs
  ├── EnrichedTable
  ├── OrderRow
  │     └── OrderTimeline
  ├── OrderDetailDrawer
  │     └── OrderTimeline
  └── BulkActionsBar
```

---

## Component Sizing Guide

| Component | Lines of Code | Complexity | Dependencies |
|-----------|---------------|------------|--------------|
| AdminShell | ~150 | Low | 5 children |
| ProductsTable | ~120 | Medium | 4 children |
| ProductRow | ~250 | High | 2 children, state management |
| CategoryTree | ~180 | High | @dnd-kit, recursive |
| OrdersTable | ~150 | Medium | 5 children |
| EnrichedTable | ~100 | Low | shadcn/ui Table |

**Total Components Created:** 62 files across all phases
**Total Lines of Code:** ~8,000 (including documentation)

---

## Migration Notes

If updating from old components:

### Products
- Old: `ProductTable/` directory with separate components
- New: `_components/ProductsTable.tsx` with enriched pattern
- **Migration:** Replace imports, update to new pattern

### Categories
- Old: Flat list with edit modal
- New: Hierarchical tree with drag-to-reorder
- **Migration:** Update category data fetching, add parent relationships

### Orders
- Old: `OrderTable/` with inline status selects
- New: `_components/OrdersTable.tsx` with status tabs
- **Migration:** Update order list page, add status filtering

---

## Future Enhancements

Planned additions to the component library:

- [ ] Virtual scrolling for EnrichedTable (>1000 items)
- [ ] Advanced filtering component (multi-select, ranges)
- [ ] Export wizard (CSV, Excel, PDF)
- [ ] Bulk edit drawer (edit multiple items at once)
- [ ] Activity timeline widget (audit log visualization)
- [ ] Keyboard shortcuts overlay (help panel)
- [ ] Dark mode support (design tokens ready)
- [ ] Component storybook (for documentation)

---

## Getting Help

- **Design patterns:** See `DESIGN_PATTERNS.md`
- **Navigation:** See `NAVIGATION.md`
- **Architecture:** See `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- **Component placement:** See `docs/development/component-placement.md`
