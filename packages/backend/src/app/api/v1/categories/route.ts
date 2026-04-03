import { NextRequest, NextResponse } from "next/server";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 *
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const language = resolveLocale(searchParams.get("lang"));
  const type = searchParams.get("type"); // 'tree', 'flat', 'roots'

  let data;

  if (type === "tree") {
    data = await container.categoryRepository.getTree(language);
  } else if (type === "roots") {
    data = await container.categoryRepository.getRoots(language);
  } else {
    data = await container.categoryRepository.getAll(language);
  }

  return NextResponse.json(data);
}
