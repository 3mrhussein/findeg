import { NextRequest, NextResponse } from "next/server";
import { AdminCategoryService } from "@/features/administration/application/services/AdminCategoryService";
import { DrizzleCategoryRepository } from "@/features/catalog/infrastructure/persistence/DrizzleCategoryRepository";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const excludeId = searchParams.get("excludeId");

  if (!slug) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const categoryRepository = new DrizzleCategoryRepository();
  const adminCategoryService = new AdminCategoryService(categoryRepository);

  const available = await adminCategoryService.checkSlugAvailable(
    slug,
    excludeId ? parseInt(excludeId, 10) : undefined,
  );

  return NextResponse.json({ available });
}
