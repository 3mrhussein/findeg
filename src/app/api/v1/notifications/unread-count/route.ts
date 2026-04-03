import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";

/**
 * Get Unread Count
 * GET /api/v1/notifications/unread-count
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, notifications: notificationService } = getServices();
    const session = await auth.getSession();

    if (!session) {
      return apiErrorByCode("AUTH_UNAUTHORIZED");
    }

    const count = await notificationService.getUnreadCount(session.userId);

    return apiResponse({ count });
  } catch (error) {
    return apiErrorByCode("SYSTEM_UNEXPECTED_ERROR", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
