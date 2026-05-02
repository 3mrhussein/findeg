"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  Heart,
  Minus,
  Package,
  RefreshCw,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Button } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
import { useCart } from "@hooks/useCart";
import { useUser } from "@hooks/useUser";
import { cn } from "@lib/utils";
import type {
  Product,
  Variant,
  CustomerGroup,
  ProductPdpViewModel,
  UomCode as UoMCode,
} from "@/data/catalog/types";
import { ImageGallery } from "./ImageGallery";
import { ProductTabsSection } from "./ProductTabsSection";
import { RelatedProductsRail } from "./RelatedProductsRail";
import { RecentlyViewedRail, type RecentlyViewedItem } from "./RecentlyViewedRail";
import { getProductPricingAction } from "@/app/[locale]/(storefront)/_actions/catalog";

function getProductStatusBadge({ product, variant, lowStock }: any) {
  if (lowStock) return { kind: "low-stock" as const };
  const strike = Number(variant.strikePrice);
  const base = Number(variant.basePrice);
  if (strike && strike > base) {
    const percent = Math.round(((strike - base) / strike) * 100);
    return { kind: "sale" as const, percent };
  }
  return null;
}

interface UomOption {
  code: UoMCode;
  label: string;
  factorToBase: number;
}

interface PriceState {
  unitPrice: number;
  currency: string;
  loading: boolean;
}

function hasExplicitInventory(product: Product): boolean {
  return (product.variants || []).some((variant) => (variant.inventory?.length ?? 0) > 0);
}

function getAttributeMap(variant?: Variant): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attribute of variant?.attributes || []) {
    if (attribute.valueText) {
      map[attribute.key] = attribute.valueText;
    }
  }
  return map;
}

function isColorKey(key: string): boolean {
  return /color|colour|لون/i.test(key);
}

function isCssColorCandidate(value: string): boolean {
  return (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ||
    /^(rgb|rgba|hsl|hsla)\(/i.test(value) ||
    /^[a-z]+$/i.test(value)
  );
}

function resolveUomLabel(uom: UomOption, locale: string): string {
  const labels: Record<UoMCode, { en: string; ar: string }> = {
    pcs: { en: "pcs", ar: "قطعة" },
    pack: { en: "pack", ar: "عبوة" },
    carton: { en: "carton", ar: "كرتونة" },
  };

  const label = labels[uom.code];
  return locale === "ar" ? label.ar : label.en;
}

function resolveVariantStock(product: Product, variant?: Variant) {
  if (!variant) {
    return {
      inStock: false,
      lowStock: false,
      availableUnits: 0,
    };
  }

  if (!hasExplicitInventory(product)) {
    return {
      inStock: true,
      lowStock: false,
      availableUnits: 99,
    };
  }

  const inventory = variant.inventory || [];
  const availableUnits = inventory.reduce((acc, inv) => acc + (inv.onHand || 0), 0);
  const inStock = availableUnits > 0;
  const lowStock = inStock && availableUnits < 5;

  return {
    inStock,
    lowStock,
    availableUnits,
  };
}

function getFallbackUomPrice(
  variant: Variant,
  uom: UomOption,
  customerGroup: CustomerGroup,
): number {
  const exact = variant.priceLists?.find(
    (entry) => entry.customerGroup === customerGroup && entry.uomCode === uom.code,
  );
  if (exact) return exact.unitPrice;

  const b2c = variant.priceLists?.find(
    (entry) => entry.customerGroup === "public_b2c" && entry.uomCode === uom.code,
  );
  if (b2c) return Number(b2c.unitPrice);

  return Number(variant.basePrice) * uom.factorToBase;
}

/**
 * Interactive PDP content.
 */
export function ProductDetailClient({ vm }: { vm: ProductPdpViewModel }) {
  const t = useTranslations("Pages.ProductDetail");
  const tCard = useTranslations("Pages.ProductCard");
  const locale = useLocale();
  const egpFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
        style: "currency",
        currency: "EGP",
      }),
    [locale],
  );

  const { addToCart } = useCart();
  const { currentUser, toggleWishlistItem } = useUser();

  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(
    vm.selectedVariant?.id,
  );
  const variants = useMemo(
    () => (vm.product.variants || []).filter((variant: any) => variant.isActive !== false),
    [vm.product.variants],
  );

  const selectedVariant =
    variants.find((variant: any) => variant.id === selectedVariantId) ||
    variants.find((variant: any) => variant.variantKey === "default") ||
    variants[0];

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() =>
    getAttributeMap(selectedVariant),
  );

  // We update selectedAttributes when variant changes via selection events

  const uomOptions = useMemo<UomOption[]>(() => {
    if (!selectedVariant) return [];

    const enabled = (selectedVariant.sellableUoms || []).filter((uom: any) => uom.isEnabled);
    if (enabled.length === 0) {
      return [
        {
          code: "pcs",
          label: "pcs",
          factorToBase: 1,
        },
      ];
    }

    return enabled.map((uom: any) => ({
      code: uom.uomCode,
      label: uom.uomCode,
      factorToBase: uom.factorToBase,
    }));
  }, [selectedVariant]);

  const [selectedUomCode, setSelectedUomCode] = useState<UoMCode | undefined>(
    () => uomOptions[0]?.code,
  );

  const selectedUom = uomOptions.find((uom) => uom.code === selectedUomCode) || uomOptions[0];

  const [priceState, setPriceState] = useState<PriceState>({
    unitPrice: Number(selectedVariant?.basePrice || 0),
    currency: "EGP",
    loading: false,
  });

  useEffect(() => {
    if (!selectedVariant || !selectedUom) return;

    let active = true;

    // Defer loading state to avoid synchronous state update in effect warning
    Promise.resolve().then(() => {
      if (active) setPriceState((prev) => ({ ...prev, loading: true }));
    });

    const payload = {
      productId: vm.product.id,
      variantId: selectedVariant.id,
      uom: selectedUom.code,
      customerGroup: vm.customerGroup,
      quantity: 1,
    };

    getProductPricingAction(payload)
      .then((json) => {
        if (!active) return;

        if (json?.success && json.data) {
          setPriceState({
            unitPrice: Number(json.data.unitPrice || selectedVariant.basePrice),
            currency: json.data.currency || "EGP",
            loading: false,
          });
          return;
        }

        setPriceState({
          unitPrice: getFallbackUomPrice(
            vm.product.variants?.find((v: any) => v.id === selectedVariant.id) || selectedVariant,
            selectedUom,
            vm.customerGroup,
          ),
          currency: "EGP",
          loading: false,
        });
      })
      .catch(() => {
        if (!active) return;
        setPriceState({
          unitPrice: getFallbackUomPrice(selectedVariant, selectedUom, vm.customerGroup),
          currency: "EGP",
          loading: false,
        });
      });

    return () => {
      active = false;
    };
  }, [selectedVariant, selectedUom, vm.product.id, vm.product.variants, vm.customerGroup]);

  const bestValueCode = useMemo(() => {
    if (!selectedVariant || uomOptions.length <= 1) return null;

    let best: { code: UoMCode; value: number } | null = null;

    for (const uom of uomOptions) {
      const unitPrice = getFallbackUomPrice(selectedVariant, uom, vm.customerGroup);
      const perBaseUnit = unitPrice / Math.max(uom.factorToBase, 1);
      if (!best || perBaseUnit < best.value) {
        best = { code: uom.code, value: perBaseUnit };
      }
    }

    return best?.code || null;
  }, [selectedVariant, uomOptions, vm.customerGroup]);

  const stockSnapshot = resolveVariantStock(vm.product, selectedVariant);
  const maxQuantity = stockSnapshot.inStock ? Math.max(stockSnapshot.availableUnits, 1) : 1;

  const [quantity, setQuantity] = useState(1);

  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const onAddToCart = () => {
    if (!selectedVariant || !selectedUom || !stockSnapshot.inStock) return;

    addToCart(vm.product.id, quantity, {
      variantId: selectedVariant.id,
      uomCode: selectedUom.code as any,
    });

    setIsAdded(true);
    window.dispatchEvent(new CustomEvent("findeg:cart-added", { detail: { count: quantity } }));
    window.setTimeout(() => setIsAdded(false), 1500);
  };

  const isWishlisted = Boolean(currentUser?.wishlist.includes(vm.product.id));

  const onWishlistToggle = () => {
    toggleWishlistItem(vm.product.id);
  };

  const allAttributeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const variant of variants) {
      for (const attribute of variant.attributes || []) {
        keys.add(attribute.key);
      }
    }
    return Array.from(keys);
  }, [variants]);

  const galleryImages = useMemo(
    () =>
      (selectedVariant?.images || []).map((image: any) => ({
        url: image.url,
        alt: image.alt,
      })),
    [selectedVariant?.images],
  );

  const badge = useMemo(() => {
    const resolved = getProductStatusBadge({
      product: vm.product,
      variant: selectedVariant,
      lowStock: stockSnapshot.lowStock,
    });

    if (!resolved) return null;

    if (resolved.kind === "sale") {
      return {
        text: tCard("SaleBadge", { percent: resolved.percent || 0 }),
        className: "bg-amber-500 text-white",
      };
    }
    if (resolved.kind === "low-stock") {
      return {
        text: tCard("LowStockBadge"),
        className: "bg-orange-500 text-white",
      };
    }

    return {
      text: tCard("NewBadge"),
      className: "bg-emerald-600 text-white",
    };
  }, [selectedVariant, stockSnapshot.lowStock, tCard, vm.product]);

  const stockText = !stockSnapshot.inStock
    ? tCard("OutOfStock")
    : stockSnapshot.lowStock
      ? tCard("OnlyLeft", { count: stockSnapshot.availableUnits })
      : tCard("InStock");

  const stockClass = !stockSnapshot.inStock
    ? "text-red-600"
    : stockSnapshot.lowStock
      ? "text-orange-600"
      : "text-emerald-600";

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem("findeg_recently_viewed");
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  });

  useEffect(() => {
    if (!selectedVariant) return;

    const storageKey = "findeg_recently_viewed";
    const current: RecentlyViewedItem = {
      id: vm.product.id,
      slug: vm.canonicalSlug,
      name: vm.product.name,
      price: Number(priceState.unitPrice || selectedVariant.basePrice),
      image:
        selectedVariant.images?.[0]?.url ||
        vm.product.mediaSet?.card?.url ||
        vm.product.mediaSet?.thumbnail?.url ||
        `https://picsum.photos/seed/pdp-${vm.product.id}/600/600`,
    };

    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
    const next = [current, ...parsed.filter((item) => item.id !== current.id)].slice(0, 10);

    window.localStorage.setItem(storageKey, JSON.stringify(next));

    // Defer state update to avoid synchronous state update in effect warning
    Promise.resolve().then(() => {
      setRecentlyViewed((prev) => {
        const filtered = next.filter((item) => item.id !== current.id);
        const prevIds = prev.map((i) => i.id).join(",");
        const nextIds = filtered.map((i) => i.id).join(",");
        if (prevIds === nextIds) return prev;
        return filtered;
      });
    });
  }, [
    vm.product.id,
    vm.product.name,
    vm.product.mediaSet?.card?.url,
    vm.product.mediaSet?.thumbnail?.url,
    vm.canonicalSlug,
    selectedVariant,
    priceState.unitPrice,
  ]);

  const attributeValueMap = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const key of allAttributeKeys) {
      const values = new Set<string>();
      for (const variant of variants) {
        const value = getAttributeMap(variant)[key];
        if (value) values.add(value);
      }
      map.set(key, Array.from(values));
    }

    return map;
  }, [allAttributeKeys, variants]);

  const handleSelectAttribute = (key: string, value: string) => {
    const nextAttributes = { ...selectedAttributes, [key]: value };

    const matched = variants.find((variant: any) => {
      const variantMap = getAttributeMap(variant);
      return Object.entries(nextAttributes).every(
        ([attributeKey, selectedValue]) =>
          !selectedValue || variantMap[attributeKey] === selectedValue,
      );
    });

    if (matched) {
      setSelectedVariantId(matched.id);
      setSelectedAttributes(nextAttributes);
    }
  };

  const onReviewsClick = () => {
    setActiveTab("reviews");
    document.getElementById("pdp-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
        <section className="space-y-4">
          <ImageGallery images={galleryImages} badge={badge} />
        </section>

        <section className="space-y-5">
          {vm.brand ? (
            <Link
              href={`/shop?brandId=${vm.brand.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {vm.brand.logoUrl ? (
                <Image
                  src={vm.brand.logoUrl}
                  alt={vm.brand.name}
                  width={18}
                  height={18}
                  className="rounded-sm object-contain"
                />
              ) : null}
              <span>{vm.brand.name}</span>
            </Link>
          ) : null}

          <h1 className="text-3xl font-black leading-tight text-foreground md:text-4xl">
            {vm.product.name}
          </h1>

          <button
            type="button"
            onClick={onReviewsClick}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">
              {vm.reviewSummary.averageRating.toFixed(1)}
            </span>
            <span>({vm.reviewSummary.totalReviews})</span>
          </button>

          <details className="rounded-xl border bg-card px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-foreground">
              {t("SkuDetails")}
            </summary>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div>
                {t("SkuLabel")}: {selectedVariant?.sku || "-"}
              </div>
              <div>
                {t("BarcodeLabel")}: {selectedVariant?.barcode || "-"}
              </div>
            </div>
          </details>

          <div className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-3xl font-black",
                  priceState.loading ? "opacity-60" : "text-primary",
                )}
              >
                {egpFormatter.format(priceState.unitPrice || 0)}
              </span>

              {Number(selectedVariant?.strikePrice || 0) > (priceState.unitPrice || 0) ? (
                <span className="text-sm text-muted-foreground line-through">
                  {egpFormatter.format(
                    Number(selectedVariant!.strikePrice) * (selectedUom?.factorToBase || 1),
                  )}
                </span>
              ) : null}

              {badge?.text?.includes("SALE") || badge?.text?.includes("خصم") ? (
                <Badge className="bg-amber-500 text-white">{badge.text}</Badge>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {uomOptions.map((uom) => (
                <button
                  key={uom.code}
                  type="button"
                  onClick={() => setSelectedUomCode(uom.code)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium",
                    selectedUom?.code === uom.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{resolveUomLabel(uom, locale)}</span>
                  {bestValueCode === uom.code ? (
                    <Badge variant="outline">{t("BestValue")}</Badge>
                  ) : null}
                </button>
              ))}
            </div>

            {vm.customerGroup === "school_b2b" ? (
              <p className="mt-3 text-sm text-emerald-600">🏫 {t("SchoolPriceApplied")}</p>
            ) : null}
          </div>

          {allAttributeKeys.length > 0 ? (
            <div className="space-y-3 rounded-2xl border bg-card p-4">
              {allAttributeKeys.map((key) => {
                const values = attributeValueMap.get(key) || [];

                return (
                  <div key={key} className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">{key}</div>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        const isSelected = selectedAttributes[key] === value;
                        const isAvailable = variants.some((variant: any) => {
                          const variantMap = getAttributeMap(variant);
                          if (variantMap[key] !== value) return false;

                          return Object.entries(selectedAttributes).every(
                            ([attributeKey, selectedValue]) =>
                              attributeKey === key ||
                              !selectedValue ||
                              variantMap[attributeKey] === selectedValue,
                          );
                        });

                        const colorStyle =
                          isColorKey(key) && isCssColorCandidate(value)
                            ? { backgroundColor: value }
                            : undefined;

                        return (
                          <IconTooltip key={`${key}-${value}`} label={value} asChild>
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectAttribute(key, value)}
                              className={cn(
                                "relative inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm",
                                isColorKey(key) ? "size-8 p-0" : "",
                                isSelected ? "ring-2 ring-primary ring-offset-2" : "",
                                !isAvailable
                                  ? "cursor-not-allowed opacity-40 after:absolute after:inset-0 after:-rotate-45 after:border-t-2 after:border-muted-foreground"
                                  : "",
                              )}
                              style={colorStyle}
                            >
                              {!isColorKey(key) ? value : <span className="sr-only">{value}</span>}
                            </button>
                          </IconTooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4 rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-full border">
                <IconTooltip label={t("DecreaseQuantity")} asChild>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label={t("DecreaseQuantity")}
                  >
                    <Minus className="size-4" />
                  </button>
                </IconTooltip>

                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={maxQuantity}
                  onChange={(event) => {
                    const next = Number(event.target.value || 1);
                    setQuantity(Math.max(1, Math.min(next, maxQuantity)));
                  }}
                  className="w-14 bg-transparent text-center text-sm font-semibold outline-none"
                />

                <IconTooltip
                  label={
                    quantity >= maxQuantity
                      ? t("MaximumQuantity", { count: maxQuantity })
                      : t("IncreaseQuantity")
                  }
                  asChild
                >
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                    disabled={quantity >= maxQuantity}
                    aria-label={t("IncreaseQuantity")}
                  >
                    <span className="text-lg">+</span>
                  </button>
                </IconTooltip>
              </div>

              <Button
                className="h-11 flex-1"
                onClick={onAddToCart}
                disabled={!stockSnapshot.inStock || !selectedVariant}
              >
                {isAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
                {isAdded ? t("Added") : tCard("AddToCartFull")}
              </Button>

              <Button variant="outline" className="h-11" onClick={onWishlistToggle}>
                <Heart className={cn("size-4", isWishlisted ? "fill-current text-red-500" : "")} />
                {t("Wishlist")}
              </Button>
            </div>

            <div className={cn("text-sm font-semibold", stockClass)}>{stockText}</div>
          </div>

          <div className="rounded-2xl border bg-card p-4 text-sm">
            <div className="flex items-start gap-3 py-1">
              <Truck className="mt-0.5 size-4 text-primary" />
              <span>{t("DeliveryEstimate")}</span>
            </div>
            <div className="flex items-start gap-3 py-1">
              <RefreshCw className="mt-0.5 size-4 text-primary" />
              <span>{t("ReturnsPolicy")}</span>
            </div>
            <div className="flex items-start gap-3 py-1">
              <Shield className="mt-0.5 size-4 text-primary" />
              <span>{t("SecureCheckout")}</span>
            </div>
            <div className="flex items-start gap-3 py-1">
              <Package className="mt-0.5 size-4 text-primary" />
              <span>
                {stockSnapshot.inStock
                  ? t("StockAvailable", { count: stockSnapshot.availableUnits })
                  : tCard("OutOfStock")}
              </span>
            </div>
          </div>
        </section>
      </div>

      <ProductTabsSection
        product={vm.product}
        selectedVariant={selectedVariant}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        reviewSummary={vm.reviewSummary}
        initialReviews={vm.initialReviews}
        reviewTotal={vm.reviewTotal}
      />

      <RelatedProductsRail products={vm.relatedProducts} />
      <RecentlyViewedRail items={recentlyViewed} />
    </div>
  );
}
