'use client';

import React, { useEffect } from 'react';

export interface ToastNotificationProps {
  message: string | null;
  onDismiss?: () => void;
  durationMs?: number;
  className?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onDismiss,
  durationMs = 2600,
  className = '',
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="toast-notification"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#0E1014]/95 border border-[#181816] text-[#F6F4EE] rounded-full shadow-2xl font-mono text-xs uppercase tracking-wide transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-[#C9F24B] shadow-[0_0_8px_#C9F24B] shrink-0" />
      <span className="font-bold">{message}</span>
    </div>
  );
};
