import { Container } from "@/components/shared/Container";
import { ProductGallery } from "./_components/ProductGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, Truck, ShieldCheck } from "lucide-react";
import { AddToCartButton } from "../../_components/AddToCartButton";
import { notFound } from "next/navigation";
import { getProductDetailPageData } from "@/features/catalog/application/queries/storefront";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

/**
 *
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale: locale as Locale });
  const productId = Number(slug);
  if (!Number.isFinite(productId)) notFound();

  const data = await getProductDetailPageData(productId, locale);
  if (!data) notFound();

  const { product, reviews } = data;

  return (
    <div className="bg-background py-8 lg:py-12">
      <Container>
        <main
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          aria-labelledby="product-title"
        >
          {/* Gallery Column */}
          <div>
            <ProductGallery images={product.images} />
          </div>

          {/* Info Column */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.categoryName}</Badge>
                <div className="flex items-center text-yellow-500 gap-1 text-sm bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviewsCount})</span>
                </div>
              </div>
              <h1 id="product-title" className="text-3xl md:text-4xl font-bold">
                {product.name}
              </h1>
            </div>

            <div className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat("en-EG", {
                style: "currency",
                currency: "EGP",
              }).format(product.price)}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Actions */}
            <div className="pt-4 border-t flex items-center gap-4">
              <div className="flex-1">
                <AddToCartButton product={product} size="lg" className="w-full text-lg h-12" />
              </div>
            </div>

            {/* Features / Trust Badges */}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>{t("Pages.ProductDetail.FastDelivery")}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>{t("Pages.ProductDetail.QualityGuarantee")}</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full pt-6">
              <TabsList
                className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent"
                aria-label={t("Pages.ProductDetail.TabsLabel")}
              >
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  {t("Pages.ProductDetail.Description")}
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  {t("Pages.ProductDetail.Specifications")}
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  {t("Pages.ProductDetail.Reviews")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4 animate-in fade-in-50">
                <p className="leading-relaxed">{product.longDescription}</p>
              </TabsContent>
              <TabsContent value="specs" className="pt-4 animate-in fade-in-50">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {t("Pages.ProductDetail.SkuLabel")}: {product.sku}
                  </li>
                  <li>
                    {t("Pages.ProductDetail.CategoryLabel")}: {product.categoryName}
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="pt-4 animate-in fade-in-50">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {review.author || t("Pages.ProductDetail.Anonymous")}
                          </span>
                          <span className="text-sm text-muted-foreground">{review.rating}/5</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {review.comment || t("Pages.ProductDetail.NoWrittenComment")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {t("Pages.ProductDetail.NoReviews")}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </Container>
    </div>
  );
}
