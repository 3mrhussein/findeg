import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { PageProps, Product, Review } from '../types';
import { useTranslation, useCart, usePagination } from '../hooks';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/button';
import { ImageGallery } from '../components/molecules/ImageGallery';
import { VariantSelector } from '../components/molecules/VariantSelector';
import { QuantityInput } from '../components/atoms/QuantityInput';
import { Grid } from '../components/layout/Grid';
import { ProductCard } from '../components/molecules/ProductCard';
import { AdBanner } from '../components/molecules/AdBanner';
import { Price } from '../components/atoms/Price';
import { DiscountBadge } from '../components/atoms/DiscountBadge';
import { products, reviews as allReviews } from '../constants';
import { Rating } from '../components/atoms/Rating';
import { ReviewItem } from '../components/molecules/ReviewItem';
import { ReviewForm } from '../components/molecules/ReviewForm';
import { Pagination } from '../components/molecules/Pagination';

interface ProductDetailPageProps extends PageProps {
    productId: number | null;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, navigateTo }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const {
    currentPage,
    totalPages,
    currentPageData: currentReviews,
    setCurrentPage,
  } = usePagination(productReviews, 2);
  
  const navItems = [
    { key: 'product_nav_description', href: '#description' },
    { key: 'product_nav_reviews', href: '#reviews' },
    { key: 'product_nav_recommended', href: '#recommended' },
  ];

  useEffect(() => {
    if (productId) {
      const reviewsForProduct = allReviews
        .filter(r => r.productId === productId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setProductReviews(reviewsForProduct);
    }
  }, [productId]);

  const reviewSummary = useMemo(() => {
    if (productReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: totalRating / productReviews.length,
      count: productReviews.length
    };
  }, [productReviews]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setIsNavSticky(window.scrollY > contentRef.current.offsetTop);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl">Product not found.</h1>
        <Button onClick={() => navigateTo('shop')} className="mt-4">Back to Shop</Button>
      </Container>
    );
  }

  const handleAddReview = (newReview: Omit<Review, 'id' | 'productId' | 'date'>) => {
    const review: Review = {
      id: Date.now(),
      productId: product.id,
      date: new Date().toISOString(),
      ...newReview
    };
    setProductReviews(prev => [review, ...prev]);
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  const recommendedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <>
      <Container className="py-12 lg:py-16">
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                    <span className="text-muted-foreground text-sm">{t('product_based_on_reviews', { count: reviewSummary.count })}</span>
                </div>
            )}
            
            <Price price={product.price} strikePrice={product.strikePrice} className="mb-6" />

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            
            {product.variants && Object.keys(product.variants).map(variantName => (
              <VariantSelector 
                key={variantName}
                variant={product.variants![variantName]}
                selectedValue={selectedVariants[variantName]}
                onValueChange={(value) => setSelectedVariants(prev => ({...prev, [variantName]: value}))}
              />
            ))}

            <div className="flex items-center gap-4 mt-8">
              <QuantityInput quantity={quantity} setQuantity={setQuantity} />
              <Button size="lg" className="w-full" onClick={handleAddToCart}>{t('product_add_to_cart')}</Button>
            </div>
          </div>
        </div>
      </Container>
        
      {/* Sticky Nav */}
      <div className={`sticky top-[73px] bg-card/80 backdrop-blur-lg z-30 shadow-sm transition-all duration-300 ${isNavSticky ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
        <Container>
          <div className="flex items-center justify-center border-b border-border">
            {navItems.map(item => (
              <a key={item.key} href={item.href} className="px-6 py-4 font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-200">
                {t(item.key as any)}
              </a>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-16">
        {/* Description Section */}
        <section id="description" className="scroll-mt-32">
          <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">{t('product_description')}</h2>
          <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
        </section>

        <AdBanner navigateTo={navigateTo} className="my-16" />

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32 mt-16">
          <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">{t('product_reviews')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col">
                <div className="flex-grow min-h-[20rem]">
                    {currentReviews.length > 0 ? (
                        <div className="space-y-6">
                            {currentReviews.map(review => <ReviewItem key={review.id} review={review} />)}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">{t('product_no_reviews')}</p>
                        </div>
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
            <div>
                <ReviewForm onSubmit={handleAddReview} />
            </div>
          </div>
        </section>

        {/* Recommended Items */}
        {recommendedProducts.length > 0 && (
          <section id="recommended" className="scroll-mt-32 mt-16">
            <h2 className="text-2xl font-bold pb-4 mb-6">{t('product_recommended_items')}</h2>
            <Grid>
              {recommendedProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  navigateTo={navigateTo} 
                />
              ))}
            </Grid>
          </section>
        )}
      </Container>
    </>
  );
};

export default ProductDetailPage;