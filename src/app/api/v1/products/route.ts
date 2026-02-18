import { NextRequest, NextResponse } from "next/server";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 *
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const language = resolveLocale(searchParams.get("lang"));
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const search = searchParams.get("q");
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;

  // Basic filtering logic mapping to repo filters
  const filters: any = {
    limit,
    offset,
    isActive: true,
  };

  if (categoryId) filters.categoryId = Number(categoryId);
  if (brandId) filters.brandId = Number(brandId);
  if (search) filters.search = search;

  // Use container to get service/repo
  // Ideally use productService but repo has filtered method expose on interface?
  // Repo has getFiltered on IProductRepository. ProductService wraps it?
  // ProductService currently has getAll, getById, etc. I need to add getFiltered to ProductService or use repo directly here?
  // Best practice: use service.
  // I need to update ProductService first?
  // Or I can use repo directly for simple reads if service doesn't have logic.
  // Let's use repo directly for now as per "Service Container" setup returning Repos.
  // Wait, container returns Services too.

  const result = await container.productRepository.getFiltered(filters, language);

  return NextResponse.json(result);
}
