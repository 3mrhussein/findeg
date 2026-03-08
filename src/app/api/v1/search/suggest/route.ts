import { NextRequest, NextResponse } from "next/server";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { resolveLocale, Locale } from "@/features/core/domain/value-objects";

/**
 * GET /api/v1/search/suggest
 * Provides rapid autocomplete suggestions.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const locale = resolveLocale(searchParams.get("lang")) as Locale;

  if (!query || query.trim() === "") {
    return NextResponse.json({ products: [], categories: [] });
  }

  try {
    const result = await container.searchService.suggest(query, locale);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Search Suggest API Error]", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
