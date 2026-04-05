# Admin Pages Update Implementation Guide

## Overview

All 6 admin pages need to be updated to use the new Server Action patterns. The backend and app-layer are 100% ready. This guide shows exactly what to change.

## Quick Start

Every admin page follows the same pattern:

```tsx
'use client';

// 1. Import the action from the appropriate file
import { createProductAction, updateProductAction, deleteProductAction } from '@/actions/catalog-actions';

// 2. Use in form handlers
const handleAction = async (data) => {
  const result = await createProductAction(data);
  if (!result.success) {
    setError(result.error);
    return;
  }
  // Success - cache is automatically invalidated
};
```

## Pages to Update

### 1. Products Management
**File**: `packages/dashboard/src/app/[locale]/admin/products/page.tsx`

**Import One Line**:
```tsx
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction 
} from '@/actions/catalog-actions';
```

**Update Form Handler**:
Replace any direct backend service calls with:
```tsx
// Create
const result = await createProductAction(formData);

// Update
const result = await updateProductAction(id, formData);

// Delete  
const result = await deleteProductAction(id);
```

**Show Result**:
```tsx
if (!result.success) {
  setError(result.error);
} else {
  // UI updates automatically via cache invalidation
}
```

---

### 2. Brands Management
**File**: `packages/dashboard/src/app/[locale]/admin/brands/page.tsx`

**Import One Line**:
```tsx
import { 
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction 
} from '@/actions/catalog-actions';
```

**Update Handlers**:
```tsx
// Create
await createBrandAction(formData);

// Update
await updateBrandAction(id, formData);

// Delete
await deleteBrandAction(id);

// Toggle Status
await toggleBrandStatusAction(id);
```

---

### 3. Categories Management
**File**: `packages/dashboard/src/app/[locale]/admin/categories/page.tsx`

**Import One Line**:
```tsx
import { 
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  moveCategoryUpAction,
  moveCategoryDownAction,
  reorderCategoriesAction,
  checkCategorySlugAvailableAction
} from '@/actions/catalog-actions';
```

**Update Handlers**:
```tsx
// CRUD operations
await createCategoryAction(formData);
await updateCategoryAction(id, formData);
await deleteCategoryAction(id);

// Reordering (for drag-to-reorder)
await moveCategoryUpAction(id);
await moveCategoryDownAction(id);
await reorderCategoriesAction(reorderedArray);

// Slug availability check
const available = await checkCategorySlugAvailableAction(slug, categoryId);
```

---

### 4. Tags Management
**File**: `packages/dashboard/src/app/[locale]/admin/catalog/tags/page.tsx`

**Import One Line**:
```tsx
import { 
  createTagAction,
  updateTagAction,
  deleteTagAction,
  toggleTagStatusAction,
  bulkUpdateTagsStatusAction,
  bulkDeleteTagsAction,
  getTagProductCountAction,
  getDistinctTagGroupsAction
} from '@/actions/admin-actions';
```

**Update Handlers**:
```tsx
// Individual operations
await createTagAction(formData);
await updateTagAction(id, formData);
await deleteTagAction(id);
await toggleTagStatusAction(id);

// Bulk operations
await bulkUpdateTagsStatusAction(tagIds, newStatus);
await bulkDeleteTagsAction(tagIds);

// Info queries
const count = await getTagProductCountAction(tagId);
const groups = await getDistinctTagGroupsAction();
```

---

### 5. Collections Management
**File**: `packages/dashboard/src/app/[locale]/admin/catalog/collections/page.tsx`

**Import One Line**:
```tsx
import { 
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
  reorderCollectionsAction
} from '@/actions/admin-actions';
```

**Update Handlers**:
```tsx
// CRUD operations
await createCollectionAction(formData);
await updateCollectionAction(id, formData);
await deleteCollectionAction(id);

// Reordering
await reorderCollectionsAction(reorderedArray);
```

---

### 6. Inventory Management
**File**: `packages/dashboard/src/app/[locale]/admin/inventory/page.tsx`

**Import One Line**:
```tsx
import { 
  updateStockAction,
  bulkUpdateStockAction
} from '@/actions/admin-actions';
```

**Update Handlers**:
```tsx
// Single stock update
const result = await updateStockAction({
  variantId,
  uom,
  quantity,
  customerGroup
});

// Bulk stock updates
const results = await bulkUpdateStockAction(stockUpdatesArray);

// Show results
if (!result.success) {
  setError(result.error);
} else {
  // Cache automatically updated
}
```

---

## What's Automatic (No Extra Code Needed)

- ✅ **Cache Invalidation**: Happens automatically after action completes
- ✅ **Error Translation**: Domain errors are translated to user-friendly messages
- ✅ **Session Management**: Session is automatically extracted for admin actions
- ✅ **Database Persistence**: Backend handles all save/update operations
- ✅ **Type Safety**: Full TypeScript support for all actions

## What Each Page Still Needs

- ✅ Form rendering (UI components)
- ✅ Loading state display
- ✅ Error message display
- ✅ Success notification (optional - cache updates verify operation)
- ✅ List state management (pagination, filtering, sorting)

## Testing Checklist for Each Page

After updating a page:

- [ ] **Create**: Form submit → shows success/error → item appears in list
- [ ] **Update**: Edit form → shows success/error → changes reflected in list  
- [ ] **Delete**: Delete action → shows success/error → item removed from list
- [ ] **Other ops**: Status toggle/reorder → shows success/error → updates reflected
- [ ] **Cache**: Navigate to shop/catalog pages → verify changes reflected there
- [ ] **Error handling**: Try invalid data → shows error message

## Command to Run After Updates

```bash
# Verify page imports
pnpm --filter @findeg/dashboard type-check

# Verify no linting issues
pnpm --filter @findeg/dashboard lint

# Run E2E tests
pnpm --filter @findeg/dashboard cypress:open
```

## Implementation Order (Recommended)

1. **Products** (15-20 min) - Basic CRUD, simple operations
2. **Brands** (15-20 min) - Basic CRUD + toggle
3. **Categories** (20-30 min) - CRUD + reordering (slightly more complex)
4. **Tags** (20-30 min) - CRUD + bulk operations (more operations)
5. **Collections** (15-20 min) - CRUD + reordering
6. **Inventory** (15-20 min) - Stock updates + bulk operations

**Total Time**: 2-3 hours for all 6 pages

## Complete Example: Products Page

Here's a complete, minimal example to show the pattern:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction 
} from '@/actions/catalog-actions';

export default function ProductsPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = Object.fromEntries(formData);
      const result = await createProductAction(data);
      
      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      // List updates automatically via cache invalidation
    } catch (err) {
      setError(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{t('admin.products')}</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{t('common.success')}</div>}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreate(new FormData(e.currentTarget));
      }} disabled={loading}>
        {/* Form fields here */}
        <button disabled={loading}>
          {loading ? t('common.saving') : t('common.create')}
        </button>
      </form>

      {/* Product list below */}
      {/* List updates automatically after action completes */}
    </div>
  );
}
```

That's it! The pattern is consistent across all pages.

---

## Key Points

1. **One import per page** - Just import the action functions you need
2. **One call per operation** - Call the action from your form handler
3. **One check per result** - Check if result.success is true or false
4. **That's all!** - Everything else (cache, errors, persistence) is automatic

## Success Indicators

After updating all 6 pages:

- ✅ `pnpm --filter @findeg/dashboard type-check` passes
- ✅ No TypeScript errors in pages
- ✅ All CRUD operations work end-to-end
- ✅ Shop/catalog pages immediately reflect admin changes
- ✅ Error messages display correctly when operations fail

## Questions?

The action files are fully documented:
- See `packages/dashboard/src/actions/catalog-actions.ts` for comprehensive JSDoc
- See `packages/dashboard/src/actions/admin-actions.ts` for all admin operations

Every action is fully typed with proper TypeScript interfaces. Just import and use!
