import { Hero } from "./_components/ShopHero";
import { CategoryCard } from "./_components/CategoryCard";
import { Container } from "@/components/layout/Container";
import { AdBanner } from "./_components/AdBanner";
import { ScrollingLogoCloud } from "./_components/ScrollingLogoCloud";
import { ProductPagination } from "@/components/common/ProductPagination";
import { getTranslations } from "next-intl/server";
import { getHomePageData } from "@/features/catalog/application/queries/storefront";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * HomePage Template (Server Component)
 *
 * This component orchestrates the layout for the Home Page.
 * It is a Server Component that uses the Service Layer for data fetching.
 */
interface HomePageProps {
  language?: string;
}

/**
 *
 */
const HomePage = async ({ language = "en" }: HomePageProps) => {
  const t = await getTranslations();
  const { featuredProducts, categories } = await getHomePageData(language);

  return (
    <>
      <Hero imageUrl="https://picsum.photos/seed/heroimage/1600/900" />

      <section id="featured-products" className="py-16 lg:py-24 bg-muted">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">
            {t("Pages.Home.Featured.Title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("Pages.Home.Featured.Subtitle") ||
              "Discover our handpicked selection of premium products"}
          </p>

          <ProductPagination products={featuredProducts} />
        </Container>
      </section>

      <AdBanner />

      <section className="py-12 bg-background">
        <Container>
          <Card className="border-dashed">
            <CardContent className="py-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {t("Pages.SchoolLists.SecondaryCtaTitle")}
                </h3>
                <p className="text-muted-foreground">
                  {t("Pages.SchoolLists.SecondaryCtaDescription")}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/school-lists">{t("Nav.SchoolLists")}</Link>
              </Button>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section id="categories" className="py-16 lg:py-24 bg-background">
        <Container>
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">
            {t("Pages.Home.Categories.Title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("Pages.Home.Categories.Subtitle")}
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
            {t("Pages.Home.TrustedBrands")}
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
