import { NextRequest, NextResponse } from "next/server";
import { AdminBrandService } from "@/features/administration/application/services/AdminBrandService";
import { DrizzleBrandRepository } from "@/features/catalog/infrastructure/persistence/DrizzleBrandRepository";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const excludeId = searchParams.get("excludeId");

  if (!slug) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const service = container.adminBrandService;

  const available = await service.checkSlugAvailable(
    slug,
    excludeId ? parseInt(excludeId, 10) : undefined,
  );

  return NextResponse.json({ available });
}
