import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";

/**
 *
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logger } = getServices();

    // Asynchronous logging - we don't await the result to keep the response fast if possible,
    // but in a Serverless env we usually must await database calls.
    // Since this is called fire-and-forget by the proxy, we can await here to ensure persistence.
    await logger.logRequest(body);

    return apiResponse({ success: true });
  } catch (error) {
    console.error("Logging API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
