"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 *
 */
export function ShopSortSelect() {
  const t = useTranslations("Pages.Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   *
   */
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-slate-900 dark:text-white">Sort By</span>
      <Select
        defaultValue={searchParams.get("sort") || "featured"}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-[180px] rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-10 px-4 text-sm font-medium">
          <SelectValue placeholder="Featured" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="newest">Newest Arrivals</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
