/**
 * School Data Layer (Storefront)
 */
"use cache";

import { cacheTag, cacheLife } from "next/cache";
import { createCatalogServices } from "@findeg/backend/features/catalog";
import { parse } from "@findeg/backend/features/core";
import type { Product, Category } from "../catalog/types";

/**
 * Helper to map backend product to storefront product
 */
function mapProduct(p: any, locale: string): Product {
  return {
    ...p,
    slug: p.localizedSlug?.[locale] || p.localizedSlug?.en || p.slug || "",
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      inventory: v.inventory || [],
    })),
    isNew: p.createdAt
      ? new Date(p.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      : false,
  };
}

/**
 * Retrieves a school list by code and hydrates products.
 */
export async function getSchoolListData(locale: string, code: string) {
  const resLocale = parse(locale);
  cacheTag(`school-list-${code}`);
  cacheLife("hours");

  const { schoolLists, products: productService } = createCatalogServices();
  const list = await schoolLists.getListBySlug(code);

  if (!list) {
    return {
      products: [],
      productIds: [],
      totalEstimatedCost: 0,
    };
  }

  // Aggregate products from the default alternatives
  const products = [];
  const productIds = [];
  let totalEstimatedCost = 0;

  if (list.items) {
    for (const item of list.items) {
      const defaultAlt = item.alternatives?.find((alt) => alt.isDefault) || item.alternatives?.[0];
      if (defaultAlt) {
        // In a real app we'd batch fetch, but for now we follow the service interface
        const product = await productService.getById(defaultAlt.variant?.productId || 0, resLocale);
        if (product) {
          products.push(mapProduct(product, resLocale));
          productIds.push(product.id);
          totalEstimatedCost += Number(defaultAlt.variant?.basePrice || 0) * item.quantityRequired;
        }
      }
    }
  }

  return {
    products,
    productIds,
    totalEstimatedCost,
  };
}

/**
 * Search schools in the directory.
 */
export async function searchSchools(params: any) {
  cacheTag("schools", `school-search-${JSON.stringify(params)}`);
  cacheLife("hours");

  const { schoolLists } = createCatalogServices();
  const all = await schoolLists.getActiveLists();

  const filtered = all.filter(
    (s) => !params.query || s.schoolName.toLowerCase().includes(params.query.toLowerCase()),
  );

  // Group by school name to form SchoolSearchResult shape
  const groups = new Map<string, any>();
  for (const list of filtered) {
    if (!groups.has(list.schoolName)) {
      groups.set(list.schoolName, {
        schoolName: list.schoolName,
        schoolType: list.schoolType || "General",
        academicSystem: list.academicSystem || "Mixed",
        area: list.area || "Unknown",
        governorate: list.governorate || "Egypt",
        gradeCount: 0,
        hasCurrentLists: false,
      });
    }
    const group = groups.get(list.schoolName);
    group.gradeCount++;
    if (list.academicYear?.includes("2024") || list.academicYear?.includes("2025")) {
      group.hasCurrentLists = true;
    }
  }

  const items = Array.from(groups.values());

  return {
    items,
    totalCount: items.length,
  };
}

/**
 * Get filter options for schools.
 */
export async function getSchoolFilterOptions() {
  cacheTag("school-filters");
  cacheLife("days");

  return {
    governorates: ["Cairo", "Giza", "Alexandria", "Qaliubiya"],
    schoolTypes: ["National", "International", "Language", "IGCSE", "American"],
  };
}

/**
 * Get school profile by slug.
 */
export async function getSchoolProfile(slug: string, userId: number | null = null) {
  cacheTag(`school-${slug}`);
  cacheLife("hours");

  const { schoolLists } = createCatalogServices();
  const allActive = await schoolLists.getActiveLists();

  // Find all lists for this school (grouped by schoolName)
  // In a real app we might have a separate school entity, but for now we group by common properties
  const schoolNameFromSlug = slug.replace(/-/g, " ");
  const schoolListsForProfile = allActive.filter(
    (s) =>
      s.schoolName.toLowerCase() === schoolNameFromSlug.toLowerCase() || s.slug.startsWith(slug),
  );

  if (schoolListsForProfile.length === 0) return null;

  const main = schoolListsForProfile[0];

  return {
    name: main.schoolName,
    schoolType: main.schoolType || "General",
    academicSystem: main.academicSystem || "Mixed",
    area: main.area || "Unknown",
    governorate: main.governorate || "Egypt",
    lists: schoolListsForProfile.map((l) => ({
      ...l,
      name: `${l.grade} - ${l.academicYear}`,
    })),
  };
}

/**
 * Get school list page data.
 */
export async function getSchoolListPageData(slug: string, userId: number | null) {
  const resLocale = "en"; // Defaulting to en for lists
  cacheTag(`school-list-${slug}`);
  cacheLife("hours");

  const { schoolLists } = createCatalogServices();
  const list = await schoolLists.getListBySlug(slug);

  if (!list) return null;

  // Aggregate hydrated products (same logic as getSchoolListData)
  const fullListDetails = await getSchoolListData(resLocale, slug);

  return {
    list,
    accessState: "public", // TODO: Integrate with schoolAccess service if needed
    sessionState: userId ? "has_session" : "first_visit",
    fullList: {
      ...list,
      ...fullListDetails,
    },
  };
}
