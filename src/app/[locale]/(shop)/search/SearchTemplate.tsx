import { useTranslations } from "next-intl";
// ...removed import for T, use translation key directly
import { Container } from "@/components/layout/Container";
import { Grid } from "@/components/layout/Grid";
import { ProductCard } from "@/components/common/ProductCard";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { PageStateEmpty } from "@/components/common/state/PageStateEmpty";

interface SearchTemplateProps {
  language?: "en" | "ar";
  searchQuery?: string;
  products: Product[];
}

/**
 *
 */
const SearchTemplate: React.FC<SearchTemplateProps> = ({ searchQuery = "", products }) => {
  const t = useTranslations();

  return (
    <div className="bg-background min-h-[60vh]">
      <Container className="py-12 lg:py-16">
        <div className="text-center mb-12">
          {searchQuery ? (
            <h1 className="text-3xl font-bold text-foreground">
              {t("Pages.Search.PageTitle", { query: `"${searchQuery}"` })}
            </h1>
          ) : (
            <h1 className="text-3xl font-bold text-foreground">{t("Pages.Search.EmptyPrompt")}</h1>
          )}
        </div>
        {!searchQuery ? (
          <PageStateEmpty
            title={t("Pages.Search.EmptyPrompt")}
            description={t("Pages.Search.EmptyDescription")}
            actionLabel={t("Pages.Home.Hero.ButtonShop")}
            actionHref="/shop"
          />
        ) : products.length > 0 ? (
          <Grid>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Grid>
        ) : (
          <PageStateEmpty
            title={t("Pages.Search.NoResults")}
            description={t("Pages.Search.NoResultsDescription")}
            actionLabel={t("Nav.Shop")}
            actionHref="/shop"
          />
        )}
      </Container>
    </div>
  );
};

export default SearchTemplate;
