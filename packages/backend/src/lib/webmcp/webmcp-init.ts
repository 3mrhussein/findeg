/**
 * WebMCP Initialization Utility
 */
import { registerAllTools } from "./webmcp-tools";

export function initWebMCP() {
  if (typeof window === "undefined") return { isAvailable: false };

  const isAvailable = !!(
    (navigator as any).modelContext && (navigator as any).modelContext.registerTool
  );

  if (isAvailable) {
    const success = registerAllTools();
    return { isAvailable: success };
  }

  return { isAvailable: false };
}
