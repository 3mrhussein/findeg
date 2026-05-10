import { NavGroup } from './interfaces';

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      {
        label: 'Dashboard',
        labelAr: 'لوحة التحكم',
        href: '/',
        icon: 'LayoutDashboard',
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
        permission: 'products.view',
      },
      {
        label: 'Categories',
        labelAr: 'الفئات',
        href: '/categories',
        icon: 'FolderTree',
        permission: 'categories.view',
        persistent: true,
        children: [
          {
            label: 'Tags',
            labelAr: 'الوسوم',
            href: '/catalog/tags',
            icon: 'Tag',
            permission: 'tags.manage',
          },
          {
            label: 'Collections',
            labelAr: 'المجموعات',
            href: '/catalog/collections',
            icon: 'Layers',
            permission: 'collections.manage',
          },
        ],
      },
      {
        label: 'Brands',
        labelAr: 'العلامات التجارية',
        href: '/brands',
        icon: 'Award',
        permission: 'brands.view',
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
        permission: 'orders.view',
      },
      {
        label: 'Inventory',
        labelAr: 'المخزون',
        href: '/inventory',
        icon: 'Warehouse',
        permission: 'inventory.view',
      },
    ],
  },
  {
    label: 'CONTENT',
    labelAr: 'المحتوى',
    items: [
      {
        label: 'Media',
        labelAr: 'الوسائط',
        href: '/media',
        icon: 'Image',
        permission: 'media.view',
      },
    ],
  },
  {
    label: 'ANALYTICS',
    labelAr: 'التحليلات',
    items: [
      {
        label: 'Analytics',
        labelAr: 'التحليلات',
        href: '/editorial/search-analytics',
        icon: 'BarChart3',
        permission: 'analytics.view',
      },
    ],
  },
  {
    label: 'SYSTEM',
    labelAr: 'النظام',
    items: [
      {
        label: 'Audit Log',
        labelAr: 'سجل التدقيق',
        href: '/audit-log',
        icon: 'ClipboardList',
        permission: 'audit.view',
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
          },
          {
            label: 'Roles & Permissions',
            labelAr: 'الأدوار',
            href: '/users/roles',
            icon: 'Shield',
          },
        ],
      },
    ],
  },
];
