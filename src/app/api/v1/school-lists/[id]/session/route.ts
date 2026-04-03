import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/server/getServices";
import { getOptionalSession } from "@/lib/auth-guard";

/**
 * GET /api/v1/school-lists/[id]/session
 *
 * Fetch or initialize a parent session for a specific school list.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { parentList } = getServices();
  const session = await getOptionalSession();
  const { id } = await params;
  const listId = parseInt(id);

  if (isNaN(listId)) {
    return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
  }

  // Use userId if logged in, otherwise check for a guest session token in cookies or headers
  const userId = session?.userId;
  const sessionToken = req.cookies.get("school_list_session")?.value;

  const state = await parentList.getSessionState(listId, userId, sessionToken);

  // Return session data if it exists
  // For now, returning state
  return NextResponse.json({ state });
}

/**
 * PATCH /api/v1/school-lists/[id]/session
 *
 * Update item selection or optional toggle.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { parentList } = getServices();
  const session = await getOptionalSession();
  const { id } = await params;
  const listId = parseInt(id);

  if (isNaN(listId)) {
    return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
  }

  const { itemId, variantId, type, include } = await req.json();

  // Logic to handle updates
  // parentList.saveItemSelection(...) or toggleOptionalItem(...)

  return NextResponse.json({ success: true });
}
