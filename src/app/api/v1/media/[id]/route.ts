/**
 * Media Delete Endpoint
 *
 * DELETE /api/v1/media/[id]
 * Deletes a media file from storage.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 *
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id: filename } = await params;
        const { media } = getServices();

        await media.deleteFile(filename);

        return apiResponse({ message: "Media file deleted successfully" });
      } catch (error) {
        return apiError(
          error instanceof Error ? error.message : "Failed to delete media file",
          500,
        );
      }
    },
    PERMISSION_CODES.ADMIN_MEDIA_WRITE,
  );
}
