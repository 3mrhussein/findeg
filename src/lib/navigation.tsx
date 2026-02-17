import type { NavigationItem } from "@/lib/types";
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
  { labelKey: "Nav.Shop", href: "/shop" },
  { labelKey: "Nav.Search", href: "/search" },
  {
    labelKey: "Nav.Categories",
    href: "/categories",
    isMegaMenu: true,
    megaMenuColumns: [
      {
        titleKey: "Nav.Stationary.Title",
        links: [
          {
            labelKey: "Nav.Stationary.Pens",
            href: "/shop?category=Stationary",
            subLinks: [
              {
                labelKey: "Nav.Stationary.GelPens",
                href: "/shop?category=Stationary&type=gel",
                iconName: "pen",
              },
              {
                labelKey: "Nav.Stationary.Ballpoint",
                href: "/shop?category=Stationary&type=ballpoint",
                iconName: "pen",
              },
            ],
          },
          { labelKey: "Nav.Stationary.Notebooks", href: "/shop?category=Stationary" },
          {
            labelKey: "Nav.Stationary.ArtSupplies",
            href: "/shop?category=Stationary",
            isNew: true,
          },
        ],
      },
      {
        titleKey: "Nav.Toys.Title",
        links: [
          { labelKey: "Nav.Toys.Educational", href: "/shop?category=Toys" },
          { labelKey: "Nav.Toys.Blocks", href: "/shop?category=Toys" },
          {
            labelKey: "Nav.Toys.Puzzles",
            href: "/shop?category=Toys",
            subLinks: [
              {
                labelKey: "Nav.Toys.Jigsaw",
                href: "/shop?category=Toys&type=jigsaw",
                iconName: "puzzle",
              },
              {
                labelKey: "Nav.Toys.ThreeD",
                href: "/shop?category=Toys&type=3d",
                iconName: "puzzle",
              },
            ],
          },
        ],
      },
      {
        titleKey: "Nav.School.Title",
        links: [
          {
            labelKey: "Nav.School.Backpacks",
            href: "/shop?category=School Items",
            subLinks: [
              {
                labelKey: "Nav.School.Ergonomic",
                href: "/shop?category=School Items&type=ergonomic",
                iconName: "backpack",
              },
              {
                labelKey: "Nav.School.Themed",
                href: "/shop?category=School Items&type=themed",
                iconName: "backpack",
              },
            ],
          },
          { labelKey: "Nav.School.Lunchboxes", href: "/shop?category=School Items" },
        ],
      },
    ],
  },
  { labelKey: "Nav.SchoolLists", href: "/school-lists" },
  { labelKey: "Nav.MyAccount", href: "/my-account" },
  { labelKey: "Nav.Dashboard", href: "/dashboard" },
];
