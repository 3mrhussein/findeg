import { NextRequest, NextResponse } from "next/server";
import { AdminTagService } from "@/features/administration/application/services/AdminTagService";
import { DrizzleTagRepository } from "@/features/catalog/infrastructure/persistence/DrizzleTagRepository";
import { getServices } from "@/server/getServices";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const excludeId = searchParams.get("excludeId");

  if (!slug) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const { adminTag: adminTagService } = await getServices();

  const available = await adminTagService.checkSlugAvailable(
    slug,
    excludeId ? parseInt(excludeId, 10) : undefined,
  );

  return NextResponse.json({ available });
}
