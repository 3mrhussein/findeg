import { PERMISSION_CODES } from '@findeg/backend/features/core/schemas';
import { NavGroup } from './interfaces';

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      {
        label: 'Dashboard',
        labelAr: 'لوحة التحكم',
        href: '/',
        icon: 'LayoutDashboard',
        permission: PERMISSION_CODES.ADMIN_DASHBOARD_READ,
      },
    ],
  },
  {
    label: 'CATALOG',
    labelAr: 'الكتالوج',
    items: [
      {
        label: 'Products',
        labelAr: 'المنتجات',
        href: '/products',
        icon: 'Package',
        permission: PERMISSION_CODES.ADMIN_PRODUCTS_READ,
      },
      {
        label: 'Categories',
        labelAr: 'الفئات',
        href: '/categories',
        icon: 'FolderTree',
        permission: PERMISSION_CODES.ADMIN_CATEGORIES_READ,
        persistent: true,
        children: [
          {
            label: 'Tags',
            labelAr: 'الوسوم',
            href: '/catalog/tags',
            icon: 'Tag',
            permission: PERMISSION_CODES.ADMIN_TAGS_READ,
          },
          {
            label: 'Collections',
            labelAr: 'المجموعات',
            href: '/catalog/collections',
            icon: 'Layers',
            permission: PERMISSION_CODES.ADMIN_COLLECTIONS_READ,
          },
        ],
      },
      {
        label: 'Brands',
        labelAr: 'العلامات التجارية',
        href: '/brands',
        icon: 'Award',
        permission: PERMISSION_CODES.ADMIN_BRANDS_READ,
      },
    ],
  },
  {
    label: 'OPERATIONS',
    labelAr: 'العمليات',
    items: [
      {
        label: 'Orders',
        labelAr: 'الطلبات',
        href: '/orders',
        icon: 'ShoppingCart',
        permission: PERMISSION_CODES.ADMIN_ORDERS_READ,
      },
      {
        label: 'Inventory',
        labelAr: 'المخزون',
        href: '/inventory',
        icon: 'Warehouse',
        permission: PERMISSION_CODES.ADMIN_INVENTORY_READ,
      },
      {
        label: 'School Supply Lists',
        labelAr: 'قوائم الأدوات المدرسية',
        href: '/school-lists',
        icon: 'GraduationCap',
        anyPermissions: [
          PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ,
          PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
        ],
      },
    ],
  },
  {
    label: 'SYSTEM',
    labelAr: 'النظام',
    items: [
      {
        label: 'Business Partners',
        labelAr: 'شركاء الأعمال',
        href: '/partners',
        icon: 'Building2',
        anyPermissions: [PERMISSION_CODES.PARTNERS_MANAGE, PERMISSION_CODES.PARTNER_REPORTS_VIEW],
      },
      {
        label: 'Audit Log',
        labelAr: 'سجل التدقيق',
        href: '/audit-log',
        icon: 'ClipboardList',
        permission: PERMISSION_CODES.ADMIN_AUDIT_LOG_READ,
      },
      {
        label: 'Settings',
        labelAr: 'الإعدادات',
        href: '/account',
        icon: 'Settings',
        children: [
          {
            label: 'My Profile',
            labelAr: 'ملفي الشخصي',
            href: '/account',
            icon: 'User',
          },
          {
            label: 'Staff & Access',
            labelAr: 'الموظفون',
            href: '/users',
            icon: 'Users',
            permission: PERMISSION_CODES.ADMIN_USERS_READ,
          },
        ],
      },
    ],
  },
];
