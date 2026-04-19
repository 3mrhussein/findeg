# Admin UI Navigation Reference

**Last Updated:** March 14, 2026  
**Component Location:** `src/app/[locale]/admin/_components/shell/nav-config.ts`

## Overview

The admin navigation is permission-based, dynamically filtering items based on the authenticated user's permissions. The navigation structure supports:

- Nested navigation groups with icons
- Permission-based visibility
- Active state detection
- Breadcrumb generation

## Navigation Structure

### Dashboard
- **Path:** `/admin`
- **Permission:** `admin:dashboard:view`
- **Icon:** `LayoutDashboard`
- **Description:** Overview of store performance with KPI cards, charts, and recent activity

### Catalog Group

#### Products
- **Path:** `/admin/products`
- **Permission:** `admin:products:view`
- **Icon:** `Package`
- **Features:**
  - Enriched table with expand/collapse rows
  - Bulk selection and actions
  - Filtering by category, brand, status
  - Product edit form with tabs (Info, Variants, Media, Pricing, SEO)

#### Categories
- **Path:** `/admin/categories`
- **Permission:** `admin:categories:view`
- **Icon:** `FolderTree`
- **Features:**
  - Hierarchical tree view
  - Drag-to-reorder functionality
  - Slide-over drawer for create/edit
  - Bilingual name/description fields

#### Brands
- **Path:** `/admin/brands`
- **Permission:** `admin:brands:view`
- **Icon:** `Tag`

#### Collections
- **Path:** `/admin/collections`
- **Permission:** `admin:collections:view`
- **Icon:** `Layers`

#### Tags
- **Path:** `/admin/tags`
- **Permission:** `admin:tags:view`
- **Icon:** `Hash`

### Orders
- **Path:** `/admin/orders`
- **Permission:** `admin:orders:view`
- **Icon:** `ShoppingCart`
- **Features:**
  - Status-filtered tabs (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
  - Order timeline visualization
  - Enriched rows with full order details
  - Detail drawer with status updates

### Customers
- **Path:** `/admin/customers`
- **Permission:** `admin:customers:view`
- **Icon:** `Users`

### Inventory
- **Path:** `/admin/inventory`
- **Permission:** `admin:inventory:view`
- **Icon:** `Warehouse`

### Marketing Group

#### Discounts
- **Path:** `/admin/marketing/discounts`
- **Permission:** `admin:marketing:discounts:view`
- **Icon:** `Percent`

#### Email Campaigns
- **Path:** `/admin/marketing/emails`
- **Permission:** `admin:marketing:emails:view`
- **Icon:** `Mail`

### Analytics
- **Path:** `/admin/analytics`
- **Permission:** `admin:analytics:view`
- **Icon:** `BarChart`

### Settings
- **Path:** `/admin/settings`
- **Permission:** `admin:settings:view`
- **Icon:** `Settings`

### Team
- **Path:** `/admin/team`
- **Permission:** `admin:team:view`
- **Icon:** `Shield`
- **Features:**
  - Admin user management
  - Role assignment
  - Permission overrides

## Permission System

### Permission Format
```typescript
"admin:{section}:{action}"
```

Examples:
- `admin:dashboard:view`
- `admin:products:view`
- `admin:products:edit`
- `admin:products:delete`

### Permission Hook
```typescript
import { useAdminPermissions } from "@app/[locale]/admin/_components/shell/useAdminPermissions";

function MyComponent() {
  const { canView, canEdit, canDelete } = useAdminPermissions("products");
  
  if (!canView) return <Forbidden />;
  
  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

## Adding New Navigation Items

1. **Add Permission Check** (if needed)
   ```typescript
   // In your route's page.tsx
   await requireAdminAuth(["admin:newsection:view"]);
   ```

2. **Update nav-config.ts**
   ```typescript
   {
     label: "New Section",
     href: "/admin/newsection",
     icon: YourIcon,
     permission: "admin:newsection:view",
   }
   ```

3. **Update Breadcrumb Mapping** (if needed)
   The breadcrumb auto-generates from nav-config, but you can customize in `AdminBreadcrumb.tsx` if needed.

## Breadcrumb Behavior

- **Root:** Shows "Admin" only
- **One Level Deep:** Admin / Section
- **Two Levels Deep:** Admin / Group / Section
- **Edit Pages:** Admin / Section / Edit #{id}

Example breadcrumbs:
- `/admin` → Admin
- `/admin/products` → Admin / Products
- `/admin/products/123/edit` → Admin / Products / Edit #123
- `/admin/marketing/discounts` → Admin / Marketing / Discounts

## Mobile Navigation

On mobile devices (<768px), the sidebar collapses into a drawer accessible via the hamburger menu in the header.

## RTL Support

All navigation components support RTL layout for Arabic:
- Icons flip appropriately
- Spacing uses logical properties (`ps-*` instead of `pl-*`)
- Breadcrumb separators flip direction

## Translation Keys

Navigation labels use these i18n keys:
```json
{
  "Administration.Shell.Nav.Dashboard": "Dashboard",
  "Administration.Shell.Nav.Products": "Products",
  // ... etc
}
```

See `src/features/core/infrastructure/cms/messages/en.json` for the full list.
