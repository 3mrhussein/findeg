import React from 'react';
import { Hero } from '@/components/organisms/Hero';
import { CategoryCard } from '@/components/molecules/CategoryCard';
import { Container } from '@/components/layout/Container';
import { AdBanner } from '@/components/molecules/AdBanner';
import { products, categories } from '@/constants';
import { ScrollingLogoCloud } from '@/components/molecules/ScrollingLogoCloud';
import { ProductPagination } from '@/components/organisms/ProductPagination';
import { getTranslation } from '@/lib/i18n-server';
import { Language } from '@/types';

/**
 * HomePage Template (Server Component)
 * 
 * This component orchestrates the layout for the Home Page.
 * It is a Server Component, meaning it runs on the server and sends HTML to the client.
 * 
 * Responsibilities:
 * 1. Data Fetching: It accesses static data (products, categories) or fetches from DB/CMS.
 * 2. Localization: It uses `getTranslation` (server-side) to fetch localized strings.
 * 3. Layout Composition: It composes smaller components (Organisms, Molecules) to build the page.
 * 4. Client Interactivity Delegation: It passes data to Client Components (like `ProductPagination`) 
 *    where user interaction is needed (state, effects).
 */
interface HomePageProps {
  language?: Language;
}

const HomePage: React.FC<HomePageProps> = ({ language = 'en' }) => {
  const { t } = getTranslation(language);
  const featuredProducts = products.slice(0, 8);

  return (
    <>
      <Hero imageUrl="https://picsum.photos/seed/heroimage/800/600" />

      <section id="featured-products" className="py-16 lg:py-24 bg-muted">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">{t('featured_products_title')}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('featured_products_subtitle')}
          </p>
          
          <ProductPagination products={featuredProducts} />
        </Container>
      </section>
      
      <AdBanner />

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

    </>
  );
};

export default HomePage;