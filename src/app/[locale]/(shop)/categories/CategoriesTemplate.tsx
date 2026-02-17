import { useTranslations } from "next-intl";

import { Container } from "@/components/layout/Container";
import { CategoryCard } from "../_components/CategoryCard";
import { Category } from "@/features/catalog/domain/entities/Category";
import { PageStateEmpty } from "@/components/common/state/PageStateEmpty";

interface CategoriesTemplateProps {
  language?: "en" | "ar";
  categories: Category[];
}

/**
 *
 */
const CategoriesTemplate: React.FC<CategoriesTemplateProps> = ({ categories }) => {
  const t = useTranslations();

  return (
    <div className="bg-muted">
      <Container className="py-12 lg:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">{t("Nav.Categories")}</h1>
          <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t("Pages.Home.Categories.Subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.length > 0 ? (
            categories.map((category) => <CategoryCard key={category.id} category={category} />)
          ) : (
            <div className="sm:col-span-2 lg:col-span-3">
              <PageStateEmpty
                title={t("Pages.Categories.EmptyTitle")}
                description={t("Pages.Categories.EmptyDescription")}
                actionLabel={t("Nav.Shop")}
                actionHref="/shop"
                iconName="package"
              />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default CategoriesTemplate;
