/**
 * DashboardToast
 *
 * Listens for the custom "dashboard-toast" browser event and renders
 * a floating notification in the bottom-right corner.
 *
 * Toast events are fired like:
 *   window.dispatchEvent(new CustomEvent("dashboard-toast", {
 *     detail: { message: "...", type: "success" | "error" }
 *   }));
 *
 * Features:
 * - Auto-dismisses after 3.5 seconds
 * - Slide-up entry animation (CSS transform)
 * - Accessible via role="status" + aria-live="polite"
 * - Multiple toasts stack vertically
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const AUTO_DISMISS_MS = 3500;

/**
 *
 */
export function DashboardToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    /**
     *
     */
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ message: string; type?: "success" | "error" }>;
      const id = Date.now();
      const type = ev.detail.type ?? "success";

      setToasts((prev) => [...prev, { id, message: ev.detail.message, type }]);

      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    };

    window.addEventListener("dashboard-toast", handler);
    return () => window.removeEventListener("dashboard-toast", handler);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 md:bottom-6 ltr:right-4 md:ltr:right-6 rtl:left-4 md:rtl:left-6 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`
            pointer-events-auto flex items-center gap-3
            rounded-lg border px-4 py-3 shadow-lg
            text-sm font-medium
            animate-in slide-in-from-bottom-2 fade-in duration-200
            ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/80 dark:border-green-800 dark:text-green-200"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-200"
            }
          `}
        >
          <Icon
            name={toast.type === "success" ? "check_circle" : "error"}
            className="shrink-0 text-base"
            aria-hidden="true"
          />
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>
      ))}
    </div>
  );
}
