import { NextResponse } from "next/server";
import { getSession } from "@lib/session";
import { getMyAccountDataQuery } from "@queries/dashboard-queries";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ data: { user: null } }, { status: 401 });
    }

    const user = await getMyAccountDataQuery(session.userId);

    if (!user) {
      return NextResponse.json({ data: { user: null } }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      },
    });
  } catch (error) {
    console.error("[api] auth/me error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
