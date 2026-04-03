import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";

/**
 * Mark Notifications as Read
 * POST /api/v1/notifications/mark-read
 * Body: { notificationId?: number } (omitted = mark all)
 */
export async function POST(request: NextRequest) {
  try {
    const { auth, notifications: notificationService } = getServices();
    const session = await auth.getSession();

    if (!session) {
      return apiErrorByCode("AUTH_UNAUTHORIZED");
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await notificationService.markRead(notificationId, session.userId);
    } else {
      await notificationService.markAllRead(session.userId);
    }

    return apiResponse({ success: true });
  } catch (error) {
    return apiErrorByCode("SYSTEM_UNEXPECTED_ERROR", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
