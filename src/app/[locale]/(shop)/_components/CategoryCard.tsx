import Link from "next/link";
import type { Category } from "@/features/catalog/domain/entities/Category";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  category: Category;
  countLabel?: string;
}

/**
 *
 */
export function CategoryCard({ category, countLabel }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} data-testid={`category-card-${category.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="space-y-2 p-6">
          <h3 className="text-xl font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {category.description || "Browse products"}
          </p>
          {countLabel ? <p className="text-xs text-muted-foreground">{countLabel}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
