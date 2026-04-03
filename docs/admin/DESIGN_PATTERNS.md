# Admin UI Design Patterns

**Last Updated:** March 14, 2026

## Overview

The FindEg admin interface follows a consistent set of design patterns to ensure predictability and maintainability. This document outlines the core patterns used across all admin pages.

---

## 1. Enriched Table Pattern

**Used in:** Products, Orders, Inventory

### Pattern Structure
```
┌─────────────────────────────────────────────┐
│ [☐] [>] Compact Row Content                │ ← Click to expand
├─────────────────────────────────────────────┤
│         Expanded Content (detailed)         │ ← Slides down
└─────────────────────────────────────────────┘
```

### Key Components
- `EnrichedTable` - Table wrapper with consistent header structure
- `EnrichedTableRow` - Base row component supporting compact/expanded states
- Feature-specific row components (ProductRow, OrderRow, etc.)

### Compact State
Shows essential information in a single line:
- Checkbox for selection
- Expand/collapse icon
- 4-6 key data points
- Status badge
- Quick actions menu (optional)

### Expanded State
Shows detailed information below the compact row:
- Full item details
- Related data (variants, items, etc.)
- Additional metadata
- Action buttons

### Implementation Example
```typescript
// products/_components/ProductRow.tsx
<EnrichedTableRow
  id={product.id}
  isSelected={isSelected}
  isExpanded={isExpanded}
  onSelectChange={onSelect}
  onToggle={() => setIsExpanded(!isExpanded)}
  compactContent={<ProductCompact product={product} />}
  expandedContent={<ProductExpanded product={product} />}
/>
```

### Benefits
- Reduces initial visual clutter
- Allows progressive disclosure
- Maintains scanability
- Supports bulk operations

---

## 2. Slide-Over Drawer Pattern

**Used in:** Categories, Order Details, Admin User Management

### Pattern Structure
```
Screen → [Trigger] → SlideOver Panel (Right Side)
```

### Key Features
- Slides in from the right (LTR) or left (RTL)
- Overlay backdrop dims main content
- Close via X button, backdrop click, or ESC key
- Scrollable content area
- Sticky header with title/description

### Use Cases
- **Forms:** Create/edit operations (CategoryDrawer)
- **Details:** View full information (OrderDetailDrawer)
- **Quick Actions:** Lightweight operations without page navigation

### Implementation Example
```typescript
<SlideOver
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Edit Category"
  description="Update category information"
>
  <CategoryForm category={category} />
</SlideOver>
```

### When to Use
✅ Use Slide-Over when:
- Operation is secondary to main view
- User needs to reference main content while editing
- Form is relatively short (<10 fields)
- Creating child items from parent view

❌ Don't use Slide-Over when:
- Complex multi-step wizard is needed
- User needs full screen real estate
- Form has many fields requiring full page layout

---

## 3. Two-Column Layout Pattern

**Used in:** Product Edit Page

### Pattern Structure
```
┌──────────────────────────┬───────────┐
│                          │  Sidebar  │
│     Main Content         │  (Sticky) │
│     (Tabs/Forms)         │           │
│                          │  Status   │
│                          │  Summary  │
│                          │  Actions  │
└──────────────────────────┴───────────┘
     65%                      35%
```

### Key Features
- **Main Area (65%):** Tabbed content, forms, media
- **Sidebar (35%):** Status, quick info, actions, sticky positioning
- Responsive: Stacks vertically on mobile

### Sidebar Elements
1. **Status Bar:** Live/Draft indicator with last saved time
2. **Quick Info:** Category, brand, metadata
3. **Summary Cards:** Variant count, stock status
4. **Actions:** Primary actions (Save, Publish, Delete)

### Implementation Example
```typescript
<ProductEditForm>
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
    {/* Main Content */}
    <div>
      <ProductFormTabs />
    </div>
    
    {/* Sticky Sidebar */}
    <div className="lg:sticky lg:top-6 h-fit">
      <ProductFormSidebar />
    </div>
  </div>
</ProductEditForm>
```

---

## 4. Status Tab Navigation Pattern

**Used in:** Orders

### Pattern Structure
```
[ All (145) ] [ Pending (23) ] [ Confirmed (45) ] [ Shipped (12) ]
─────────────────────────────────────────────────────────────────
              Filtered Content
```

### Key Features
- Tabs with count badges
- URL synchronization (`?status=pending`)
- Browser back/forward support
- Auto-resets pagination on status change

### Implementation Example
```typescript
<OrderStatusTabs
  counts={{
    all: 145,
    pending: 23,
    confirmed: 45,
    processing: 18,
    shipped: 12,
    delivered: 34,
    cancelled: 13,
  }}
/>
```

---

## 5. Bulk Actions Pattern

**Used in:** All list pages with selectable rows

### Pattern Structure
```
When Selection > 0:
┌──────────────────────────────────────┐
│ ✓ 5 selected  [Export] [Delete] [×] │
└──────────────────────────────────────┘
```

### Key Features
- Floating bar appears at bottom center
- Shows selection count
- Quick action buttons
- Clear selection (X)
- Slide-up animation on mount

### Implementation Example
```typescript
{selectedIds.size > 0 && (
  <BulkActionsBar
    selectedCount={selectedIds.size}
    onClear={handleClearSelection}
    actions={[
      { key: "export", label: "Export", onClick: handleExport },
      { key: "delete", label: "Delete", onClick: handleDelete, variant: "destructive" },
    ]}
  />
)}
```

---

## 6. Hierarchical Tree Pattern

**Used in:** Categories

### Pattern Structure
```
[>] Parent Category
    [>] Child Category 1
        [-] Grandchild Category
    [-] Child Category 2
```

### Key Features
- Expand/collapse with rotation animation
- Drag-to-reorder within same level
- Visual hierarchy with indentation
- Folder/document icons
- Inline quick actions (Edit, Add Child, Delete)

### Implementation Example
```typescript
<CategoryTree
  categories={categories}
  expandedIds={expandedIds}
  onToggleExpand={handleToggle}
  onReorder={handleReorder}
  onEdit={handleEdit}
/>
```

---

## 7. Empty State Pattern

**Used in:** All list views, many detail views

### Pattern Structure
```
        [Icon]
        
    Empty State Title
    
  Brief helpful description
  
   [Primary Action]
```

### Key Components
- Centered layout
- Relevant icon (Package, FolderTree, etc.)
- Clear title explaining the empty state
- Actionable description
- Optional primary action button

### Implementation Example
```typescript
<EmptyState
  title="No products found"
  description="Try adjusting your filters or create a new product"
  action={{
    label: "Create Product",
    onClick: () => router.push("/admin/products/new"),
  }}
/>
```

---

## 8. Confirmation Dialog Pattern

**Used in:** Delete operations, destructive actions

### Pattern Structure
```
┌─────────────────────────────┐
│  Are you sure?              │
│                             │
│  (Detailed warning message) │
│                             │
│  [Cancel]  [Confirm]        │
└─────────────────────────────┘
```

### Key Features
- Modal overlay blocks interaction
- Clear warning message
- Destructive action uses warning color
- Escape key to cancel
- Focus trap within dialog

### Implementation Example
```typescript
<ConfirmDialog
  open={isDeleteDialogOpen}
  onOpenChange={setIsDeleteDialogOpen}
  title="Delete Product?"
  description="This action cannot be undone. The product will be permanently deleted."
  onConfirm={handleDelete}
  onCancel={() => setIsDeleteDialogOpen(false)}
  confirmLabel="Delete"
  variant="destructive"
/>
```

---

## 9. Form Tab Navigation Pattern

**Used in:** Product Edit

### Pattern Structure
```
[ Info ] [ Variants ] [ Media ] [ Pricing ] [ SEO ]
───────────────────────────────────────────────────
         Active Tab Content
```

### Key Features
- URL synchronization (`?tab=variants`)
- Preserves scroll position on tab change
- Visual indicator for active tab
- Keyboard navigation (Arrow keys)

### Implementation Example
```typescript
<ProductFormTabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
  tabs={[
    { id: "info", label: "Info", content: <InfoTab /> },
    { id: "variants", label: "Variants", content: <VariantsTab /> },
    // ...
  ]}
/>
```

---

## Design Tokens

All components use semantic design tokens from `globals.css`:

### Status Colors
```css
--status-active: theme(colors.green.500);
--status-draft: theme(colors.gray.500);
--status-pending: theme(colors.yellow.500);
--status-confirmed: theme(colors.blue.500);
--status-processing: theme(colors.purple.500);
--status-shipped: theme(colors.indigo.500);
--status-delivered: theme(colors.green.600);
--status-cancelled: theme(colors.red.500);
```

### Layout Variables
```css
--sidebar-width: 240px;
--header-height: 64px;
```

---

## Accessibility Considerations

All patterns follow WCAG 2.1 AA standards:

- ✅ Keyboard navigation support
- ✅ Screen reader labels (aria-label, aria-describedby)
- ✅ Focus management (modals, drawers)
- ✅ Color contrast ratios meet AA standards
- ✅ Touch targets ≥44×44px
- ✅ Error states with clear messaging

---

## Responsive Behavior

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Pattern Adaptations

**Enriched Table:**
- Mobile: Compact view only, no expand
- Tablet/Desktop: Full expand/collapse

**Slide-Over:**
- Mobile: Full screen overlay
- Desktop: 400-600px panel from side

**Two-Column Layout:**
- Mobile: Stacks vertically (main → sidebar)
- Desktop: Side-by-side (65/35 split)

**Bulk Actions Bar:**
- Mobile: Full width at bottom
- Desktop: Centered, max-width 600px

---

## When to Use Which Pattern

| Scenario | Recommended Pattern |
|----------|-------------------|
| List of items with details | Enriched Table |
| Create/edit secondary item | Slide-Over Drawer |
| Complex edit form | Two-Column Layout |
| Filter by status | Status Tab Navigation |
| Multi-item operations | Bulk Actions |
| Hierarchical data | Tree Pattern |
| No data in list | Empty State |
| Destructive action | Confirmation Dialog |
| Multi-section form | Form Tab Navigation |

---

## Anti-Patterns (Avoid)

❌ **Don't** mix compact/expanded patterns with pagination—paginate expanded list instead  
❌ **Don't** use slide-over for complex multi-step wizards  
❌ **Don't** stack bulk action bars (one per page maximum)  
❌ **Don't** create custom status badge styles—use StatusBadge component  
❌ **Don't** hardcode colors—always use design tokens  
❌ **Don't** nest modals/drawers more than 2 levels deep  

---

## Contributing New Patterns

When introducing a new pattern:

1. Document it in this file
2. Create reusable components in `_components/shared/`
3. Add examples to component documentation
4. Update this guide with usage scenarios
5. Ensure accessibility compliance
6. Add i18n keys for all UI text
