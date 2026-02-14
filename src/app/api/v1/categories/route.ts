import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/ServiceContainer";

/**
 *
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("lang") || "en";
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
