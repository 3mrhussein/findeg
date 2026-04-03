"use client";

import { useState, useEffect } from "react";
import { initWebMCP } from "@/lib/webmcp/webmcp-init";
import { tools } from "@/lib/webmcp/webmcp-tools";

/**
 * Hook to initialize and monitor WebMCP state.
 */
export function useWebMCP() {
  const [state, setState] = useState({
    isAvailable: false,
    isInitialized: false,
    toolCount: tools.length,
  });

  useEffect(() => {
    const { isAvailable } = initWebMCP();
    setState((prev) => ({
      ...prev,
      isAvailable,
      isInitialized: true,
    }));
  }, []);

  return state;
}
