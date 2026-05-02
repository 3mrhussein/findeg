/**
 * WebMCP Initialization Utility
 */
import { registerAllTools } from "./webmcp-tools";

let isInitialized = false;

export function initWebMCP() {
  if (typeof window === "undefined") return { isAvailable: false };
  if (isInitialized) return { isAvailable: true };

  const isAvailable = !!(
    (navigator as any).modelContext && (navigator as any).modelContext.registerTool
  );

  if (isAvailable) {
    const success = registerAllTools();
    isInitialized = success;
    return { isAvailable: success };
  }

  return { isAvailable: false };
}

export function getWebMCPStatus() {
  return isInitialized;
}
