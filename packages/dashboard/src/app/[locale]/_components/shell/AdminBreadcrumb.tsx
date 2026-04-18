"use client";

import * as React from "react";
import { usePathname } from "@i18n/navigation";
import { Link } from "@i18n/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ADMIN_NAV, NavItem } from "@dashboard/features/administration/presentation/config/nav-config";

export interface AdminBreadcrumbProps {
  locale?: string;
}

export function AdminBreadcrumb({ locale = "en" }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  // Normalize pathname: remove locale
  const normalizedPathname = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  // Do not render breadcrumbs on dashboard (root)
  if (normalizedPathname === "/") {
    return null;
  }

  const segments = normalizedPathname.split("/").filter(Boolean);
  // Example: segments = ["products", "create"]

  // Flatten tree to find labels
  const flatNav: NavItem[] = [];
  ADMIN_NAV.forEach((group) => {
    group.items.forEach((item) => {
      flatNav.push(item);
      if (item.children) {
        item.children.forEach((child) => flatNav.push(child));
      }
    });
  });

  const getLabelForSegment = (segment: string, currentIndex: number) => {
    // Reconstruct the path up to this segment
    const segmentPath = `/${segments.slice(0, currentIndex + 1).join("/")}`;

    // Check matching nav item
    const matchingItem = flatNav.find((item) => item.href === segmentPath);
    if (matchingItem) {
      return locale === "ar" ? matchingItem.labelAr : matchingItem.label;
    }

    // Default: capitalize
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  const breadcrumbs = segments.map((segment, index) => {
    return {
      label: getLabelForSegment(segment, index),
      href: `/${segments.slice(0, index + 1).join("/")}`,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <div className="flex items-center h-[40px] px-6 bg-transparent shrink-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px]">
        <Link href="/" className="text-gray-400 hover:text-indigo-600 transition-colors">
          <Home className="h-[14px] w-[14px]" />
        </Link>

        {/* Dynamic Breadcrumbs */}
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <ChevronRight className="h-[14px] w-[14px] text-gray-300 dark:text-slate-600 mx-1 rtl:rotate-180" />
            {crumb.isLast ? (
              <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}
