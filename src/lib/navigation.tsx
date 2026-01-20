import React from 'react';
import type { NavigationItem } from '@/types';
import { Icon } from '@/presentation/shared/components/Icon';
// ...removed import for T, use translation key directly

/**
 * Defines the main navigation structure of the application.
 * 
 * This schema is used to generate the header navigation menu, including the mega menu.
 * It supports nested links, icons, and "New" badges.
 * 
 * @type {NavigationItem[]}
 */
export const navigationSchema: NavigationItem[] = [
    { labelKey: 'NAV.SHOP', href: '/shop' },
    { 
      labelKey: 'NAV.CATEGORIES', 
      href: '/categories',
      isMegaMenu: true,
      megaMenuColumns: [
        {
          titleKey: 'NAV.STATIONARY.TITLE',
          links: [
            { labelKey: 'NAV.STATIONARY.PENS', href: '/shop?category=Stationary', subLinks: [
              { labelKey: 'NAV.STATIONARY.GEL_PENS', href: '/shop?category=Stationary&type=gel', icon: <Icon name="pen" className="w-4 h-4" /> },
              { labelKey: 'NAV.STATIONARY.BALLPOINT', href: '/shop?category=Stationary&type=ballpoint', icon: <Icon name="pen" className="w-4 h-4" /> },
            ]},
            { labelKey: 'NAV.STATIONARY.NOTEBOOKS', href: '/shop?category=Stationary' },
            { labelKey: 'NAV.STATIONARY.ART_SUPPLIES', href: '/shop?category=Stationary', isNew: true },
          ]
        },
        {
          titleKey: 'NAV.TOYS.TITLE',
          links: [
            { labelKey: 'NAV.TOYS.EDUCATIONAL', href: '/shop?category=Toys' },
            { labelKey: 'NAV.TOYS.BLOCKS', href: '/shop?category=Toys' },
            { labelKey: 'NAV.TOYS.PUZZLES', href: '/shop?category=Toys', subLinks: [
              { labelKey: 'NAV.TOYS.JIGSAW', href: '/shop?category=Toys&type=jigsaw', icon: <Icon name="puzzle" className="w-4 h-4" /> },
              { labelKey: 'NAV.TOYS.THREE_D', href: '/shop?category=Toys&type=3d', icon: <Icon name="puzzle" className="w-4 h-4" /> },
            ]},
          ]
        },
        {
          titleKey: 'NAV.SCHOOL.TITLE',
          links: [
            { labelKey: 'NAV.SCHOOL.BACKPACKS', href: '/shop?category=School Items', subLinks: [
              { labelKey: 'NAV.SCHOOL.ERGONOMIC', href: '/shop?category=School Items&type=ergonomic', icon: <Icon name="backpack" className="w-4 h-4" /> },
              { labelKey: 'NAV.SCHOOL.THEMED', href: '/shop?category=School Items&type=themed', icon: <Icon name="backpack" className="w-4 h-4" /> },
            ] },
            { labelKey: 'NAV.SCHOOL.LUNCHBOXES', href: '/shop?category=School Items' },
          ]
        }
      ]
    },
    { labelKey: 'NAV.ABOUT', href: '/about' },
    { labelKey: 'NAV.AI_GENERATOR', href: '/', id: 'nav_ai_generator' },
    { labelKey: 'NAV.MY_ACCOUNT', href: '/my-account' },
    { labelKey: 'NAV.DASHBOARD', href: '/dashboard' },
];
