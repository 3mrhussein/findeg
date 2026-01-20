import { useTranslations } from 'next-intl';
import type { Product } from '@/types';
import { Container } from '@/presentation/shared/layout/Container';
import { Button } from '@/presentation/shared/ui/button';
import { ImageGallery } from '@/presentation/features/shop/components/ImageGallery';
import { Grid } from '@/presentation/shared/layout/Grid';
import { ProductCard } from '@/presentation/features/shop/components/ProductCard';
import { AdBanner } from '@/presentation/features/shop/components/AdBanner';
import { Price } from '@/presentation/shared/components/Price';
import { DiscountBadge } from '@/presentation/shared/components/DiscountBadge';
import { products, reviews as allReviews } from '@/lib/constants';
import { Rating } from '@/presentation/shared/components/Rating';
import { ProductActions } from '@/presentation/features/shop/components/ProductActions';
import { ProductReviews } from '@/presentation/features/shop/components/ProductReviews';
import { ProductStickyNav } from '@/presentation/features/shop/components/ProductStickyNav';
import Link from 'next/link';

interface ProductDetailTemplateProps {
    productId: number;
    language?: 'en' | 'ar';
}

const ProductDetailTemplate: React.FC<ProductDetailTemplateProps> = ({ productId }) => {
  const t = useTranslations();
  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl">{t('Pages.ProductDetail.NotFound')}</h1>
        <Link href="/shop">
          <Button className="mt-4">{t('Pages.ProductDetail.BackToShop')}</Button>
        </Link>
      </Container>
    );
  }

  const productReviews = allReviews
    .filter(r => r.productId === productId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const reviewSummary = (() => {
    if (productReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: totalRating / productReviews.length,
      count: productReviews.length
    };
  })();

  const recommendedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <>
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ImageGallery images={product.images} />
          <div>
            <span className="text-primary font-semibold">{t(`category_${product.category.toLowerCase().replace(' ', '_')}_title` as any)}</span>
            <div className="flex items-center gap-4 mt-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
              {product.strikePrice && (
                <DiscountBadge price={product.price} strikePrice={product.strikePrice} />
              )}
            </div>

            {reviewSummary.count > 0 && (
                <div className="flex items-center gap-2 mt-2 mb-4">
                    <Rating rating={reviewSummary.average} />
                    <span className="text-muted-foreground text-sm">{t('Pages.ProductDetail.BasedOnReviews', { count: reviewSummary.count })}</span>
                </div>
            )}
            
            <Price price={product.price} strikePrice={product.strikePrice} className="mb-6" />

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            
            <ProductActions product={product} />
          </div>
        </div>
      </Container>
        
      <ProductStickyNav offsetTop={400} />

      <Container className="py-16">
        {/* Description Section */}
        <section id="description" className="scroll-mt-32">
          <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">{t('Pages.ProductDetail.Description')}</h2>
          <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
        </section>

        <AdBanner className="my-16" />

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32 mt-16">
          <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">{t('Pages.ProductDetail.Reviews')}</h2>
          <ProductReviews initialReviews={productReviews} productId={product.id} />
        </section>

        {/* Recommended Items */}
        {recommendedProducts.length > 0 && (
          <section id="recommended" className="scroll-mt-32 mt-16">
            <h2 className="text-2xl font-bold pb-4 mb-6">{t('Pages.ProductDetail.RecommendedItems')}</h2>
            <Grid>
              {recommendedProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                />
              ))}
            </Grid>
          </section>
        )}
      </Container>
    </>
  );
};

export default ProductDetailTemplate;