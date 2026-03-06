import { getHomePageData } from "@/features/catalog/application/queries/storefront";
import { buildHomeFeaturedGroups } from "@/features/catalog/application/queries/home-page";

// Sub-components
import { HeroSection } from "./_components/home/HeroSection";
import { HowItWorks } from "./_components/home/HowItWorks";
import { CollectionsGrid } from "./_components/home/CollectionsGrid";
import { NewArrivals } from "./_components/home/NewArrivals";
import { SchoolBanner } from "./_components/home/SchoolBanner";
import { NewsletterSection } from "./_components/home/NewsletterSection";
import Boundary from "@/lib/internal/Boundary";

interface HomePageProps {
  language?: string;
}

/**
 *
 */
export default async function HomePage({ language = "en" }: HomePageProps) {
  const { featuredProducts, categories } = await getHomePageData(language);
  const featuredGroups = buildHomeFeaturedGroups(featuredProducts);

  // Use newest products for "New Arrivals" section
  const newArrivals = featuredGroups.newest?.slice(0, 8) || [];

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
      <Boundary rendering="static" hydration="server" label="Hero">
        <HeroSection />
      </Boundary>

      <Boundary rendering="static" hydration="server" label="How it works">
        <HowItWorks />
      </Boundary>

      <Boundary rendering="static" hydration="server" label="Collections">
        <CollectionsGrid categories={categories} />
      </Boundary>

      <Boundary rendering="static" hydration="server" label="New Arrivals">
        <NewArrivals products={newArrivals} />
      </Boundary>

      <Boundary rendering="static" hydration="server" label="School Banner">
        <SchoolBanner locale={language} />
      </Boundary>

      <Boundary rendering="static" hydration="server" label="Newsletter">
        <NewsletterSection />
      </Boundary>
    </div>
  );
}
