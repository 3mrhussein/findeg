import { NextRequest, NextResponse } from "next/server";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

/**
 *
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";

  const data = await container.brandRepository.getAll(activeOnly);

  return NextResponse.json(data);
}
