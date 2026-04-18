"use client";

import Image from "next/image";
import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";

export interface RecentlyViewedItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface RecentlyViewedRailProps {
  items: RecentlyViewedItem[];
}

/**
 * Compact recently viewed products strip.
 */
export function RecentlyViewedRail({ items }: RecentlyViewedRailProps) {
  const t = useTranslations("Pages.ProductDetail");

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="inline-flex items-center gap-2 text-xl font-bold text-foreground">
        <History className="size-5" />
        {t("RecentlyViewed")}
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={`${item.id}-${item.slug}`}
            href={`/shop/products/${item.slug}`}
            className="min-w-[210px] shrink-0 rounded-xl border bg-card p-3 hover:shadow-md"
          >
            <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="210px" />
            </div>
            <div className="line-clamp-2 text-sm font-semibold text-foreground">{item.name}</div>
            <div className="mt-1 text-sm text-primary">EGP {item.price.toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
