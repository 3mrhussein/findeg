/**
 * WebMCP Initialization Utility
 */
import { registerAllTools } from './webmcp-tools';

export function initWebMCP() {
  if (typeof window === 'undefined') return { isAvailable: false };

  const nav = navigator as unknown as {
    modelContext?: { registerTool?: (tool: Record<string, unknown>) => void };
  };
  const isAvailable = !!(nav.modelContext && nav.modelContext.registerTool);

  if (isAvailable) {
    const success = registerAllTools();
    return { isAvailable: success };
  }

  return { isAvailable: false };
}
