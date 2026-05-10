'use client';

import { useEffect } from 'react';
import { initWebMCP } from '@lib/webmcp/webmcp-init';

/**
 * Global initializer for WebMCP tools.
 * Registers system tools with the browser if supported.
 */
export function WebMCPInitializer() {
  useEffect(() => {
    // We favor initializing here to catch all pages (Admin + Storefront)
    initWebMCP();
  }, []);

  return null;
}
