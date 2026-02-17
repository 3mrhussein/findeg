import { useTranslations } from "next-intl";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { Container } from "@/components/layout/Container";
import { ImageGallery } from "./ImageGallery";
import { Grid } from "@/components/layout/Grid";
import { ProductCard } from "@/components/common/ProductCard";
import { AdBanner } from "../../_components/AdBanner";
import { Price } from "@/components/common/Price";
import { DiscountBadge } from "@/components/common/DiscountBadge";
import { Rating } from "@/components/common/Rating";
import { ProductActions } from "./ProductActions";
import { ProductReviews } from "./ProductReviews";
import { ProductStickyNav } from "./ProductStickyNav";
import { Review } from "@/features/review/domain/entities/Review";
import { PageStateError } from "@/components/common/state/PageStateError";

interface ProductDetailTemplateProps {
  product: Product | null;
  productReviews: Review[];
  recommendedProducts: Product[];
}

/**
 *
 */
const ProductDetailTemplate: React.FC<ProductDetailTemplateProps> = ({
  product,
  productReviews,
  recommendedProducts,
}) => {
  const t = useTranslations();
  const categoryLabel = (() => {
    if (product?.categoryName === "Stationary") return t("Nav.Stationary.Title");
    if (product?.categoryName === "Toys") return t("Nav.Toys.Title");
    if (product?.categoryName === "School Items") return t("Nav.School.Title");
    return t("Nav.Shop");
  })();

  if (!product) {
    return (
      <Container className="py-20">
        <PageStateError
          title={t("Pages.ProductDetail.NotFound")}
          description={t("Pages.ProductDetail.NotFoundDescription")}
          actionLabel={t("Pages.ProductDetail.BackToShop")}
          actionHref="/shop"
        />
      </Container>
    );
  }

  const reviewSummary = (() => {
    if (productReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: totalRating / productReviews.length,
      count: productReviews.length,
    };
  })();

  return (
    <>
      <Container className="py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ImageGallery images={product.images} />
          <div>
            <span className="text-primary font-semibold">{categoryLabel}</span>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              {product.strikePrice && (
                <DiscountBadge price={product.price} strikePrice={product.strikePrice} />
              )}
            </div>

            {reviewSummary.count > 0 && (
              <div className="flex items-center gap-2 mt-2 mb-4">
                <Rating rating={reviewSummary.average} />
                <span className="text-muted-foreground text-sm">
                  {t("Pages.ProductDetail.BasedOnReviews", { count: reviewSummary.count })}
                </span>
              </div>
            )}

            <Price
              price={product.price}
              strikePrice={product.strikePrice}
              className="mb-4 lg:mb-6"
            />

            <p className="text-muted-foreground leading-relaxed mb-6 lg:mb-8">
              {product.description}
            </p>

            <ProductActions product={product} />
          </div>
        </div>
      </Container>

      <ProductStickyNav offsetTop={400} />

      <Container className="py-12 lg:py-16">
        {/* Description Section */}
        <section id="description" className="scroll-mt-28 lg:scroll-mt-32">
          <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">
            {t("Pages.ProductDetail.Description")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
        </section>

        <AdBanner className="my-10 lg:my-16" />

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-28 lg:scroll-mt-32 mt-10 lg:mt-16">
          <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">
            {t("Pages.ProductDetail.Reviews")}
          </h2>
          <ProductReviews initialReviews={productReviews} productId={product.id} />
        </section>

        {/* Recommended Items */}
        {recommendedProducts.length > 0 && (
          <section id="recommended" className="scroll-mt-28 lg:scroll-mt-32 mt-10 lg:mt-16">
            <h2 className="text-2xl font-bold pb-4 mb-6">
              {t("Pages.ProductDetail.RecommendedItems")}
            </h2>
            <Grid>
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Grid>
          </section>
        )}
      </Container>
    </>
  );
};

export default ProductDetailTemplate;
