import { NextRequest, NextResponse } from "next/server";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { resolveLocale, Locale } from "@/features/core/domain/value-objects";
import { type SearchParams } from "@/features/catalog/application/interfaces/ISearchService";

/**
 * GET /api/v1/products
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const language = resolveLocale(searchParams.get("lang")) as Locale;
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const search = searchParams.get("q");
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  const sort = (searchParams.get("sort") as SearchParams["sort"]) || "relevance";

  if (search) {
    // Dispatch to fast scored SearchService
    const result = await container.searchService.search({
      query: search,
      locale: language,
      categoryId: categoryId ? Number(categoryId) : undefined,
      brandId: brandId ? Number(brandId) : undefined,
      limit,
      offset,
      sort,
    });
    return NextResponse.json(result);
  } else {
    // Basic filtering logic mapping to repo filters
    const filters: any = {
      limit,
      offset,
      isActive: true,
    };

    if (categoryId) filters.categoryId = Number(categoryId);
    if (brandId) filters.brandId = Number(brandId);

    // Pass sort order mapped appropriately for getFiltered (handles sort logic eventually)
    if (sort && sort !== "relevance") {
      filters.sort = sort;
    }

    const result = await container.productRepository.getFiltered(filters, language);
    return NextResponse.json(result);
  }
}
