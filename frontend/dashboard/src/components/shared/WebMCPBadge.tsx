"use client";

import React from "react";
import { useWebMCP } from "@hooks/useWebMCP";
import { cn } from "@lib/utils";
import { Sparkles } from "lucide-react";

export function WebMCPBadge() {
  const { isAvailable, isInitialized } = useWebMCP();

  // Don't show anything until initialized or if not available
  if (!isInitialized || !isAvailable) return null;

  return (
    <div className="relative group cursor-help ml-2">
      {/* Outer Glow Layer */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

      {/* Main Badge */}
      <div className="relative flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-purple-500/30 rounded-full shadow-sm ring-1 ring-pink-500/10">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
        </div>

        <span className="text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          WEB MCP
        </span>

        <Sparkles className="h-2.5 w-2.5 text-purple-500 animate-pulse" />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          <span className="font-bold text-pink-600 dark:text-pink-400">WebMCP Active:</span> Your
          system tools are registered and ready for AI agents via Chrome 146.
        </p>
      </div>
    </div>
  );
}
