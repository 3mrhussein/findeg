import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/ServiceContainer";

/**
 *
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const url = await container.mediaService.uploadImage(file, folder);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
