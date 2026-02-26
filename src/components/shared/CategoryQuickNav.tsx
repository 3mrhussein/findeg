import { getHeaderCategoryTree } from "@/features/catalog/application/queries/header-nav";
import { Container } from "@/components/shared/Container";
import { Link } from "@/i18n/routing";
import type { Locale } from "next-intl";

interface CategoryQuickNavProps {
  locale: Locale;
}

/**
 * Fast category and sub-category links shown below the main header.
 */
export async function CategoryQuickNav({ locale }: CategoryQuickNavProps) {
  const categories = await getHeaderCategoryTree(locale);

  if (categories.length === 0) return null;

  return (
    <div className="border-b bg-muted/30">
      <Container className="py-3">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {categories.slice(0, 8).map((category) => (
            <div key={category.id} className="min-w-[170px] rounded-md border bg-background p-2">
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-semibold hover:underline"
              >
                {category.name}
              </Link>
              {category.children.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {category.children.slice(0, 3).map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="block text-xs text-muted-foreground hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
