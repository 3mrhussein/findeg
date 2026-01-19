import React from 'react';
import type { NavigationItem } from '@/types';
import { Icon } from '@/presentation/shared/components/Icon';
import { T } from '@/i18n/content';

/**
 * Defines the main navigation structure of the application.
 * 
 * This schema is used to generate the header navigation menu, including the mega menu.
 * It supports nested links, icons, and "New" badges.
 * 
 * @type {NavigationItem[]}
 */
export const navigationSchema: NavigationItem[] = [
    { labelKey: T.NAV.SHOP as any, href: '/shop' },
    { 
      labelKey: T.NAV.CATEGORIES as any, 
      href: '/categories',
      isMegaMenu: true,
      megaMenuColumns: [
        {
          titleKey: T.NAV.STATIONARY.TITLE as any,
          links: [
            { labelKey: T.NAV.STATIONARY.PENS as any, href: '/shop?category=Stationary', subLinks: [
              { labelKey: T.NAV.STATIONARY.GEL_PENS as any, href: '/shop?category=Stationary&type=gel', icon: <Icon name="pen" className="w-4 h-4" /> },
              { labelKey: T.NAV.STATIONARY.BALLPOINT as any, href: '/shop?category=Stationary&type=ballpoint', icon: <Icon name="pen" className="w-4 h-4" /> },
            ]},
            { labelKey: T.NAV.STATIONARY.NOTEBOOKS as any, href: '/shop?category=Stationary' },
            { labelKey: T.NAV.STATIONARY.ART_SUPPLIES as any, href: '/shop?category=Stationary', isNew: true },
          ]
        },
        {
          titleKey: T.NAV.TOYS.TITLE as any,
          links: [
            { labelKey: T.NAV.TOYS.EDUCATIONAL as any, href: '/shop?category=Toys' },
            { labelKey: T.NAV.TOYS.BLOCKS as any, href: '/shop?category=Toys' },
            { labelKey: T.NAV.TOYS.PUZZLES as any, href: '/shop?category=Toys', subLinks: [
              { labelKey: T.NAV.TOYS.JIGSAW as any, href: '/shop?category=Toys&type=jigsaw', icon: <Icon name="puzzle" className="w-4 h-4" /> },
              { labelKey: T.NAV.TOYS.THREE_D as any, href: '/shop?category=Toys&type=3d', icon: <Icon name="puzzle" className="w-4 h-4" /> },
            ]},
          ]
        },
        {
          titleKey: T.NAV.SCHOOL.TITLE as any,
          links: [
            { labelKey: T.NAV.SCHOOL.BACKPACKS as any, href: '/shop?category=School Items', subLinks: [
              { labelKey: T.NAV.SCHOOL.ERGONOMIC as any, href: '/shop?category=School Items&type=ergonomic', icon: <Icon name="backpack" className="w-4 h-4" /> },
              { labelKey: T.NAV.SCHOOL.THEMED as any, href: '/shop?category=School Items&type=themed', icon: <Icon name="backpack" className="w-4 h-4" /> },
            ] },
            { labelKey: T.NAV.SCHOOL.LUNCHBOXES as any, href: '/shop?category=School Items' },
          ]
        }
      ]
    },
    { labelKey: T.NAV.ABOUT as any, href: '/about' },
    { labelKey: T.NAV.AI_GENERATOR as any, href: '/', id: 'nav_ai_generator' },
    { labelKey: T.NAV.MY_ACCOUNT as any, href: '/my-account' },
    { labelKey: T.NAV.DASHBOARD as any, href: '/dashboard' },
];
