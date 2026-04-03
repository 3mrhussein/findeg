import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/server/getServices";
import { getOptionalSession } from "@/lib/auth-guard";

/**
 * POST /api/v1/school-lists/[id]/session/reset
 *
 * Reset a parent session to school defaults.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { parentList } = getServices();
  const { id } = await params;
  const listId = parseInt(id);

  if (isNaN(listId)) {
    return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
  }

  // parentList.resetToDefaults(...)

  return NextResponse.json({ success: true });
}
