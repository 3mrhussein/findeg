import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/server/getServices";

/**
 * GET /api/v1/admin/products/check-slug
 *
 * Query Params:
 * - slug: string (required)
 * - excludeId: number (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const excludeIdStr = searchParams.get("excludeId");
  const excludeId = excludeIdStr ? parseInt(excludeIdStr) : undefined;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const { adminProduct } = getServices();
  const available = await adminProduct.checkSlugAvailable(slug, excludeId);

  return NextResponse.json({ available });
}
