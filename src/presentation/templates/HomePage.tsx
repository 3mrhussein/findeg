import React from 'react';
import { Hero } from '@/presentation/features/shop/components/Hero';
import { CategoryCard } from '@/presentation/features/shop/components/CategoryCard';
import { Container } from '@/presentation/shared/layout/Container';
import { AdBanner } from '@/presentation/features/shop/components/AdBanner';
import { ScrollingLogoCloud } from '@/presentation/features/shop/components/ScrollingLogoCloud';
import { ProductPagination } from '@/presentation/shared/components/ProductPagination';
import { getServices } from '@/presentation/server/getServices';
import { getStaticTranslation } from '@/infrastructure/translations/static';
import { Category } from '@/domain/entities/Category';

/**
 * HomePage Template (Server Component)
 * 
 * This component orchestrates the layout for the Home Page.
 * It is a Server Component that uses the Service Layer for data fetching.
 */
interface HomePageProps {
  language?: string;
}

const HomePage = async ({ language = 'en' }: HomePageProps) => {
  // Use services for data fetching
  const services = getServices();
  
  const featuredProducts = await services.products.getFeatured(8, language);
  const categories: Category[] = await services.categories.getAll(language);
  
  // Use new translation strategy
  const t = await getStaticTranslation(language);

  return (
    <>
      <Hero imageUrl="https://picsum.photos/seed/heroimage/1600/900" />

      <section id="featured-products" className="py-16 lg:py-24 bg-muted">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">
            {t['featured_products_title'] || 'Featured Products'}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t['featured_products_subtitle'] || 'Discover our handpicked selection of premium products'}
          </p>
          
          <ProductPagination products={featuredProducts} />
        </Container>
      </section>
      
      <AdBanner />

      <section id="categories" className="py-16 lg:py-24 bg-background">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">
            {t['shop_by_category_title'] || 'Shop By Category'}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t['shop_by_category_subtitle'] || 'Browse our wide range of categories'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <Container>
            <h2 className="text-center text-lg font-semibold text-muted-foreground mb-10">
                {t['brand_showcase_title'] || 'Our Trusted Brands'}
            </h2>
            <div className="space-y-8">
                <ScrollingLogoCloud direction="left" />
                <ScrollingLogoCloud direction="right" />
            </div>
        </Container>
      </section>
    </>
  );
};

export default HomePage;