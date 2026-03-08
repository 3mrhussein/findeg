import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../_lib/api-response";
import { getServices } from "@/server/getServices";

/**
 * List Notifications
 * GET /api/v1/notifications?page=1
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, notifications: notificationService } = getServices();
    const session = await auth.getSession();

    if (!session) {
      return apiErrorByCode("AUTH_UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const result = await notificationService.getAll(session.userId, page);

    return apiResponse(result);
  } catch (error) {
    return apiErrorByCode("SYSTEM_UNEXPECTED_ERROR", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
