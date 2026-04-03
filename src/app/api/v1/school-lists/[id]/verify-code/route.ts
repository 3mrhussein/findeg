import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/server/getServices";
import { getOptionalSession } from "@/lib/auth-guard";

/**
 * POST /api/v1/school-lists/[id]/verify-code
 *
 * Verifies an access code for a restricted school list.
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

    const { code } = await req.json();
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const { schoolAccess } = getServices();
    const result = await schoolAccess.verifyCode(listId, session.userId, code);

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    if (result.locked) {
      return NextResponse.json(
        {
          error: "Too many attempts. Locked until " + result.lockedUntil?.toLocaleTimeString(),
          locked: true,
          lockedUntil: result.lockedUntil,
        },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: result.error || "Invalid code" }, { status: 403 });
  } catch (error: any) {
    console.error("Error verifying school list code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
