import { NextRequest } from "next/server";
import { apiError, apiResponse } from "../_lib/api-response";
import { withAdmin } from "../_lib/middleware";
import { getServices } from "@/server/getServices";
import { MANAGED_MEDIA_FOLDERS } from "@/features/media/application/services/MediaService";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

const FOLDER_PATTERN = /^[a-zA-Z0-9/_-]*$/;

/**
 *
 */
function isValidFolder(folder: string): boolean {
  return folder.length <= 100 && !folder.includes("..") && FOLDER_PATTERN.test(folder);
}

/**
 *
 */
function resolveFolders(request: NextRequest): string[] {
  const rawFolders = request.nextUrl.searchParams.getAll("folder").map((value) => value.trim());
  if (rawFolders.length === 0) return [...MANAGED_MEDIA_FOLDERS];
  return rawFolders.filter(Boolean);
}

/**
 *
 */
export async function GET(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const { media } = getServices();
        const folders = resolveFolders(request);
        const hasInvalidFolder = folders.some((folder) => !isValidFolder(folder));
        if (hasInvalidFolder) {
          return apiError("Invalid folder value", 400);
        }
        const assets = await media.getLibraryAssets(folders);
        return apiResponse({ assets });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to list media files", 500);
      }
    },
    PERMISSION_CODES.ADMIN_MEDIA_READ,
  );
}

/**
 *
 */
export async function POST(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const folder = (formData.get("folder") as string | null)?.trim() || "general";

        if (!(file instanceof File)) {
          return apiError("No file uploaded", 400);
        }
        if (!isValidFolder(folder)) {
          return apiError("Invalid folder value", 400);
        }

        const { media } = getServices();
        const url = await media.uploadImage(file, folder);

        return apiResponse({ url }, 201);
      } catch (error) {
        return apiError(
          error instanceof Error ? error.message : "Failed to upload media file",
          500,
        );
      }
    },
    PERMISSION_CODES.ADMIN_MEDIA_WRITE,
  );
}

/**
 *
 */
export async function DELETE(request: NextRequest) {
  return withAdmin(
    request,
    async () => {
      try {
        const url = request.nextUrl.searchParams.get("url");
        if (!url) {
          return apiError("Media file url is required", 400);
        }
        if (!url.startsWith("/uploads/")) {
          return apiError("Invalid media url", 400);
        }

        const { media } = getServices();
        await media.deleteFile(url);

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
