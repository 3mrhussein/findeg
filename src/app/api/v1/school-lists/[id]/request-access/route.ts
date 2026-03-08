import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/server/getServices";
import { getOptionalSession } from "@/lib/auth-guard";

/**
 * POST /api/v1/school-lists/[id]/request-access
 *
 * Submits a request for access to a private school list.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listId = parseInt(id);
    if (isNaN(listId)) {
      return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
    }

    const session = await getOptionalSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { childName, note } = body;

    const { schoolAccess } = getServices();

    // Check if already has access or pending request
    const state = await schoolAccess.getAccessState(listId, session.userId);
    if (state === "granted") {
      return NextResponse.json({ error: "Already have access" }, { status: 400 });
    }
    if (state === "pending") {
      return NextResponse.json({ error: "Request already pending" }, { status: 400 });
    }

    await schoolAccess.requestAccess(listId, session.userId, { childName, note });

    return NextResponse.json({ success: true, message: "Request submitted successfully" });
  } catch (error: any) {
    console.error("Error requesting school list access:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
