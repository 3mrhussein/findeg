import React, { useState } from 'react';
import { Hero } from '../components/organisms/Hero';
import { ProductCard } from '../components/molecules/ProductCard';
import { CategoryCard } from '../components/molecules/CategoryCard';
import { ImageGenerator } from '../components/organisms/ImageGenerator';
import { useTranslation } from '../hooks';
import type { PageProps } from '../types';
import { Container } from '../components/layout/Container';
import { Grid } from '../components/layout/Grid';
import { AdBanner } from '../components/molecules/AdBanner';
import { products, categories } from '../constants';
import { Button } from '../components/ui/button';
import { Icon } from '../components/atoms/Icon';
import { ScrollingLogoCloud } from '../components/molecules/ScrollingLogoCloud';

const HomePage: React.FC<PageProps> = ({ navigateTo }) => {
  const { t, language } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const productsPerPage = 4;
  const featuredProducts = products.slice(0, 8);
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 300); // Corresponds to the transition duration
  };
  
  const currentProducts = featuredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      <Hero navigateTo={navigateTo} imageUrl="https://picsum.photos/seed/heroimage/800/600" />

      <section id="featured-products" className="py-16 lg:py-24 bg-muted">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">{t('featured_products_title')}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('featured_products_subtitle')}
          </p>
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <Grid>
              {currentProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  navigateTo={navigateTo}
                />
              ))}
            </Grid>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <Button 
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1 || isAnimating}
                aria-label={t('pagination_previous')}
              >
                <Icon name="chevronRight" className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
              </Button>
              
              <p className="text-muted-foreground font-medium text-sm w-8 text-center">{currentPage} / {totalPages}</p>

              <Button 
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages || isAnimating}
                aria-label={t('pagination_next')}
              >
                <Icon name="chevronRight" className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          )}
        </Container>
      </section>
      
      <AdBanner navigateTo={navigateTo} />

      <section id="categories" className="py-16 lg:py-24 bg-background">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">{t('shop_by_category_title')}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('shop_by_category_subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <Container>
            <h2 className="text-center text-lg font-semibold text-muted-foreground mb-10">
                {t('brand_showcase_title')}
            </h2>
            <div className="space-y-8">
                <ScrollingLogoCloud direction="left" />
                <ScrollingLogoCloud direction="right" />
            </div>
        </Container>
      </section>

      <ImageGenerator />
    </>
  );
};

export default HomePage;