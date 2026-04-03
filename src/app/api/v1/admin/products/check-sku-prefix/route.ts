import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/server/getServices";

/**
 * GET /api/v1/admin/products/check-sku-prefix
 *
 * Query Params:
 * - prefix: string (required)
 * - excludeId: number (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix");
  const excludeIdStr = searchParams.get("excludeId");
  const excludeId = excludeIdStr ? parseInt(excludeIdStr) : undefined;

  if (!prefix) {
    return NextResponse.json({ error: "Prefix is required" }, { status: 400 });
  }

  const { adminProduct } = getServices();
  const available = await adminProduct.checkSkuPrefixAvailable(prefix, excludeId);

  return NextResponse.json({ available });
}
