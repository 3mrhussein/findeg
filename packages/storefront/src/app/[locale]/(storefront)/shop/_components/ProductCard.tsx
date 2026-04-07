"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Eye, Star, ShoppingCart } from "lucide-react";
import { Link } from "@i18n/navigation";
import type { Product } from "@features/catalog/domain/entities/Product";
import { ProductEntity } from "@features/catalog/domain/entities/Product";
import { VariantEntity } from "@features/catalog/domain/entities/Variant";
import type { UomCode } from "@features/core/domain/types/common";
import { getCanonicalProductHref } from "@features/catalog/presentation/utils/product-url";
import { useCart } from "@hooks/useCart";
import { useToast } from "@hooks/use-toast";
import { useUser } from "@hooks/useUser";
import { Button } from "@ui";
import { Badge } from "@ui";
import { Skeleton } from "@ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui";
import { IconTooltip } from "@ui";
import { cn } from "@lib/utils";

export interface ProductCardBrand {
  id: number;
  name: string;
  logoUrl?: string | null;
}

interface ProductCardProps {
  product: Product;
  view: "grid" | "list";
  brand?: ProductCardBrand;
}

interface UomOption {
  code: UomCode;
  label: string;
  price: number;
  strikePrice?: number;
}

function resolveUomLabel(
  localizedLabel: { en?: string; ar?: string } | string | undefined,
  locale: string,
  fallback: string,
): string {
  if (!localizedLabel) return fallback;
  if (typeof localizedLabel === "string") return localizedLabel;
  if (locale === "ar" && localizedLabel.ar) return localizedLabel.ar;
  return localizedLabel.en || localizedLabel.ar || fallback;
}

export function ProductCard({ product, view, brand }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("Pages.ProductCard");
  const egpFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
        style: "currency",
        currency: "EGP",
      }),
    [locale],
  );

  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currentUser, toggleWishlistItem } = useUser();

  const primaryVariant = useMemo(() => {
    const variants = product.variants || [];
    return variants.find((variant) => variant.variantKey === "default") || variants[0];
  }, [product.variants]);

  const stockSnapshot = useMemo(() => {
    if (!primaryVariant) {
      return {
        inStock: false,
        lowStock: false,
        availableUnits: 0,
      };
    }

    const hasInventoryData = (product.variants || []).some(
      (variant) => (variant.inventory?.length ?? 0) > 0,
    );
    if (!hasInventoryData) {
      return {
        inStock: true,
        lowStock: false,
        availableUnits: 0,
      };
    }

    const entity = new VariantEntity(primaryVariant);
    return {
      inStock: entity.isInStock(),
      lowStock: entity.isLowStock(),
      availableUnits: entity.getAvailableStock(),
    };
  }, [primaryVariant, product.variants]);

  const discountPercentage = useMemo(() => {
    if (!primaryVariant) return 0;
    return new VariantEntity(primaryVariant).getDiscountPercentage();
  }, [primaryVariant]);

  const uomOptions = useMemo<UomOption[]>(() => {
    if (!primaryVariant) return [];

    const variantEntity = new VariantEntity(primaryVariant);
    const sellableUoms = (primaryVariant.sellableUoms || []).filter((uom) => uom.isEnabled);

    if (sellableUoms.length === 0) {
      return [
        {
          code: "pcs",
          label: "pcs",
          price: primaryVariant.basePrice,
          strikePrice: primaryVariant.strikePrice,
        },
      ];
    }

    return sellableUoms.map((uom) => {
      const quote = variantEntity.getPriceForUom(uom.uomCode);
      const price = quote?.unitPrice ?? primaryVariant.basePrice * uom.factorToBase;
      const strikePrice = primaryVariant.strikePrice
        ? primaryVariant.strikePrice * uom.factorToBase
        : undefined;

      return {
        code: uom.uomCode,
        label: resolveUomLabel(
          uom.localizedLabel as { en?: string; ar?: string } | string | undefined,
          locale,
          uom.uomCode,
        ),
        price,
        strikePrice,
      };
    });
  }, [locale, primaryVariant]);

  const [selectedUomCode, setSelectedUomCode] = useState<UomCode | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const selectedUom = useMemo(
    () =>
      (selectedUomCode
        ? uomOptions.find((option) => option.code === selectedUomCode)
        : undefined) || uomOptions[0],
    [selectedUomCode, uomOptions],
  );

  const currentPrice = selectedUom?.price || primaryVariant?.basePrice || 0;
  const originalPrice = selectedUom?.strikePrice;
  const isWishlisted = Boolean(currentUser?.wishlist.includes(product.id));

  const imageUrl =
    primaryVariant?.images?.[0]?.url ||
    product.mediaSet?.card?.url ||
    product.mediaSet?.thumbnail?.url ||
    `https://picsum.photos/seed/${product.id}/600/600`;

  const badge = useMemo(() => {
    if (discountPercentage > 0) {
      return {
        text: t("SaleBadge", { percent: discountPercentage }),
        className: "bg-amber-500 text-white",
      };
    }
    if (stockSnapshot.lowStock) {
      return {
        text: t("LowStockBadge"),
        className: "bg-orange-500 text-white",
      };
    }
    if (new ProductEntity(product).isNew()) {
      return {
        text: t("NewBadge"),
        className: "bg-emerald-600 text-white",
      };
    }
    return null;
  }, [discountPercentage, product, stockSnapshot.lowStock, t]);

  const handleAddToCart = () => {
    if (!primaryVariant || !stockSnapshot.inStock || !selectedUom) return;
    addToCart(product.id, 1, {
      variantId: primaryVariant.id,
      uomCode: selectedUom.code,
    });
  };

  const handleWishlistToggle = () => {
    const isAdding = !isWishlisted;
    toggleWishlistItem(product.id);
    if (isAdding) {
      toast({
        title: t("SavedToWishlist"),
      });
    }
  };

  const stockLabel = !stockSnapshot.inStock
    ? t("OutOfStock")
    : stockSnapshot.lowStock
      ? t("OnlyLeft", { count: stockSnapshot.availableUnits })
      : t("InStock");

  const stockClassName = !stockSnapshot.inStock
    ? "text-red-600 dark:text-red-400"
    : stockSnapshot.lowStock
      ? "text-orange-600 dark:text-orange-400"
      : "text-emerald-600 dark:text-emerald-400";

  const imageSection = (
    <div className="relative overflow-hidden rounded-xl bg-muted">
      {!imageLoaded && <Skeleton className="absolute inset-0 z-10 rounded-none" />}
      <Image
        src={imageUrl}
        alt={product.name}
        width={600}
        height={600}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition duration-300",
          view === "grid" ? "aspect-square group-hover:scale-[1.02]" : "aspect-square",
        )}
        sizes={view === "grid" ? "(max-width: 768px) 50vw, 25vw" : "120px"}
      />

      {badge && (
        <Badge className={cn("absolute start-3 top-3 z-20 rounded-full", badge.className)}>
          {badge.text}
        </Badge>
      )}

      <IconTooltip label={isWishlisted ? t("RemoveWishlist") : t("SaveToWishlist")} asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute inset-e-3 top-3 z-20 rounded-full bg-background/90 hover:bg-background"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? t("RemoveWishlist") : t("SaveToWishlist")}
        >
          <Heart className={cn("size-4", isWishlisted && "fill-current text-red-500")} />
        </Button>
      </IconTooltip>

      {view === "grid" && (
        <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center md:flex">
          <div className="rounded-full bg-background/90 p-3 text-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
            <Eye className="size-4" />
          </div>
        </div>
      )}
    </div>
  );

  const detailsSection = (
    <div className="flex min-w-0 flex-1 flex-col">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={getCanonicalProductHref(product)}
            className="line-clamp-2 text-sm font-semibold leading-5 text-foreground hover:text-primary"
          >
            {product.name}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top">{product.name}</TooltipContent>
      </Tooltip>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {brand?.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={20}
            height={20}
            className="size-5 rounded-sm object-contain"
          />
        ) : null}
        <span className="truncate">{brand?.name || product.brandName || t("UnknownBrand")}</span>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
        <span>({product.reviewsCount})</span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-base font-bold text-foreground">
          {egpFormatter.format(currentPrice)}
        </span>
        {originalPrice && originalPrice > currentPrice ? (
          <span className="text-xs text-muted-foreground line-through">
            {egpFormatter.format(originalPrice)}
          </span>
        ) : null}
      </div>

      {uomOptions.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {/* Wishlist button overlay */}
          <div className="absolute top-3 inset-s-3 hidden group-hover:block">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                // Add to wishlist logic here
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Add overlay */}
          <div
            className="absolute bottom-3 inset-e-3 hidden group-hover:block"
            onClick={(e) => e.preventDefault()}
          >
            {uomOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => setSelectedUomCode(option.code)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  (selectedUomCode || selectedUom?.code) === option.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("mt-2 text-xs font-medium", stockClassName)}>{stockLabel}</div>

      <div className="mt-4">
        {stockSnapshot.inStock ? (
          <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart />
            {t("AddToCartFull")}
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block w-full">
                <Button className="w-full" disabled>
                  <ShoppingCart />
                  {t("OutOfStock")}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t("OutOfStockTooltip")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  if (view === "list") {
    return (
      <article className="group flex gap-4 rounded-2xl border bg-card p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="w-[120px] shrink-0">{imageSection}</div>
        <div className="min-w-0 flex-1">{detailsSection}</div>
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border bg-card p-3 shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg">
      {imageSection}
      <div className="mt-3">{detailsSection}</div>
    </article>
  );
}
