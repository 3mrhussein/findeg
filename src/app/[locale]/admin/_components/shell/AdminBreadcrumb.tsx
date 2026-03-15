"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ADMIN_NAV, NavItem } from "@/features/administration/presentation/config/nav-config";

export interface AdminBreadcrumbProps {
  locale?: string;
}

export function AdminBreadcrumb({ locale = "en" }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  // Normalize pathname: remove locale
  const normalizedPathname = pathname.replace(new RegExp(`^/${locale}`), "");

  // Do not render breadcrumbs on dashboard
  if (normalizedPathname === "/admin" || normalizedPathname === "/admin/") {
    return null;
  }

  const segments = normalizedPathname.split("/").filter(Boolean);
  // Example: segments = ["admin", "products", "create"]

  // We want to skip the "admin" segment in the breadcrumb display if desired,
  // but let's include Home -> segments

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
    // Reconstruct the path up to this segment to see if it matches a nav item exactly
    const segmentPath = `/${segments.slice(0, currentIndex + 1).join("/")}`;

    // Check if there is an exact match in the nav configuration
    const matchingItem = flatNav.find((item) => item.href === segmentPath);
    if (matchingItem) {
      return locale === "ar" ? matchingItem.labelAr : matchingItem.label;
    }

    // Default: capitalize the segment
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  const breadcrumbs = segments.map((segment, index) => {
    const isFirst = index === 0;
    // Special case for 'admin': we might just map it to Home icon or "Dashboard"
    if (isFirst && segment === "admin") {
      return {
        label: locale === "ar" ? "لوحة القيادة" : "Dashboard",
        href: `/${locale}/admin`,
        isLast: index === segments.length - 1,
      };
    }

    return {
      label: getLabelForSegment(segment, index),
      href: `/${locale}/${segments.slice(0, index + 1).join("/")}`,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <div className="flex items-center h-[48px] px-6 border-b border-gray-200 bg-white shrink-0">
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[13px]">
        {/* Dynamic Breadcrumbs */}
        {breadcrumbs
          .filter(
            (crumb, index) => !(index === 0 && segments[0] === "admin" && segments.length > 1),
          )
          .map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <ChevronRight className="h-[14px] w-[14px] text-gray-300 mx-1" />}
              {crumb.isLast ? (
                <span className="text-gray-800 font-semibold" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
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
