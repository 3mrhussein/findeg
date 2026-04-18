# Stubbed Functions Inventory & Recovery Map

**Date**: 2026-04-06  
**Purpose**: Document all stubbed functions and map them to original service container calls for restoration  
**Status**: 🔍 Phase 1 - Documentation in progress

---

## Recovery Methodology

1. **Git Diff Analysis**: Extract original service method calls from `git diff HEAD`
2. **Service Mapping**: Map each stub → original container service → new service factory
3. **Parameter Documentation**: Capture input types, validation, auth requirements
4. **Test Criteria**: Define success criteria for each restored function

---

## Function Categories

### Category 1: Product Management (CRITICAL PATH)

#### 1.1 Product Actions (admin-product-actions.ts)

**File**: `packages/dashboard/src/features/administration/application/actions/admin-product-actions.ts`  
**Lines Lost**: 452 → 66 (86% code removal)  
**Priority**: P0 (Core business functionality)

| Function | Original Service Call | Parameters | Auth Required | Validation | Status |
|----------|----------------------|------------|---------------|------------|--------|
| `createProductAction` | `container.adminProductService.createProduct()` | ProductFormValues (Zod validated) | Catalog Manager / Super Admin | CreateProductSchema | 🔴 STUBBED |
| `updateProductAction` | `container.adminProductService.updateProduct()` | id, ProductFormValues | Catalog Manager / Super Admin | UpdateProductSchema | 🔴 STUBBED |
| `deleteProductAction` | `container.adminProductService.deleteProduct()` | id | Catalog Manager / Super Admin | None | 🔴 STUBBED |
| `setProductStatusAction` | `container.adminProductService.setProductStatus()` | id, isActive | Catalog Manager / Super Admin | Boolean | 🔴 STUBBED |
| `deactivateVariantAction` | `container.adminProductService.deactivateVariant()` | variantId | Catalog Manager / Super Admin | None | 🔴 STUBBED |
| `generateVariantsAction` | `container.adminProductService.generateVariants()` | productId | Catalog Manager / Super Admin | None | 🔴 STUBBED |
| `rebuildVariantKeysAction` | `container.adminProductService.rebuildVariantKeys()` | productId | Catalog Manager / Super Admin | None | 🔴 STUBBED |
| `upsertVariantUoMsAction` | `container.adminProductService.upsertVariantUoMs()` | variantId, UoMInput[] | Catalog Manager / Super Admin | UoMInputSchema array | 🔴 STUBBED |
| `upsertVariantImagesAction` | `container.adminProductService.upsertVariantImages()` | variantId, ImageInput[] | Catalog Manager / Super Admin | ImageInputSchema array | 🔴 STUBBED |
| `checkSkuAction` | `container.adminProductService.checkSkuAvailable()` | sku, excludeProductId? | Catalog Manager / Super Admin | Regex: ^[A-Z0-9-]+$ | 🔴 STUBBED |
| `checkSlugAction` | `container.adminProductService.checkSlugAvailable()` | slug, excludeProductId? | Catalog Manager / Super Admin | String validation | 🔴 STUBBED |
| `checkSkuPrefixAction` | `container.adminProductService.checkSkuPrefixAvailable()` | prefix, excludeProductId? | Catalog Manager / Super Admin | String validation |  🔴 STUBBED |

**Original Auth Pattern**:
```typescript
async function requireCatalogRole() {
  const session = await container.authService.validateAdmin();
  const ok = isSystemAdmin(session) || session.activeRoleIds?.includes("catalog_manager");
  if (!ok) throw new Error("Forbidden: requires Catalog Manager or Super Admin role");
  return { session, adminUserId: Number(session.userId) };
}
```

**Original Cache Invalidation**:
```typescript
function invalidateProductCache(id?: number) {
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}/edit`);
  revalidateTag(CACHE_TAGS.CATALOG_PRODUCTS, "max" as never);
}
```

**Schemas Lost**:
- `CreateProductSchema` (70+ lines): localizedName, localizedDescription, slug, categoryId, brandId, tagIds, variants array
- `UpdateProductSchema`: Partial of CreateProductSchema + id
- `UoMInputSchema`: uomCode, factorToBase, localizedLabel, barcode, priceLists
- `ImageInputSchema`: url, alt, displayOrder
- `VariantAttributeInputSchema`: attributeKey, value, isVariantDefining
- `CreateVariantSchema`: sku, label, price, stock, images, attributes, uoms

#### 1.2 Product Queries (data/products/queries.ts)

**File**: `packages/dashboard/src/data/products/queries.ts`  
**Status**: Contains "use cache" stubs, never had container calls (created fresh)

| Function | Expected Backend Call | Cache Strategy | Status |
|----------|----------------------|----------------|--------|
| `getProducts()` | `createCatalogServices().products.getAll()` | cacheLife("hours"), cacheTag("products") | 🟡 NEEDS IMPL |
| `getProductById()` | `createCatalogServices().products.getById()` | cacheLife("hours"), cacheTag("products") | 🟡 NEEDS IMPL |
| `searchProducts()` | `createCatalogServices().products.search()` | cacheLife("minutes"), cacheTag("products") | 🟡 NEEDS IMPL |

**Note**: These were created as stubs per spec 006, no git recovery needed. Just need proper implementation.

---

### Category 2: Catalog Actions (catalog-actions.ts)

**File**: `packages/dashboard/src/actions/catalog-actions.ts`  
**Lines**: Stubbed but retained structure  
**Priority**: P0 (Used across multiple pages)

| Function | Original Service Call | New Service Factory Call | Status |
|----------|----------------------|--------------------------|--------|
| `createProductAction` | `container.catalogService.createProduct()` | `createCatalogServices().products.create()` | 🔴 STUBBED |
| `deleteProductAction` | `container.catalogService.deleteProduct()` | `createCatalogServices().products.delete()` | 🔴 STUBBED |
| `createBrandAction` | `container.catalogService.createBrand()` | `createCatalogServices().brands.create()` | 🔴 STUBBED |
| `updateBrandAction` | `container.catalogService.updateBrand()` | `createCatalogServices().brands.update()` | 🔴 STUBBED |
| `deleteBrandAction` | `container.catalogService.deleteBrand()` | `createCatalogServices().brands.delete()` | 🔴 STUBBED |
| `toggleBrandStatusAction` | `container.catalogService.toggleBrandStatus()` | `createCatalogServices().brands.toggleStatus()` | 🔴 STUBBED |
| `createCategoryAction` | `container.catalogService.createCategory()` | `createCatalogServices().categories.create()` | 🔴 STUBBED |
| `updateCategoryAction` | `container.catalogService.updateCategory()` | `createCatalogServices().categories.update()` | 🔴 STUBBED |
| `deleteCategoryAction` | `container.catalogService.deleteCategory()` | `createCatalogServices().categories.delete()` | 🔴 STUBBED |
| `moveCategoryUpAction` | `container.catalogService.moveCategoryUp()` | `createCatalogServices().categories.moveUp()` | 🔴 STUBBED |
| `moveCategoryDownAction` | `container.catalogService.moveCategoryDown()` | `createCatalogServices().categories.moveDown()` | 🔴 STUBBED |
| `reorderCategoriesAction` | `container.catalogService.reorderCategories()` | `createCatalogServices().categories.reorder()` | 🔴 STUBBED |
| `checkCategorySlugAvailable` | `container.catalogService.checkCategorySlug()` | `createCatalogServices().categories.checkSlug()` | 🔴 STUBBED |

---

### Category 3: Order Management

#### 3.1 Order Actions

**File**: `packages/dashboard/src/actions/order-actions.ts`  
**Priority**: P1 (Business critical)

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `updateOrderStatusAction` | `container.orderService.updateOrderStatus()` | orderId, OrderStatusUpdate | 🔴 STUBBED |
| `updateOrderPaymentStatusAction` | `container.orderService.updatePaymentStatus()` | orderId, PaymentStatus | 🔴 STUBBED |

**File**: `packages/dashboard/src/features/administration/application/actions/admin-order-actions.ts`

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `adminUpdateOrderStatusAction` | `container.adminOrderService.updateStatus()` | orderId, status, trackingNumber?, adminNotes? | 🔴 STUBBED |
| `adminUpdateOrderPaymentStatusAction` | `container.adminOrderService.updatePaymentStatus()` | orderId, status | 🔴 STUBBED |
| `refundOrderAction` | `container.adminOrderService.refundOrder()` | orderId, amount?, reason? | 🔴 STUBBED |
| `cancelOrderAction` | `container.adminOrderService.cancelOrder()` | orderId, reason | 🔴 STUBBED |

---

### Category 4: Collections & Tags

#### 4.1 Collection Actions

**File**: `packages/dashboard/src/features/administration/application/actions/admin-collection-actions.ts`  
**Priority**: P1

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `adminCreateCollectionAction` | `container.adminCollectionService.create()` | CollectionInput | 🔴 STUBBED |
| `adminUpdateCollectionAction` | `container.adminCollectionService.update()` | id, CollectionInput | 🔴 STUBBED |
| `adminDeleteCollectionAction` | `container.adminCollectionService.delete()` | id | 🔴 STUBBED |
| `adminReorderCollectionsAction` | `container.adminCollectionService.reorder()` | id, sortOrder | 🔴 STUBBED |

#### 4.2 Tag Actions

**File**: `packages/dashboard/src/features/administration/application/actions/admin-tag-actions.ts`  
**Priority**: P2

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `adminCreateTagAction` | `container.adminTagService.create()` | TagInput | 🔴 STUBBED |
| `adminUpdateTagAction` | `container.adminTagService.update()` | id, TagInput | 🔴 STUBBED |
| `adminDeleteTagAction` | `container.adminTagService.delete()` | id | 🔴 STUBBED |
| `adminBulkUpdateTagsStatusAction` | `container.adminTagService.bulkUpdateStatus()` | ids[], isActive | 🔴 STUBBED |
| `adminBulkDeleteTagsAction` | `container.adminTagService.bulkDelete()` | ids[] | 🔴 STUBBED |
| `adminToggleTagStatusAction` | `container.adminTagService.toggleStatus()` | id | 🔴 STUBBED |
| `adminGetTagProductCountAction` | `container.adminTagService.getProductCount()` | tagId | 🔴 STUBBED |
| `adminGetDistinctTagGroupsAction` | `container.adminTagService.getDistinctGroups()` | none | 🔴 STUBBED |

---

### Category 5: Inventory Management

**File**: `packages/dashboard/src/features/administration/application/actions/inventory.ts`  
**Priority**: P1

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `updateStockAction` | `container.inventoryService.updateStock()` | variantId, quantity, reason? | 🔴 STUBBED |
| `bulkUpdateStockAction` | `container.inventoryService.bulkUpdateStock()` | updates: {variantId, quantity}[] | 🔴 STUBBED |

**File**: `packages/dashboard/src/data/inventory/queries.ts`

| Function | Expected Backend Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `getInventory()` | `createCatalogServices().inventory.getAll()` | includeZeroStock, limit, offset | 🟡 NEEDS IMPL |
| `getLowStockAlerts()` | `createCatalogServices().inventory.getLowStock()` | threshold? | 🟡 NEEDS IMPL |

---

### Category 6: User & Auth Management

#### 6.1 Admin User Actions

**File**: `packages/dashboard/src/app/[locale]/admin/(dashboard)/users/_actions/adminUsers.ts`  
**Priority**: P1 (Security critical)

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `createAdminAction` | `container.adminUserService.createAdmin()` | AdminUserInput | 🔴 STUBBED |
| `updateAdminAction` | `container.adminUserService.updateAdmin()` | id, AdminUserInput | 🔴 STUBBED |

#### 6.2 Auth Actions

**File**: `packages/dashboard/src/actions/auth-actions.ts`

| Function | Original Service Call | Status |
|----------|----------------------|--------|
| Auth flow implementation | `container.authService.*` | 🔴 STUBBED |

**File**: `packages/dashboard/src/actions/profile-actions.ts`

| Function | Original Service Call | Status |
|----------|----------------------|--------|
| Profile update logic | `container.profileService.*` | 🔴 STUBBED |

---

### Category 7: Dashboard Analytics & Queries

#### 7.1 Dashboard Queries

**File**: `packages/dashboard/src/data/admin/queries.ts`  
**Priority**: P2 (Analytics)

| Function | Original Service Call | Parameters | Status |
|----------|----------------------|------------|--------|
| `getCatalogHealthStats()` | `container.adminDashboardService.getCatalogHealth()` | none | 🔴 STUBBED |
| `getCategoryProductDistribution()` | `container.adminDashboardService.getCategoryDistribution()` | none | 🔴 STUBBED |
| `getRecentActivity()` | `container.auditLogService.getRecentLogs()` | limit, entityTypes[] | 🔴 STUBBED |
| `getDashboardData()` | `container.adminDashboardService.getDashboard()` | adminId, locale | 🔴 STUBBED |
| `getAuditLogs()` | `container.auditLogService.getLogs()` | filters | 🔴 STUBBED |

**File**: `packages/dashboard/src/queries/dashboard-queries.ts`

| Function | Original Service Call | Status |
|----------|----------------------|--------|
| `getAdminStats()` | `container.dashboardService.getAdminStats()` | 🔴 STUBBED |
| `getTopProducts()` | `container.dashboardService.getTopProducts()` | 🔴 STUBBED |
| `getRecentOrders()` | `container.dashboardService.getRecentOrders()` | 🔴 STUBBED |

#### 7.2 Resource Queries

**File**: `packages/dashboard/src/data/resources/queries.ts`  
**Priority**: P0 (Used everywhere)

| Function | Original Service Call | Cache Strategy | Status |
|----------|----------------------|----------------|--------|
| `getAllBrands()` | `container.catalogService.getAllBrands()` | cacheLife("hours"), cacheTag("brands") | 🔴 STUBBED |
| `getAllCategories()` | `container.catalogService.getAllCategories()` | cacheLife("hours"), cacheTag("categories") | 🔴 STUBBED |
| `getAllTags()` | `container.catalogService.getAllTags()` | cacheLife("hours"), cacheTag("tags") | 🔴 STUBBED |
| `getAllTagsGrouped()` | `container.catalogService.getTagsGrouped()` | cacheLife("hours"), cacheTag("tags") | 🔴 STUBBED |

---

### Category 8: Page Data Fetching (12 pages)

**Note**: Pages used `container.*` directly instead of "use cache" queries. Needs full migration to data layer pattern.

| Page | Original Service Calls | New Data Layer | Status |
|------|------------------------|----------------|--------|
| `media/page.tsx` | `container.mediaService.getLibraryAssets()` | `getMediaAssets()` | 🟡 CREATE |
| `users/page.tsx` | `container.adminUserService.listAdmins()`, `adminRoleService.listRoles()` | `getAdminUsers()`, `getAdminRoles()` | 🟡 CREATE |
| `orders/page.tsx` | `container.adminOrderService.getAll(filters)` | `getOrders(filters)` | 🟡 CREATE |
| `orders/[id]/page.tsx` | `container.adminOrderService.getById()`, `auditLogService.getEntityLogs()` | `getOrderById()`, `getOrderLogs()` | 🟡 CREATE |
| `products/page.tsx` | `container.adminProductService.getProductsList()`, plus categories/brands | `getProducts()`, `getCategories()`, `getBrands()` | 🟡 CREATE |
| `categories/page.tsx` | `container.adminCategoryService.getTree()` | `getCategoryTree()` | 🟡 CREATE |
| `categories/[id]/edit/page.tsx` | `container.categoriesService.getById()` (2 calls), `getAll()` | `getCategoryById()`, `getAllCategories()` | 🟡 CREATE |
| `categories/new/page.tsx` | `container.categoriesService.getAll()` | `getAllCategories()` | 🟡 CREATE |
| `collections/page.tsx` | `container.adminCollectionService.getAll()` | `getCollections()` | 🟡 CREATE |
| `collections/[id]/page.tsx` | `container.adminCollectionService.getById()`, `adminTagService.getAll()` | `getCollectionById()`, `getAllTags()` | 🟡 CREATE  |
| `collections/new/page.tsx` | `container.adminTagService.getAll()` | `getAllTags()` | 🟡 CREATE |
| `search-analytics/page.tsx` | `container.adminSearchAnalyticsService.*` (5+ calls) | Create search analytics queries | 🟡 CREATE |
| `inventory/page.tsx` | `container.inventoryService.getInventory()`, `getLowStockAlerts()` | `getInventory()`, `getLowStockAlerts()` | 🟡 CREATE |
| `dashboard/page.tsx` | `container.dashboardService.getStats()`, etc. | Dashboard queries | 🟡 CREATE |
| `products/[id]/edit/page.tsx` | `container.adminProductService.getProductForEdit()`, plus resources | `getProductForEdit()`, resource queries | 🟡 CREATE |
| `products/[id]/page.tsx` | `container.adminProductService.getById()`, resources | `getProductById()`, resource queries | 🟡 CREATE |

---

## Recovery Priority Matrix

### P0 - CRITICAL PATH (Week 1)
**Goal**: Basic catalog management functional

1. ✅ **Category Data Layer** (T069-T072)
   - `data/categories/queries.ts`: Create "use cache" wrappers
   - `data/categories/actions.ts`: Create "use server" actions with updateTag
   - Pages: categories/page.tsx, categories/[id]/edit/page.tsx

2. ✅ **Brand & Tag Resources** (Part of T073)
   - `data/resources/queries.ts`: getAllBrands(), getAllTags(), getAllCategories()
   - Used by multiple pages, high reuse

3. ✅ **Product Data Layer** (T062-T068)
   - `data/products/queries.ts`: getProducts(), getProductById(), searchProducts()
   - `data/products/actions.ts`: Full CRUD + variant management
   - Pages: products/page.tsx, products/[id]/edit/page.tsx

### P1 - HIGH PRIORITY (Week 1-2)
**Goal**: Order management + inventory functional

4. ✅ **Order Data Layer**
   - `data/orders/queries.ts`: getOrders(), getOrderById()
   - `data/orders/actions.ts`: Status updates, payments, refunds
   - Pages: orders/page.tsx, orders/[id]/page.tsx

5. ✅ **Inventory Management**
   - `data/inventory/queries.ts`: getInventory(), getLowStockAlerts()
   - `features/administration/application/actions/inventory.ts`: Stock updates
   - Page: inventory/page.tsx

6. ✅ **Collection Management**
   - Actions: adminCreateCollection, adminUpdateCollection, etc.
   - Pages: collections/*.tsx

### P2 - MEDIUM PRIORITY (Week 2)
**Goal**: Full admin functionality

7. ✅ **User Management**
   - `users/_actions/adminUsers.ts`: createAdmin, updateAdmin
   - Page: users/page.tsx

8. ✅ **Dashboard Analytics**
   - `data/admin/queries.ts`: Stats, metrics, activity logs
   - `queries/dashboard-queries.ts`: Admin dashboard data
   - Page: dashboard/page.tsx

9. ✅ **Search Analytics**
   - `data/search-analytics/` (create new)
   - Page: search-analytics/page.tsx

### P3 - LOW PRIORITY (Future)
**Goal**: Nice-to-have features

10. Auth & Profile actions (if blocking login)
11. Media library queries
12. Advanced reporting features

---

## Validation Checklist (Per Function)

When restoring each function, verify:

- [ ] Service factory import works: `import { createCatalogServices } from '@backend/features/catalog'`
- [ ] Service instantiation: `const { products } = createCatalogServices()`
- [ ] Method call succeeds: `await products.getAll(locale)`
- [ ] Return type matches: Function returns expected domain type
- [ ] Cache tags applied: `cacheTag('products')` in queries
- [ ] Cache invalidation works: `updateTag('products')` in actions
- [ ] Auth checks preserved: Role validation where required
- [ ] Error handling: Try/catch with proper error messages
- [ ] TypeScript passes: No `any` types, all imports resolve
- [ ] Manual test: Feature works end-to-end in browser

---

## Next Steps

### Immediate (This Session)

1. ✅ Complete git diff analysis for all stubbed files
2. 🔲 Test service factory imports in dashboard
3. 🔲 Implement ONE function end-to-end as POC:
   - Suggested: `getAllCategories()` from resources/queries.ts
   - Verify: Import works, service call succeeds, cache works
4. 🔲 Based on POC: Decide full restoration vs rollback

### Short Term (Next 1-2 days)

5. 🔲 Restore P0 critical path (categories, products)
6. 🔲 Create test harness for each restored feature
7. 🔲 Document patterns in restoration guide

### Medium Term (Next week)

8. 🔲 Restore P1 functions (orders, inventory)
9. 🔲 Migrate all pages to data layer
10. 🔲 Complete P2 functions (dashboard, analytics)

---

## Session Log

**2026-04-06 10:34**: Phase 1 started - Git diff analysis  
**Status**: Mapping original service calls → service factories  
**Files Analyzed**: 10 / 40+  
**Recovery Rate**: ~25% documented

**Next**: Test service factory import to validate approach
