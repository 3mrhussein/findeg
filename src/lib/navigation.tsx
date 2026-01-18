import React from 'react';
import type { NavigationItem } from '@/types';
import { Icon } from '@/presentation/components/shared/Icon';

/**
 * Defines the main navigation structure of the application.
 * 
 * This schema is used to generate the header navigation menu, including the mega menu.
 * It supports nested links, icons, and "New" badges.
 * 
 * @type {NavigationItem[]}
 */
export const navigationSchema: NavigationItem[] = [
    { labelKey: 'nav_shop', href: '/shop' },
    { 
      labelKey: 'nav_categories', 
      href: '/categories',
      isMegaMenu: true,
      megaMenuColumns: [
        {
          titleKey: 'category_stationary_title',
          links: [
            { labelKey: 'category_stationary_pens', href: '/shop?category=Stationary', subLinks: [
              { labelKey: 'sub_gel_pens', href: '/shop?category=Stationary&type=gel', icon: <Icon name="pen" className="w-4 h-4" /> },
              { labelKey: 'sub_ballpoint', href: '/shop?category=Stationary&type=ballpoint', icon: <Icon name="pen" className="w-4 h-4" /> },
            ]},
            { labelKey: 'category_stationary_notebooks', href: '/shop?category=Stationary' },
            { labelKey: 'category_stationary_art', href: '/shop?category=Stationary', isNew: true },
          ]
        },
        {
          titleKey: 'category_toys_title',
          links: [
            { labelKey: 'category_toys_educational', href: '/shop?category=Toys' },
            { labelKey: 'category_toys_blocks', href: '/shop?category=Toys' },
            { labelKey: 'category_toys_puzzles', href: '/shop?category=Toys', subLinks: [
              { labelKey: 'sub_jigsaw', href: '/shop?category=Toys&type=jigsaw', icon: <Icon name="puzzle" className="w-4 h-4" /> },
              { labelKey: 'sub_3d_puzzles', href: '/shop?category=Toys&type=3d', icon: <Icon name="puzzle" className="w-4 h-4" /> },
            ]},
          ]
        },
        {
          titleKey: 'category_school_title',
          links: [
            { labelKey: 'category_school_backpacks', href: '/shop?category=School Items', subLinks: [
              { labelKey: 'sub_ergonomic', href: '/shop?category=School Items&type=ergonomic', icon: <Icon name="backpack" className="w-4 h-4" /> },
              { labelKey: 'sub_themed', href: '/shop?category=School Items&type=themed', icon: <Icon name="backpack" className="w-4 h-4" /> },
            ] },
            { labelKey: 'category_school_lunchboxes', href: '/shop?category=School Items' },
          ]
        }
      ]
    },
    { labelKey: 'nav_ai_generator', href: '/#ai-generator' },
    { labelKey: 'nav_about', href: '/about' },
    { labelKey: 'nav_my_account', href: '/my-account' },
    { labelKey: 'nav_dashboard', href: '/dashboard' },
];
