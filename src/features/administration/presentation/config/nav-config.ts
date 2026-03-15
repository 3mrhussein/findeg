/**
 * Admin Navigation Configuration
 *
 * This file defines the complete navigation structure for the admin portal.
 * Navigation items are filtered at runtime based on:
 * - User permissions (permission codes)
 * - Portal roles (staff, school_staff, etc.)
 *
 * Location: presentation/config/ (NOT a React component - pure TypeScript)
 *
 * @see docs/admin/navigation.md for usage guide
 */

export type PortalRole = "customer" | "staff" | "school_staff";

export interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: string;
  permission?: string;
  portalRoles?: PortalRole[];
  children?: NavItem[];
  persistent?: boolean;
}

export interface NavGroup {
  label?: string;
  labelAr?: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        labelAr: "لوحة التحكم",
        href: "/admin",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    label: "CATALOG",
    labelAr: "الكتالوج",
    items: [
      {
        label: "Products",
        labelAr: "المنتجات",
        href: "/admin/products",
        icon: "Package",
        permission: "products.view",
      },
      {
        label: "Categories",
        labelAr: "الفئات",
        href: "/admin/categories",
        icon: "FolderTree",
        permission: "categories.view",
        persistent: true,
        children: [
          {
            label: "Tags",
            labelAr: "الوسوم",
            href: "/admin/catalog/tags",
            icon: "Tag",
            permission: "tags.manage",
          },
          {
            label: "Collections",
            labelAr: "المجموعات",
            href: "/admin/catalog/collections",
            icon: "Layers",
            permission: "collections.manage",
          },
        ],
      },
      {
        label: "Brands",
        labelAr: "العلامات التجارية",
        href: "/admin/brands",
        icon: "Award",
        permission: "brands.view",
      },
    ],
  },
  {
    label: "OPERATIONS",
    labelAr: "العمليات",
    items: [
      {
        label: "Orders",
        labelAr: "الطلبات",
        href: "/admin/orders",
        icon: "ShoppingCart",
        permission: "orders.view",
      },
      {
        label: "Inventory",
        labelAr: "المخزون",
        href: "/admin/inventory",
        icon: "Warehouse",
        permission: "inventory.view",
      },
    ],
  },
  {
    label: "CONTENT",
    labelAr: "المحتوى",
    items: [
      {
        label: "Media",
        labelAr: "الوسائط",
        href: "/admin/media",
        icon: "Image",
        permission: "media.view",
      },
    ],
  },
  {
    label: "ANALYTICS",
    labelAr: "التحليلات",
    items: [
      {
        label: "Analytics",
        labelAr: "التحليلات",
        href: "/admin/editorial/search-analytics",
        icon: "BarChart3",
        permission: "analytics.view",
      },
    ],
  },
  {
    label: "SYSTEM",
    labelAr: "النظام",
    items: [
      {
        label: "Audit Log",
        labelAr: "سجل التدقيق",
        href: "/admin/audit-log",
        icon: "ClipboardList",
        permission: "audit.view",
      },
      {
        label: "Settings",
        labelAr: "الإعدادات",
        href: "/admin/settings",
        icon: "Settings",
        children: [
          {
            label: "Staff & Access",
            labelAr: "الموظفون",
            href: "/admin/users",
            icon: "Users",
          },
          {
            label: "Roles & Permissions",
            labelAr: "الأدوار",
            href: "/admin/settings/roles",
            icon: "Shield",
          },
        ],
      },
    ],
  },
];
