'use client';

import { useState, useEffect } from 'react';
import { initWebMCP, getWebMCPStatus } from '@lib/webmcp/webmcp-init';
import { TOOLS } from '@lib/webmcp/webmcp-tools';

/**
 * Hook to initialize and monitor WebMCP state.
 */
export function useWebMCP() {
  const [state] = useState(() => ({
    isAvailable: typeof window !== 'undefined' && !!(navigator as any).modelContext,
    isInitialized: typeof window !== 'undefined' ? getWebMCPStatus() : false,
    toolCount: TOOLS.length,
  }));

  return state;
}
